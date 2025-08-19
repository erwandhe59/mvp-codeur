// ui.js — helpers for sections, modals, toasts, copy/print + micro-interactions + nav fix
export const $ = (sel, parent=document) => parent.querySelector(sel);
export const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];

export function showSection(key){
  $$('#app .section').forEach(s => s.classList.add('hidden'));
  const target = $('#section-'+key);
  target.classList.remove('hidden');
  markNavActive(key);
  updateNavUnderlineToActive();
  const h = target.querySelector('.section-title');
  if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
}

export function show(el){ el.classList.remove('hidden'); }
export function hide(el){ el.classList.add('hidden'); }

export function openModal(id){ $('#'+id).classList.remove('hidden'); }
export function closeModal(id){ $('#'+id).classList.add('hidden'); }
export function attachModalClose(){
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.close));
  });
}

export function toast(msg, timeout=2200){
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(()=> t.classList.add('hidden'), timeout);
}

export async function copyHtmlAsText(el){
  const tmp = document.createElement('div');
  tmp.innerHTML = el.innerHTML;
  await navigator.clipboard.writeText(tmp.textContent.trim());
  toast('Copié dans le presse‑papiers');
}

export function printHtml(html){
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>Export</title>
  <meta charset="utf-8"/>
  <style>
    body{ font-family: Inter, system-ui; line-height:1.6; padding:24px; }
    h1,h2,h3,h4{ margin:10px 0 6px; }
    ul{ margin-left:18px; }
    table{ width:100%; border-collapse:collapse }
    th,td{ border:1px solid #ddd; padding:6px 8px; text-align:left }
  </style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  w.print();
  setTimeout(()=> w.close(), 200);
}

/* Loader skeleton block */
export function skeletonBlock(lines=6){
  const frag = document.createDocumentFragment();
  for(let i=0;i<lines;i++){
    const d = document.createElement('div');
    d.className = 'skeleton';
    d.style.margin = '8px 0';
    frag.appendChild(d);
  }
  return frag;
}

/* ---------- NAV underline (hover fixé + resize) ---------- */
function navEls(){
  const nav = document.querySelector('.nav');
  return {nav, underline: nav?.querySelector('.nav-underline'), items: nav? $$('[data-nav]', nav) : []};
}
export function markNavActive(sectionKey){
  const {items} = navEls(); items.forEach(b=> b.classList.toggle('active', b.dataset.section===sectionKey));
}
export function moveUnderlineTo(el){
  const {nav, underline} = navEls();
  if(!nav || !underline || !el) return;
  const r = el.getBoundingClientRect();
  const nr = nav.getBoundingClientRect();
  underline.style.height = Math.max(32, r.height-8) + 'px';
  underline.style.width  = r.width + 'px';
  underline.style.transform = `translate(${r.left - nr.left}px, ${r.top - nr.top}px)`;
}
export function activeNavBtn(){
  const {items} = navEls(); return items.find(b=> b.classList.contains('active')) || items[0];
}
export function updateNavUnderlineToActive(){ moveUnderlineTo(activeNavBtn()); }

export function enableNavHoverTracking(){
  const {nav, items} = navEls(); if(!nav) return;
  items.forEach(btn=>{
    btn.addEventListener('mouseenter', ()=> moveUnderlineTo(btn));
    btn.addEventListener('click', ()=> { markNavActive(btn.dataset.section); updateNavUnderlineToActive(); });
  });
  nav.addEventListener('mouseleave', updateNavUnderlineToActive);
  window.addEventListener('resize', updateNavUnderlineToActive);
  // parfois les polices changent la largeur
  if ('fonts' in document) document.fonts.addEventListener?.('loadingdone', updateNavUnderlineToActive);
}

/* ---------- Ripple / Parallax (déjà présents) ---------- */
export function enableRipples(){
  $$('.ripple').forEach(el=>{
    el.addEventListener('click', (e)=>{
      const r = el.getBoundingClientRect();
      const span = document.createElement('span');
      span.className = 'rpl';
      const x = e.clientX - r.left, y = e.clientY - r.top;
      span.style.left = x+'px'; span.style.top = y+'px'; span.style.width = span.style.height = Math.max(r.width, r.height)+'px';
      el.appendChild(span);
      span.addEventListener('animationend', ()=> span.remove());
    });
  });
}
export function enableParallax(){
  const a = document.querySelector('.blob-a'), b = document.querySelector('.blob-b'); if(!a || !b) return;
  let cool=0;
  window.addEventListener('mousemove', (e)=>{
    if(performance.now()-cool < 16) return; cool = performance.now();
    const dx = (e.clientX / window.innerWidth - .5);
    const dy = (e.clientY / window.innerHeight - .5);
    a.style.transform = `translate(${dx*10}px, ${dy*10}px)`;
    b.style.transform = `translate(${dx*-12}px, ${dy*-8}px)`;
  }, {passive:true});
}

/* ---------- Auto-init visuals ---------- */
if (document.readyState !== 'loading'){
  enableRipples(); enableParallax(); enableNavHoverTracking(); updateNavUnderlineToActive();
}else{
  document.addEventListener('DOMContentLoaded', ()=>{
    enableRipples(); enableParallax(); enableNavHoverTracking(); updateNavUnderlineToActive();
  });
}
