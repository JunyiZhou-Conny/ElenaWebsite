// Motion is progressive enhancement. Links, content and the stills work without it.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const cleanup = new Set();
addEventListener('blur', () => cleanup.forEach(fn => fn()));
document.addEventListener('visibilitychange', () => { if (document.hidden) cleanup.forEach(fn => fn()); });
reducedMotion.addEventListener('change', () => cleanup.forEach(fn => fn()));

document.querySelectorAll('[data-magnetic]').forEach(anchor => {
  const inner = anchor.querySelector('.magnetic-inner');
  let frame;
  const reset = () => { cancelAnimationFrame(frame); inner.style.transform = ''; anchor.classList.remove('magnetic-active'); };
  cleanup.add(reset);
  anchor.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches) return;
    const box = anchor.getBoundingClientRect();
    const x = clamp((event.clientX - box.left - box.width / 2) * .14, -9, 9);
    const y = clamp((event.clientY - box.top - box.height / 2) * .24, -8, 8);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => { anchor.classList.add('magnetic-active'); inner.style.transform = `translate(${x}px,${y}px)`; });
  });
  anchor.addEventListener('pointerleave', reset);
  anchor.addEventListener('blur', reset);
});

const project = document.querySelector('[data-project]');
const preview = document.querySelector('.floating-preview');
if (project && preview) {
  let frame, x = 0, y = 0, targetX = 0, targetY = 0, active = false;
  const hide = () => { active = false; cancelAnimationFrame(frame); preview.classList.remove('is-visible'); };
  const tick = () => {
    if (!active) return;
    x += (targetX - x) * .17; y += (targetY - y) * .17;
    const tilt = reducedMotion.matches ? 0 : clamp((targetX - x) * .025, -4, 4);
    preview.style.transform = `translate(${x}px,${y}px) rotate(${tilt}deg)`;
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > .15) frame = requestAnimationFrame(tick);
  };
  project.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || innerWidth <= 600) return;
    targetX = clamp(event.clientX + 28, 16, innerWidth - preview.offsetWidth - 20);
    targetY = clamp(event.clientY - preview.offsetHeight / 2, 16, innerHeight - preview.offsetHeight - 20);
    if (!active) { x = targetX; y = targetY; active = true; preview.classList.add('is-visible'); }
    cancelAnimationFrame(frame); frame = requestAnimationFrame(tick);
  });
  project.addEventListener('pointerleave', hide);
  addEventListener('scroll', hide, {passive:true});
  addEventListener('resize', hide);
  cleanup.add(hide);
}

// Explicit handles keep photo swipes available for normal touch scrolling.
function movable(element, handle, stage, enabled = () => true) {
  let x = 0, y = 0, drag = null;
  const cancelAnimation = () => element.getAnimations().forEach(animation => animation.cancel());
  const status = stage.parentElement.querySelector('[data-drag-status]') || document.querySelector('[data-drag-status]');
  const draw = () => { element.style.setProperty('--x', `${x}px`); element.style.setProperty('--y', `${y}px`); };
  const bound = () => {
    const inset = Math.min(24, stage.clientWidth * .05);
    x = clamp(x, inset - element.offsetLeft, stage.clientWidth - element.offsetLeft - element.offsetWidth - inset);
    y = clamp(y, inset - element.offsetTop, stage.clientHeight - element.offsetTop - element.offsetHeight - inset);
    draw();
  };
  const announce = message => { if(status) status.textContent = message; };
  const finish = () => {
    if (!drag) return;
    const id = drag.id, moved = drag.moved;
    drag = null;
    element.classList.remove('is-dragging');
    if(handle.hasPointerCapture(id)) handle.releasePointerCapture(id);
    if(moved) announce('Position changed. Press Escape while focused to reset.');
  };
  const reset = () => { cancelAnimation(); finish(); x = 0; y = 0; if(enabled()) bound(); else draw(); element.style.zIndex = ''; };
  element.addEventListener('focusin', () => {
    stage.querySelectorAll('[data-drag]').forEach(item => { if(item !== element) item.style.zIndex = ''; });
    element.style.zIndex = '5';
  });
  handle.addEventListener('pointerdown', event => {
    if (!enabled() || event.button !== 0 || !event.isPrimary) return;
    cancelAnimation();
    handle.focus({preventScroll:true});
    drag = {id:event.pointerId, startX:event.clientX, startY:event.clientY, x, y, moved:false};
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX, dy = event.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx,dy) < 6) return;
    drag.moved = true;
    element.classList.add('is-dragging');
    stage.querySelectorAll('[data-drag]').forEach(item => { if(item !== element) item.style.zIndex = ''; });
    element.style.zIndex = '5';
    x = drag.x + dx; y = drag.y + dy; bound();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(type => handle.addEventListener(type, finish));
  handle.addEventListener('keydown', event => {
    if (!enabled()) return;
    if(event.key === 'Escape') { event.preventDefault(); reset(); announce('Position reset.'); return; }
    const delta = {ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[event.key];
    if (!delta) return;
    cancelAnimation();
    event.preventDefault(); const step = event.shiftKey ? 30 : 10;
    x += delta[0] * step; y += delta[1] * step; bound();
    announce('Position changed. Press Escape to reset.');
  });
  let stageWidth = stage.clientWidth;
  new ResizeObserver(() => {
    if(stage.clientWidth !== stageWidth) { cancelAnimation(); finish(); stageWidth = stage.clientWidth; }
    if(enabled()) bound();
  }).observe(stage);
  cleanup.add(() => { cancelAnimation(); finish(); });
  return {reset, bound};
}

const stickerStage = document.querySelector('.sticker-stage');
if(stickerStage) {
  const stickers = [...stickerStage.querySelectorAll('[data-drag]')].map(item => {
    item.disabled = false;
    return movable(item,item,stickerStage);
  });
  const reset = document.querySelector('[data-reset-stickers]');
  reset.hidden = false;
  document.querySelector('.drag-hint').hidden = false;
  reset.addEventListener('click', () => stickers.forEach(sticker => sticker.reset()));
}

const photoStage = document.querySelector('.photo-stage');
if(photoStage) {
  const prints = [...photoStage.querySelectorAll('.photo-print')];
  const controllers = prints.map(print => movable(print,print.querySelector('.photo-grip'),photoStage,() => photoStage.dataset.layout === 'desk'));
  const modes = [...document.querySelectorAll('[data-mode]')];
  const hint = document.querySelector('[data-gallery-hint]');
  const reset = document.querySelector('[data-reset-photos]');
  function setMode(mode, animate = true) {
    if(mode === photoStage.dataset.layout && animate) return;
    const before = prints.map(print => print.getBoundingClientRect());
    prints.forEach(print => print.getAnimations().forEach(animation => animation.cancel()));
    controllers.forEach(controller => controller.reset());
    photoStage.dataset.layout = mode;
    modes.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
    prints.forEach(print => {
      print.querySelector('.photo-grip').hidden = mode !== 'desk';
      print.querySelector('.print-open-hint').hidden = mode === 'desk';
    });
    hint.textContent = mode === 'desk' ? 'Drag the handles. Make it your own.' : 'Select a still to look closer.';
    reset.hidden = mode !== 'desk';
    if(mode === 'desk') controllers.forEach(controller => controller.bound());
    if(animate && !reducedMotion.matches) prints.forEach((print,i) => {
      const after = print.getBoundingClientRect();
      const transform = getComputedStyle(print).transform;
      print.animate([
        {transform:`translate(${before[i].left-after.left}px,${before[i].top-after.top}px) ${transform === 'none' ? '' : transform} scale(${before[i].width/after.width},${before[i].height/after.height})`},
        {transform}
      ], {duration:520, easing:'cubic-bezier(.22,1,.36,1)'});
    });
  }
  modes.forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
  reset.addEventListener('click', () => controllers.forEach(controller => controller.reset()));
  document.querySelector('.gallery-controls').hidden = false;
  hint.hidden = false;
  setMode('grid', false);

  const dialog = document.querySelector('.photo-dialog');
  if (dialog && typeof dialog.showModal === 'function') {
    const links = [...document.querySelectorAll('[data-photo]')];
    const display = dialog.querySelector('[data-dialog-image]');
    let index = 0, opener, backdropDown = false;
    const show = next => {
      index = (next + links.length) % links.length;
      display.src = links[index].href;
      display.alt = links[index].querySelector('img').alt;
      dialog.querySelector('[data-photo-caption]').textContent = display.alt;
      dialog.querySelector('[data-photo-count]').textContent = `${String(index+1).padStart(2,'0')} / ${String(links.length).padStart(2,'0')} — GOODBYE, YIWU`;
    };
    links.forEach((link,i) => link.addEventListener('click', event => {
      if(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); opener = link; show(i); dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
    }));
    dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    dialog.querySelector('[data-previous]').addEventListener('click', () => show(index-1));
    dialog.querySelector('[data-next]').addEventListener('click', () => show(index+1));
    dialog.addEventListener('keydown', event => {
      if(event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1)); }
    });
    const isBackdrop = event => {
      const b=dialog.getBoundingClientRect();
      return event.target === dialog && (event.clientX < b.left || event.clientX > b.right || event.clientY < b.top || event.clientY > b.bottom);
    };
    dialog.addEventListener('pointerdown', event => { backdropDown = isBackdrop(event); });
    dialog.addEventListener('pointerup', event => { if(backdropDown && isBackdrop(event)) dialog.close(); backdropDown = false; });
    dialog.addEventListener('close', () => { document.documentElement.style.overflow = ''; opener?.focus({preventScroll:true}); });
  }
}
