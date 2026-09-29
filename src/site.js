let lastTrigger;
function closeFilm(dialog){
 dialog.close();
 dialog.querySelectorAll('iframe').forEach(frame=>frame.remove());
 dialog.querySelectorAll('[data-play], .player-note').forEach(el=>el.hidden=false);
 document.body.classList.remove('dialog-open');
 lastTrigger?.focus({preventScroll:true});
}
document.querySelectorAll('[data-film]').forEach(button=>button.addEventListener('click',()=>{
 const dialog=document.getElementById(button.dataset.film);
 if(!dialog)return;
 lastTrigger=button;
 dialog.showModal();
 dialog.scrollTop=0;
 document.body.classList.add('dialog-open');
}));
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('[data-close]').addEventListener('click',()=>closeFilm(dialog));
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeFilm(dialog);});
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeFilm(dialog);}});
});
document.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',()=>{
 const box=button.closest('[data-player]');
 const frame=document.createElement('iframe');
 frame.src=box.dataset.player+'&autoplay=1&dnt=1';
 frame.title=button.closest('dialog').querySelector('h2').textContent+' — film player';
 frame.allow='autoplay; fullscreen; picture-in-picture';
 frame.allowFullscreen=true;
 frame.referrerPolicy='strict-origin-when-cross-origin';
 button.hidden=true;
 box.querySelector('.player-note').hidden=true;
 box.append(frame);
}));
const toggle=document.querySelector('.motion-toggle');
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
function setMotion(paused){
 document.querySelector('.studio-hero')?.classList.toggle('motion-paused',paused);
 if(toggle){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'Resume image motion':'Pause image motion');toggle.innerHTML=paused?'Resume motion <span aria-hidden="true">▷</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';}
}
if(toggle){setMotion(reduced.matches);toggle.addEventListener('click',()=>setMotion(toggle.getAttribute('aria-pressed')!=='true'));reduced.addEventListener('change',e=>setMotion(e.matches));}
