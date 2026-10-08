// Motion is progressive enhancement. Links, content and the stills work without it.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const cleanup = new Set();
addEventListener('blur', () => cleanup.forEach(fn => fn()));
document.addEventListener('visibilitychange', () => { if (document.hidden) cleanup.forEach(fn => fn()); });
reducedMotion.addEventListener('change', () => cleanup.forEach(fn => fn()));
// iOS Safari only shows :active pressed states when the page listens for touches.
document.addEventListener('touchstart', () => {}, {passive: true});

// Page changes: a shared picture or label that is off screen when the page is left would fly in from far away; let it fade with the page instead.
const shared = '.film-cover, .project-frame, .brand, .nav-works, .nav-contact';
addEventListener('pageswap', event => {
  if (!event.viewTransition) return;
  document.querySelectorAll(shared).forEach(el => { const box = el.getBoundingClientRect(); if (box.bottom < 0 || box.top > innerHeight) el.style.viewTransitionName = 'none'; });
});
addEventListener('pageshow', () => document.querySelectorAll(shared).forEach(el => { el.style.viewTransitionName = ''; }));

// Warm a page while the visitor points at its link, so it is ready when they click.
if (!navigator.connection?.saveData && !/2g/.test(navigator.connection?.effectiveType || '')) {
  const prepared = new Set([location.href]);
  const prepare = event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || anchor.target || anchor.origin !== location.origin || anchor.pathname === location.pathname || prepared.has(anchor.href)) return;
    prepared.add(anchor.href);
    document.head.append(Object.assign(document.createElement('link'), {rel: 'prefetch', href: anchor.href}));
  };
  document.addEventListener('pointerover', prepare, {passive: true});
  document.addEventListener('focusin', prepare);
}

// Labels lean a few pixels toward the pointer. The real link never moves.
document.querySelectorAll('[data-magnetic]').forEach(anchor => {
  const inner = anchor.querySelector('.magnetic-inner');
  const reach = anchor.classList.contains('contact-email') ? 4 : 6;
  let frame;
  const reset = () => { cancelAnimationFrame(frame); inner.style.transform = ''; anchor.classList.remove('magnetic-active'); };
  cleanup.add(reset);
  anchor.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return reset();
    const box = anchor.getBoundingClientRect();
    const x = clamp((event.clientX - box.left) / box.width * 2 - 1, -1, 1) * reach;
    const y = clamp((event.clientY - box.top) / box.height * 2 - 1, -1, 1) * reach;
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { anchor.classList.add('magnetic-active'); inner.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`; });
  });
  anchor.addEventListener('pointerleave', reset);
  anchor.addEventListener('blur', reset);
});

// Works: the hover and focus gesture is plain CSS. On a slow connection the still fades in once decoded instead of painting in strips.
const still = document.querySelector('.project-frame img');
if (still && !still.complete) {
  const show = () => still.classList.remove('is-loading');
  still.classList.add('is-loading');
  still.addEventListener('load', () => still.decode().then(show, show), {once: true});
  still.addEventListener('error', show, {once: true});
}

// Contact: copying the address helps visitors whose mail link opens nothing.
const copy = document.querySelector('[data-copy]');
if (copy && navigator.clipboard && window.isSecureContext) {
  const status = document.querySelector('[data-copy-status]'), label = copy.textContent;
  let restore = 0;
  copy.hidden = false;
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      copy.textContent = 'Copied'; status.textContent = 'Email address copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.querySelector('.contact-email .magnetic-inner'));
      getSelection().removeAllRanges(); getSelection().addRange(range);
      copy.textContent = finePointer.matches ? 'Selected. Press Ctrl or ⌘ and C to copy' : 'Selected. Choose Copy to finish'; status.textContent = 'Email address selected.';
    }
    clearTimeout(restore);
    restore = setTimeout(() => { copy.textContent = label; }, 2400);
  });
}
