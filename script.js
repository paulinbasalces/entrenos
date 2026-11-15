/*
 * Site: Entre Nós — A Biblioteca Viva
 * Interações: tema (localStorage), scroll-spy (dock), reveals, tabs, filtros,
 * accordion, roda de conversas com persistência local.
 * Data: 2026-11-15
 */
(function(){
"use strict";
document.documentElement.classList.add('js');
var $$ = function(s,c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };
var body = document.body;

/* ---------- 1. TEMA ---------- */
var themeBtn = document.getElementById('themeBtn');
function syncThemeLabel(){
  if(themeBtn) themeBtn.setAttribute('aria-label', body.classList.contains('dark-mode') ? 'Ativar modo claro' : 'Ativar modo escuro');
}
if(themeBtn){
  themeBtn.addEventListener('click', function(){
    body.classList.toggle('dark-mode');
    try{ localStorage.setItem('en-theme', body.classList.contains('dark-mode') ? 'dark' : 'light'); }catch(e){}
    syncThemeLabel();
  });
}
syncThemeLabel();

/* ---------- 2. SCROLL ---------- */
var prog = document.getElementById('prog');
var btt = document.getElementById('btt');
var secs = $$('main section[id]');
var navLinks = $$('#docknav a[href^="#"]');
var ticking = false;
function scrollY(){ return window.scrollY || 0; }
function spy(){
  var y = scrollY() + window.innerHeight * 0.28, cur = null;
  for(var i=0;i<secs.length;i++){ if(secs[i].offsetTop <= y) cur = secs[i]; else break; }
  if(!cur && secs.length) cur = secs[0];
  if(cur){ var id='#'+cur.id;
    navLinks.forEach(function(a){ var on=a.getAttribute('href')===id;
      a.classList.toggle('current',on); a.setAttribute('aria-current', on?'true':'false'); });
  }
}
function update(){
  var el=document.documentElement, max=Math.max(1,el.scrollHeight-el.clientHeight);
  var p=Math.min(1,Math.max(0,scrollY()/max));
  if(prog) prog.style.transform='scaleX('+p.toFixed(4)+')';
  if(btt) btt.classList.toggle('show', scrollY()>700);
  spy();
}
window.addEventListener('scroll', function(){
  if(!ticking){ requestAnimationFrame(function(){ update(); ticking=false; }); ticking=true; }
},{passive:true});
if(btt) btt.addEventListener('click', function(){ window.scrollTo({top:0,behavior:'smooth'}); });
update();

/* ---------- 3. REVEAL ---------- */
var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
$$('[data-fx="rise"]').forEach(function(w){
  Array.prototype.forEach.call(w.children, function(ch,i){ ch.style.setProperty('--i', i); });
});
var revs = $$('.reveal');
if(rm || !('IntersectionObserver' in window)){
  revs.forEach(function(el){ el.classList.add('in'); });
}else{
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
  },{threshold:0.08, rootMargin:'0px 0px -40px 0px'});
  revs.forEach(function(el){ io.observe(el); });
  setTimeout(function(){ revs.forEach(function(el){ el.classList.add('in'); }); }, 3000);
}

/* ---------- 4. SPOTLIGHT ---------- */
if(!rm && window.matchMedia('(pointer:fine)').matches){
  var sp = document.createElement('div'); sp.className='spotlight'; sp.setAttribute('aria-hidden','true');
  document.body.appendChild(sp); var sx=0,sy=0,raf=false;
  document.addEventListener('pointermove', function(e){ sx=e.clientX; sy=e.clientY;
    if(!raf){ raf=true; requestAnimationFrame(function(){
      sp.style.transform='translate('+sx+'px,'+sy+'px)'; sp.style.opacity='1'; raf=false; }); }
  });
}

/* ---------- 5. TABS ---------- */
$$('[data-tabs]').forEach(function(wrap){
  var tabs=$$('[role="tab"]',wrap), panels=$$('.tabpanel',wrap);
  function activate(idx,focus){
    if(idx<0||idx>=tabs.length) idx=0;
    tabs.forEach(function(t,i){ var sel=i===idx;
      t.setAttribute('aria-selected', sel?'true':'false'); t.setAttribute('tabindex', sel?'0':'-1'); });
    var targetId=tabs[idx].getAttribute('aria-controls');
    panels.forEach(function(p){ p.classList.toggle('hidden', p.id!==targetId); });
    var panel=document.getElementById(targetId);
    if(panel){ panel.style.animation='none'; void panel.offsetWidth; panel.style.animation=''; }
    if(focus && tabs[idx]) tabs[idx].focus();
  }
  tabs.forEach(function(tab,i){
    tab.addEventListener('click', function(){ activate(i,false); });
    tab.addEventListener('keydown', function(e){
      var k=e.key,n=-1;
      if(k==='ArrowRight') n=(i+1)%tabs.length; else if(k==='ArrowLeft') n=(i-1+tabs.length)%tabs.length;
      else if(k==='Home') n=0; else if(k==='End') n=tabs.length-1;
      if(n>=0){ e.preventDefault(); activate(n,true); }
    });
  });
  var init=tabs.findIndex(function(t){ return t.getAttribute('aria-selected')==='true'; });
  activate(init<0?0:init,false);
});

/* ---------- 6. FILTROS ---------- */
$$('.filterbar').forEach(function(bar){
  var panel=bar.closest('.tabpanel'); if(!panel) return;
  var items=$$('.item',panel), countEl=bar.querySelector('.count');
  function apply(filter){
    var shown=0;
    items.forEach(function(it){
      var tags=(it.getAttribute('data-tags')||'').split(/\s+/);
      var ok=filter==='todos'||tags.indexOf(filter)>=0;
      it.classList.toggle('hide',!ok); if(ok) shown++;
    });
    if(countEl) countEl.textContent='Mostrando '+shown+' de '+items.length+' itens';
  }
  var pills=$$('.fpill',bar);
  pills.forEach(function(btn){
    btn.addEventListener('click', function(){
      pills.forEach(function(p){ p.setAttribute('aria-pressed','false'); });
      btn.setAttribute('aria-pressed','true');
      apply(btn.getAttribute('data-filter'));
    });
  });
  var active=bar.querySelector('.fpill[aria-pressed="true"]');
  apply(active ? active.getAttribute('data-filter') : 'todos');
});

/* ---------- 7. ACCORDION FAQ ---------- */
$$('.acc-btn').forEach(function(btn){
  btn.addEventListener('click', function(){
    var panel=document.getElementById(btn.getAttribute('aria-controls'));
    if(!panel) return;
    var open=btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.style.maxHeight = open ? '0' : panel.scrollHeight + 'px';
  });
});
window.addEventListener('resize', function(){
  $$('.acc-btn[aria-expanded="true"]').forEach(function(btn){
    var panel=document.getElementById(btn.getAttribute('aria-controls'));
    if(panel) panel.style.maxHeight=panel.scrollHeight+'px';
  });
});

/* ---------- 8. TOAST ---------- */
function showToast(msg){
  var t=document.getElementById('toast'); if(!t) return;
  t.textContent=msg; t.classList.add('show');
  clearTimeout(t._h); t._h=setTimeout(function(){ t.classList.remove('show'); },3500);
}

/* ---------- 9. RODA DE CONVERSAS (persistência local) ---------- */
var thread=document.getElementById('thread'), forumForm=document.getElementById('forumForm');
function store(){ try{ return JSON.parse(localStorage.getItem('en-forum')||'[]'); }catch(e){ return []; } }
function renderStored(){
  store().forEach(function(m){ thread.appendChild(buildMsg(m.text,m.when)); });
}
function buildMsg(text,when){
  var art=document.createElement('article'); art.className='msg enter';
  var av=document.createElement('span'); av.className='avatar av4'; av.setAttribute('aria-hidden','true'); av.textContent='VC';
  var box=document.createElement('div');
  var head=document.createElement('div'); head.className='head';
  var nm=document.createElement('span'); nm.className='nm'; nm.textContent='Você';
  var tm=document.createElement('span'); tm.className='tm'; tm.textContent=when||'agora';
  var p=document.createElement('p'); p.textContent=text;
  head.appendChild(nm); head.appendChild(tm); box.appendChild(head); box.appendChild(p);
  art.appendChild(av); art.appendChild(box); return art;
}
if(forumForm && thread){
  renderStored();
  forumForm.addEventListener('submit', function(e){
    e.preventDefault();
    var input=document.getElementById('msgInput'), status=document.getElementById('forumStatus');
    var txt=input.value.trim();
    if(!txt){ status.textContent='Escreva algo antes de enviar para a roda.'; status.className='status err'; return; }
    var list=store(); list.push({text:txt,when:'agora'});
    try{ localStorage.setItem('en-forum',JSON.stringify(list)); }catch(e2){}
    thread.appendChild(buildMsg(txt));
    input.value=''; status.textContent='Sua voz entrou na roda.'; status.className='status';
    showToast('Mensagem adicionada à conversa (armazenada só neste navegador).');
  });
}
})();