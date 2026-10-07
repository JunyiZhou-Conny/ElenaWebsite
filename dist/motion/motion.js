// Motion is progressive enhancement. Links, content and the stills work without it.
const root = document.documentElement;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
// One timing family, defined once in motion.css (--motion-settle, --motion-layout, --ease-out), shared with the CSS transitions.
const tokens = getComputedStyle(root);
const ms = (name, fallback) => { const value = tokens.getPropertyValue(name).trim(), n = parseFloat(value); return !Number.isFinite(n) ? fallback : /ms$/.test(value) || !/s$/.test(value) ? n : n * 1000; };
const SETTLE = ms('--motion-settle', 320), LAYOUT = ms('--motion-layout', 420);
const EASE = tokens.getPropertyValue('--ease-out').trim() || 'cubic-bezier(.22,1,.36,1)';
const animated = () => !reducedMotion.matches;
const cleanup = new Set();
let quietEscapeUntil = 0;
addEventListener('blur', () => cleanup.forEach(fn => fn()));
document.addEventListener('visibilitychange', () => { if (document.hidden) cleanup.forEach(fn => fn()); });
reducedMotion.addEventListener('change', () => { cleanup.forEach(fn => fn()); if (reducedMotion.matches) document.getAnimations().forEach(animation => animation.finish()); });
// iOS Safari only shows :active pressed states when the page listens for touches.
document.addEventListener('touchstart', () => {}, {passive: true});

// Warm a page while the visitor points at its link, so it is ready when they click.
if (!navigator.connection?.saveData && !/2g/.test(navigator.connection?.effectiveType || '')) {
  const prepared = new Set([location.href]);
  const prepare = event => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('data-photo') || anchor.origin !== location.origin || anchor.pathname === location.pathname || prepared.has(anchor.href)) return;
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

// Dragging. A held object follows the pointer exactly; easing is only for objects nobody is holding.
// `handle` always picks the object up. With `surface`, a mouse or pen can also pick it up anywhere,
// while touch keeps to the handle so a swipe over a photo still scrolls the page.
function movable(element, {handle = element, stack, limits, measure = () => element.getBoundingClientRect(), enabled = () => true, surface = false, onPickup, onDrop, onChange, onKeySettle}) {
  let x = 0, y = 0, shown = [0, 0], drag = null, flight = null, settling = 0, keyed = false, swallowClick = false;
  const status = element.closest('section, main').querySelector('[data-drag-status]');
  const announce = message => { if (status) status.textContent = message; };
  const draw = () => { shown = [x, y]; element.style.setProperty('--x', `${x}px`); element.style.setProperty('--y', `${y}px`); };
  const raise = () => { element.style.zIndex = ++stack.z; };
  const fly = (frames, options) => { flight?.cancel(); flight = element.animate(frames, options); return flight; };
  const flying = () => flight && flight.playState !== 'finished';
  // Jump a flight to its end state (used before layout changes; the offsets already hold the destination).
  const stop = () => { flight?.cancel(); flight = null; finish(); };
  // Keep a flight where it currently is, so grabbing a moving object never makes it jump.
  const land = () => {
    if (!flying()) return;
    const now = new DOMMatrix(getComputedStyle(element).transform);
    flight.cancel(); flight = null; x = now.e; y = now.f; draw();
  };
  const bound = () => {
    if (!enabled()) return false;
    // The box on screen still shows the last drawn offset; measure the edges from there.
    const box = measure(), area = limits();
    const nx = clamp(x, shown[0] + area.left - box.left, shown[0] + area.right - box.right);
    const ny = clamp(y, shown[1] + area.top - box.top, shown[1] + area.bottom - box.bottom);
    const changed = nx !== x || ny !== y;
    x = nx; y = ny; draw();
    return changed;
  };
  // Glide from whatever is on screen now, including a flight in progress, so nothing snaps first.
  const glideTo = (nx, ny) => {
    const from = getComputedStyle(element).transform;
    flight?.cancel(); flight = null;
    x = nx; y = ny; draw();
    const to = getComputedStyle(element).transform;
    if (animated() && from !== to) fly([{transform: from}, {transform: to}], {duration: SETTLE, easing: EASE});
  };
  const nudge = (dx, dy, smooth = true) => { if (smooth) return glideTo(x + dx, y + dy); x += dx; y += dy; draw(); };
  const settle = touch => {
    element.classList.add('is-settling');
    element.dataset.settling = touch ? 'touch' : 'pointer';
    clearTimeout(settling);
    settling = setTimeout(() => element.classList.remove('is-settling'), SETTLE * 2);
  };
  const begin = event => {
    swallowClick = false;
    if (!enabled() || event.button !== 0 || !event.isPrimary) return;
    const onHandle = handle.contains(event.target);
    if (!onHandle && !(surface && event.pointerType !== 'touch')) return;
    raise(); keyed = false;
    clearTimeout(settling); element.classList.remove('is-settling');
    drag = {id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, lastY: event.clientY, x, y, slipX: 0, slipY: 0, moved: false, touch: event.pointerType === 'touch', threshold: event.pointerType === 'touch' ? 10 : 6};
    element.classList.add('is-held');
    onPickup?.();
    // A handle owns the gesture at once. Elsewhere, wait for real movement so an ordinary click still opens the photo.
    if (onHandle) element.setPointerCapture(event.pointerId);
    addEventListener('pointermove', track);
    addEventListener('pointerup', finish);
    addEventListener('pointercancel', finish);
  };
  // Past an edge the object waits, then answers the moment the pointer turns back,
  // moving at half speed until the hand is over the spot it grabbed again.
  const ease = (slip, step) => slip && Math.sign(step) === Math.sign(slip) ? Math.sign(slip) * Math.max(0, Math.abs(slip) - Math.abs(step) / 2) : slip;
  const track = event => {
    if (!drag || event.pointerId !== drag.id) return;
    if (!enabled()) return finish();
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    const stepX = event.clientX - drag.lastX, stepY = event.clientY - drag.lastY;
    drag.lastX = event.clientX; drag.lastY = event.clientY;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < drag.threshold) return;
      drag.moved = true;
      element.classList.add('is-dragging');
      if (!element.hasPointerCapture(drag.id)) element.setPointerCapture(drag.id);
      // Only a real drag interrupts a glide; a press on a moving object lets it finish.
      if (flying()) { land(); drag.x = x - dx; drag.y = y - dy; }
    }
    drag.slipX = ease(drag.slipX, stepX); drag.slipY = ease(drag.slipY, stepY);
    const idealX = drag.x + dx, idealY = drag.y + dy;
    x = idealX + drag.slipX; y = idealY + drag.slipY;
    bound();
    drag.slipX = x - idealX; drag.slipY = y - idealY;
  };
  function finish(event) {
    if (!drag || (event?.pointerId !== undefined && event.pointerId !== drag.id)) return;
    const {id, moved, touch} = drag;
    drag = null;
    removeEventListener('pointermove', track);
    removeEventListener('pointerup', finish);
    removeEventListener('pointercancel', finish);
    if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
    element.classList.remove('is-held', 'is-dragging');
    if (!moved) { onChange?.(); return onDrop?.(false); }
    swallowClick = true;
    settle(touch);
    const spot = onDrop?.(true);
    if (spot) nudge(...spot);
    announce('Moved. Press Escape to put it back.');
    onChange?.();
  }
  const reset = () => {
    keyed = false;
    if (drag) finish();
    if (x || y) glideTo(0, 0);
    element.style.zIndex = '';
  };
  element.addEventListener('pointerdown', begin);
  element.addEventListener('lostpointercapture', event => { if (drag?.moved) finish(event); });
  element.addEventListener('pointerleave', () => { if (!drag && element.dataset.settling !== 'touch') element.classList.remove('is-settling'); });
  element.addEventListener('pointermove', () => { if (!drag && element.matches(':hover')) element.classList.remove('is-settling'); });
  // After a drag the pointer is released over the object; that release must not also count as a click.
  element.addEventListener('click', event => { if (swallowClick) { event.preventDefault(); event.stopPropagation(); } swallowClick = false; }, true);
  element.addEventListener('focusin', raise);
  // Escape works wherever focus sits inside the object, including a photo just dragged with the mouse,
  // but not the Escape that just closed the viewer, nor a held-down key.
  element.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.repeat || performance.now() < quietEscapeUntil || !enabled() || !(x || y)) return;
    event.preventDefault(); reset(); announce('Put back.'); onChange?.();
  });
  handle.addEventListener('keydown', event => {
    if (!enabled()) return;
    if (event.key === ' ' || event.key === 'Enter') { event.preventDefault(); return announce('Use the arrow keys to move it. Shift moves further. Escape puts it back.'); }
    const delta = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if (!delta) return;
    event.preventDefault(); land(); raise();
    const step = event.shiftKey ? 30 : 10, before = [x, y];
    x += delta[0] * step; y += delta[1] * step; bound();
    if (Math.abs(x - before[0]) + Math.abs(y - before[1]) < .5) return announce('It cannot go further that way.');
    announce('Moved. Press Escape to put it back.');
    onChange?.();
    keyed = true;
  });
  // A keyboard placement is settled when focus moves on, never while the visitor is still placing it.
  handle.addEventListener('focusout', () => { if (keyed && !drag && !flying() && (x || y)) onKeySettle?.(); keyed = false; });
  cleanup.add(() => finish());
  return {reset, bound, glideTo, nudge, stop, land, fly, flying, moved: () => Boolean(x || y)};
}

// Home stickers: three small objects from the film. They roam the page, but never come to rest on the words.
const stickerStage = document.querySelector('.sticker-stage');
if (stickerStage) {
  const main = stickerStage.closest('main');
  const stickers = [...stickerStage.querySelectorAll('[data-drag]')];
  const hint = document.querySelector('.drag-hint'), putBack = document.querySelector('[data-reset-stickers]');
  const status = main.querySelector('[data-drag-status]');
  const stack = {z: 0}, gutter = 16;
  const limits = () => { const m = main.getBoundingClientRect(); return {left: gutter, right: root.clientWidth - gutter, top: m.top + gutter, bottom: m.bottom - gutter}; };
  const grow = (r, n) => new DOMRect(r.left - n, r.top - n, r.width + n * 2, r.height + n * 2);
  // The words themselves, line by line, not the boxes around them.
  const textRects = element => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT), rects = [];
    for (let node; (node = walker.nextNode());) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(node);
      rects.push(...range.getClientRects());
    }
    return rects;
  };
  const zones = () => [
    ...[...main.querySelectorAll('.navigation-home > a, .navigation-home > .line, .home-note .text-button:not([hidden])')].map(el => el.getBoundingClientRect()),
    ...[...main.querySelectorAll('.company-intro, .home-note')].flatMap(textRects)
  ].filter(r => r.width && r.height).map(r => grow(r, 6));
  const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  // The drawn object fills roughly the middle 70% of each square sticker image.
  const artwork = sticker => { const box = sticker.getBoundingClientRect(), size = sticker.offsetWidth * .7; return new DOMRect(box.left + box.width / 2 - size / 2, box.top + box.height / 2 - size / 2, size, size); };
  // Search outward for the nearest spot that keeps the words (and the caption that appears under a sticker) clear,
  // preferring not to touch the other stickers either.
  const clearSpot = sticker => {
    const art = artwork(sticker), area = art.width * art.height, words = zones(), page = limits(), tail = sticker.offsetWidth * .15 + 20;
    const others = stickers.filter(other => other !== sticker).map(artwork);
    const blocked = (dx, dy, [wordShare, stickerShare]) => {
      const r = new DOMRect(art.x + dx, art.y + dy, art.width, art.height), withCaption = new DOMRect(r.x, r.y, r.width, r.height + tail);
      return r.left < page.left || r.right > page.right || r.top < page.top || r.bottom > page.bottom
        || words.some(zone => overlap(withCaption, zone) > area * wordShare) || others.some(other => overlap(r, other) > area * stickerShare);
    };
    if (!blocked(0, 0, [0, .15])) return null;
    for (const allowance of [[0, 0], [0, .15], [.01, .15]]) for (let distance = 8; distance < 900; distance += 8) for (let step = 0; step < 24; step++) {
      const angle = step / 24 * Math.PI * 2, dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance;
      if (!blocked(dx, dy, allowance)) return [dx, dy];
    }
    return null;
  };
  // While held or gliding, stickers travel above the navigation; at rest they sit below it.
  let lowering = 0;
  const hold = () => { clearTimeout(lowering); stickerStage.classList.add('is-holding'); };
  const lower = (delay = SETTLE) => { clearTimeout(lowering); lowering = setTimeout(() => stickerStage.classList.remove('is-holding'), delay); };
  const sync = () => { const moved = controllers.some(c => c.moved()); hint.hidden = moved; putBack.hidden = !moved; };
  const controllers = stickers.map(sticker => {
    sticker.setAttribute('role', 'button');
    sticker.setAttribute('aria-label', `Move the ${sticker.dataset.label} sticker`);
    sticker.setAttribute('aria-describedby', 'sticker-help');
    sticker.tabIndex = 0;
    const controller = movable(sticker, {stack, limits, onPickup: hold, onChange: sync,
      // Show "Put them back" first, so the landing spot keeps it clear too.
      onDrop: moved => { if (moved) sync(); const spot = moved ? clearSpot(sticker) : null; lower(spot || controller.flying() ? SETTLE : 0); return spot; },
      onKeySettle: () => { const spot = clearSpot(sticker); if (spot) { hold(); controller.nudge(...spot); lower(); status.textContent = 'Moved clear of the words.'; } }});
    return controller;
  });
  // When the window changes size, moved stickers stay on the page and off the words.
  let resizing = 0;
  addEventListener('resize', () => { cancelAnimationFrame(resizing); resizing = requestAnimationFrame(() => controllers.forEach((c, i) => {
    if (!c.moved() || c.flying()) return;
    c.bound();
    const spot = clearSpot(stickers[i]);
    if (spot) c.nudge(...spot, false);
  })); });
  hint.hidden = false;
  putBack.addEventListener('click', () => {
    const hadFocus = document.activeElement === putBack;
    hold();
    controllers.forEach(c => c.reset());
    lower();
    stack.z = 0; sync();
    status.textContent = 'All three stickers are back in place.';
    if (hadFocus) stickers[0].focus({preventScroll: true});
  });
}

// Film stills: Grid for looking, Desk for arranging prints like photographs on a table.
const photoStage = document.querySelector('.photo-stage');
if (photoStage) {
  const prints = [...photoStage.querySelectorAll('.photo-print')];
  const modes = [...document.querySelectorAll('[data-mode]')];
  const hint = document.querySelector('[data-gallery-hint]');
  const reset = document.querySelector('[data-reset-photos]');
  const desk = () => photoStage.dataset.layout === 'desk';
  const stack = {z: 0};
  const limits = () => { const box = photoStage.getBoundingClientRect(), inset = Math.min(12, box.width * .03); return {left: box.left + inset, right: box.right - inset, top: box.top + inset, bottom: box.bottom - inset}; };
  const sync = () => {
    const show = desk() && controllers.some(c => c.moved());
    if (!show && document.activeElement === reset) modes.find(button => button.dataset.mode === 'desk').focus({preventScroll: true});
    // Reset keeps its place when hidden, so the Grid / Desk switch never shifts under the pointer.
    reset.classList.toggle('is-concealed', !show);
    reset.disabled = !show;
  };
  const controllers = prints.map(print => { const paper = print.querySelector('.print-paper'); return movable(print, {handle: print.querySelector('.photo-grip'), stack, limits, measure: () => paper.getBoundingClientRect(), enabled: desk, surface: true, onChange: sync}); });
  // Keep moved prints inside the desk, but never while the desk itself is changing height mid-animation.
  let stageFlight = null;
  const keepInside = () => controllers.forEach(c => { if (c.moved()) c.bound(); });
  new ResizeObserver(() => { if (stageFlight?.playState !== 'running') keepInside(); }).observe(photoStage);
  function setMode(mode, animate = true) {
    if (mode === photoStage.dataset.layout && animate) return;
    const before = prints.map(print => print.getBoundingClientRect()), height = photoStage.offsetHeight;
    controllers.forEach(c => c.stop());
    photoStage.dataset.layout = mode;
    modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    prints.forEach(print => {
      print.querySelector('.photo-grip').hidden = mode !== 'desk';
      print.querySelector('.print-open-hint').hidden = mode === 'desk';
    });
    hint.textContent = mode !== 'desk' ? 'Select a still to look closer.' : finePointer.matches ? 'Drag a print to arrange it. Click a photo to enlarge it.' : 'Use Move to arrange a print. Tap a photo to enlarge it.';
    sync();
    stageFlight?.cancel();
    if (mode === 'desk') keepInside();
    if (!animate || !animated()) return;
    // FLIP: each print starts where it was on screen and travels to its new place, together with the paper's turn.
    const after = prints.map(print => print.getBoundingClientRect());
    stageFlight = photoStage.animate({height: [`${height}px`, `${photoStage.offsetHeight}px`]}, {duration: LAYOUT, easing: EASE});
    stageFlight.finished.then(() => { if (desk()) keepInside(); }, () => {});
    prints.forEach((print, i) => {
      const transform = getComputedStyle(print).transform, base = transform === 'none' ? '' : transform;
      controllers[i].fly([
        {transform: `translate(${before[i].left - after[i].left}px,${before[i].top - after[i].top}px) ${base} scale(${before[i].width / after[i].width})`},
        {transform: base || 'none'}
      ], {duration: LAYOUT, easing: EASE});
    });
  }
  modes.forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  reset.addEventListener('click', () => { controllers.forEach(c => c.reset()); stack.z = 0; sync(); });
  document.querySelector('.gallery-controls').hidden = false;
  hint.hidden = false;
  setMode('grid', false);

  const dialog = document.querySelector('.photo-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    const links = [...document.querySelectorAll('[data-photo]')];
    const frame = dialog.querySelector('[data-dialog-frame]');
    const caption = dialog.querySelector('[data-photo-caption]'), count = dialog.querySelector('[data-photo-count]'), live = dialog.querySelector('[data-photo-status]');
    const filmTitle = dialog.dataset.filmTitle.toUpperCase();
    // Decoded pictures are kept, so a still seen or warmed once comes back instantly.
    const pictures = new Map();
    const picture = url => {
      if (!pictures.has(url)) { const img = new Image(); img.width = 1600; img.height = 900; img.alt = ''; img.src = url; pictures.set(url, {img, ready: img.decode().then(() => img, () => img)}); }
      return pictures.get(url);
    };
    let index = 0, current = {i: -1, large: false}, opener, backdropDown = false, swipe = null, speaking = 0;
    const swap = (img, i, large) => {
      if (index !== i || !img.naturalWidth || (current.i === i && (current.large || !large) && frame.firstChild === img)) return;
      if (current.i === i && current.large && !large) return;
      img.alt = links[i].querySelector('img').alt;
      frame.replaceChildren(img);
      frame.classList.remove('is-stale');
      current = {i, large};
    };
    // A picture replaces the one on screen only once it is decoded, so the frame is never blank;
    // until then the previous picture dims, so it is never mistaken for the new caption.
    const put = (url, i, large) => { const {img, ready} = picture(url); if (img.complete && img.naturalWidth) { swap(img, i, large); return Promise.resolve(); } return ready.then(() => swap(img, i, large)); };
    const show = (next, speak = true) => {
      const i = index = (next + links.length) % links.length;
      const thumb = links[i].querySelector('img');
      frame.classList.toggle('is-stale', current.i !== i);
      caption.textContent = thumb.alt;
      count.textContent = `${String(i + 1).padStart(2, '0')} / ${String(links.length).padStart(2, '0')} — ${filmTitle}`;
      clearTimeout(speaking);
      speaking = setTimeout(() => { live.textContent = `Still ${i + 1} of ${links.length}. ${thumb.alt}`; }, speak ? 0 : 150);
      // The large file shows at once if it is already decoded; otherwise the still already on the page goes up first,
      // the large file follows, and then the neighbours are warmed.
      const large = picture(links[i].href).img;
      if (large.complete && large.naturalWidth) swap(large, i, true);
      else if (thumb.complete && thumb.naturalWidth) put(thumb.currentSrc || thumb.src, i, false);
      else { thumb.loading = 'eager'; thumb.addEventListener('load', () => put(thumb.currentSrc || thumb.src, i, false), {once: true}); }
      put(links[i].href, i, true).then(() => [i + 1, i - 1].forEach(n => picture(links[(n + links.length) % links.length].href)));
    };
    links.forEach((link, i) => link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); opener = link; show(i, false); dialog.showModal();
      root.style.overflow = 'hidden';
    }));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-previous]').addEventListener('click', () => show(index - 1));
    dialog.querySelector('[data-next]').addEventListener('click', () => show(index + 1));
    dialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    // A sideways swipe on a touch screen moves between stills; vertical swipes still scroll.
    frame.addEventListener('pointerdown', event => { swipe = event.pointerType === 'touch' ? [event.clientX, event.clientY] : null; });
    frame.addEventListener('pointercancel', () => { swipe = null; });
    frame.addEventListener('pointerup', event => {
      if (!swipe) return;
      const dx = event.clientX - swipe[0], dy = event.clientY - swipe[1];
      swipe = null;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) show(index + (dx < 0 ? 1 : -1));
    });
    const isBackdrop = event => {
      const b = dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom);
    };
    // Close on the click itself (not on pointer release), so a tap outside never lands on the page underneath.
    dialog.addEventListener('pointerdown', event => { backdropDown = isBackdrop(event); });
    dialog.addEventListener('click', event => { if (backdropDown && isBackdrop(event)) dialog.close(); backdropDown = false; });
    dialog.addEventListener('close', () => { quietEscapeUntil = performance.now() + 500; root.style.overflow = ''; clearTimeout(speaking); live.textContent = ''; opener?.focus({preventScroll: true}); });
  }
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
