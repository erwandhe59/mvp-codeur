// app.js — contrôleur: auth, routing, UI agents, génération, historique, réglages, chat
import {
    $, $$, show, hide, openModal, closeModal, attachModalClose, toast,
    copyHtmlAsText, printHtml, enableNavHoverTracking, updateNavUnderlineToActive,
    markNavActive, showSection // <-- FIX: on importe showSection
  } from './ui.js';
  import { AGENTS, generate, buildPrompt, chatHello, chatMockReply, callLLM } from './agents.js';
  
  /* ---------- Boot ---------- */
  const state = {
    user: null,
    prefs: { tone:'neutre', detail:'moyen' },
    api:   { key:'', url:'', model:'' },
    mock:  true,
    currentAgent: null,
    history: JSON.parse(localStorage.getItem('immo.history')||'[]')
  };
  document.addEventListener('DOMContentLoaded', init);
  
  function init(){
    // année footer
    $('#year').textContent = new Date().getFullYear();
    attachModalClose();
    enableNavHoverTracking(); updateNavUnderlineToActive();
  
    // Auth bootstrap
    const saved = JSON.parse(localStorage.getItem('immo.user')||'null');
    if(saved){ state.user = saved; showApp(); } else { showLanding(); }
  
    // Landing CTA
    $('#openLogin').addEventListener('click', ()=> openModal('authModal'));
    $('#openSignup').addEventListener('click', ()=> openModal('authModal'));
    $('#loginBtn').addEventListener('click', doLogin);
    $('#signupBtn').addEventListener('click', doLogin);
  
    // Nav
    $$('.nav-btn').forEach(b=> b.addEventListener('click', ()=> showSection(b.dataset.section)));
  
    // Settings
    $('#mockToggle').checked = state.mock;
    $('#mockToggle').addEventListener('change', (e)=> state.mock = e.target.checked);
    $('#tone').value = state.prefs.tone;
    $('#detail').value = state.prefs.detail;
    $('#tone').addEventListener('change', e=> state.prefs.tone = e.target.value);
    $('#detail').addEventListener('change', e=> state.prefs.detail = e.target.value);
    $('#saveSettings').addEventListener('click', ()=>{
      state.api.key = $('#apiKey').value.trim();
      state.api.url = $('#apiUrl').value.trim();
      state.api.model = $('#apiModel').value.trim();
      toast('Réglages enregistrés');
    });
  
    // Logout
    $('#logoutBtn').addEventListener('click', ()=>{
      state.user=null; localStorage.removeItem('immo.user'); showLanding();
    });
  
    // History search (light)
    $('#historySearch').addEventListener('input', renderHistory);
  
    // Build agents grid
    renderAgents();
    renderHistory();
  }
  
  /* ---------- Auth ---------- */
  function doLogin(){
    const email = $('#authEmail').value.trim();
    if(!email){ toast('Email requis'); return; }
    state.user = { email };
    localStorage.setItem('immo.user', JSON.stringify(state.user));
    closeModal('authModal'); showApp();
  }
  function showLanding(){ show($('#landing')); hide($('#app')); hide($('#appHeader')); }
  function showApp(){ hide($('#landing')); show($('#app')); show($('#appHeader')); markNavActive('agents'); }
  
  /* ---------- Agents Grid ---------- */
  function renderAgents(){
    const grid = $('#agentsGrid'); grid.innerHTML='';
    AGENTS.forEach(agent=>{
      const card = document.createElement('div');
      card.className = 'card agent-card';
      card.innerHTML = `
        <img src="${agent.avatar}" alt="">
        <div>
          <h3>${agent.name}</h3>
          <p>${agent.tagline}</p>
        </div>
        <div class="card-actions">
          <button class="btn soft open ripple">Ouvrir</button>
        </div>`;
      card.querySelector('.open').addEventListener('click', ()=> openAgent(agent));
      grid.appendChild(card);
    });
  }
  
  function openAgent(agent){
    state.currentAgent = agent;
    $('#workAvatar').src = agent.avatar;
    $('#workName').textContent = agent.name;
    $('#workTagline').textContent = agent.tagline;
  
    // Tabs: default to form
    setMode('form');
    $$('.work-tabs .tab').forEach(t=>{
      t.classList.toggle('active', t.dataset.mode==='form');
      t.onclick = ()=> setMode(t.dataset.mode);
    });
  
    // Character in chat
    $('#chatCharacter').innerHTML = agent.character;
    $('#chatTitle').textContent = agent.name;
    $('#chatDesc').textContent = agent.tagline;
  
    // Build form
    buildForm(agent);
    // Reset outputs & chat
    $('#resultCard').classList.add('hidden');
    clearChat(true);
  
    show($('#workPanel'));
    $('#closePanel').onclick = ()=> hide($('#workPanel'));
  }
  
  /* ---------- Tabs ---------- */
  function setMode(mode){
    if(mode==='chat'){
      $('#agentForm').classList.add('hidden');
      $('#formActions').classList.add('hidden');
      $('#chatPane').classList.remove('hidden');
    }else{
      $('#chatPane').classList.add('hidden');
      $('#agentForm').classList.remove('hidden');
      $('#formActions').classList.remove('hidden');
    }
    $$('.work-tabs .tab').forEach(t=> t.classList.toggle('active', t.dataset.mode===mode));
  }
  
  /* ---------- Form building & generation ---------- */
  function buildForm(agent){
    const form = $('#agentForm'); form.innerHTML='';
    for(const f of agent.fields){
      const wrap = document.createElement('label');
      wrap.innerHTML = `<span class="label">${f.label}${f.required? ' *':''}</span>`;
      let field;
      if(f.type==='select'){
        field = document.createElement('select'); field.className='input'; field.name = f.name;
        (f.options||[]).forEach(opt=>{
          const o=document.createElement('option'); o.value=opt; o.textContent=opt; field.appendChild(o);
        });
      }else if(f.type==='textarea'){
        field = document.createElement('textarea'); field.className='input'; field.name=f.name; field.placeholder=f.placeholder||'';
      }else{
        field = document.createElement('input'); field.className='input'; field.name=f.name; field.type=f.type||'text';
        if(f.placeholder) field.placeholder=f.placeholder;
      }
      if(f.required) field.required = true;
      wrap.appendChild(field); form.appendChild(wrap);
    }
    $('#generateBtn').onclick = onGenerate;
    $('#clearBtn').onclick = ()=> form.reset();
    // result actions
    $('#copyBtn').onclick = ()=> copyHtmlAsText($('#resultContent'));
    $('#printBtn').onclick = ()=> printHtml($('#resultContent').innerHTML);
    $('#saveBtn').onclick = saveCurrentResult;
  }
  
  async function onGenerate(e){
    e.preventDefault();
    const form = $('#agentForm');
    const fd = Object.fromEntries(new FormData(form).entries());
    const html = await generate(state.currentAgent.id, fd, state.prefs, state.mock, state.api);
    $('#resultContent').innerHTML = html;
    $('#resultCard').classList.remove('hidden');
  }
  
  /* ---------- Historique ---------- */
  function saveCurrentResult(){
    const title = `${state.currentAgent?.name||'Agent'} — ${new Date().toLocaleString('fr-FR')}`;
    const item = { id: Date.now(), title, html: $('#resultContent').innerHTML };
    state.history.unshift(item);
    localStorage.setItem('immo.history', JSON.stringify(state.history));
    toast('Enregistré dans l’historique'); renderHistory();
  }
  function renderHistory(){
    const q = ($('#historySearch').value||'').toLowerCase();
    const list = $('#historyList'); list.innerHTML='';
    state.history.filter(it=> it.title.toLowerCase().includes(q)).forEach(it=>{
      const div = document.createElement('div');
      div.className='item';
      div.innerHTML = `<div>
          <strong>${it.title}</strong>
          <div class="meta">${new Date(it.id).toLocaleString('fr-FR')}</div>
        </div>
        <div class="actions">
          <button class="btn tiny outline">Voir</button>
          <button class="btn tiny outline">Supprimer</button>
        </div>`;
      const [btnView, btnDel] = div.querySelectorAll('button');
      btnView.onclick = ()=>{
        // on revient dans la section Agents et on montre le dernier résultat sauvegardé
        showSection('agents');
        $('#resultContent').innerHTML = it.html; $('#resultCard').classList.remove('hidden');
      };
      btnDel.onclick = ()=>{
        state.history = state.history.filter(x=> x.id!==it.id);
        localStorage.setItem('immo.history', JSON.stringify(state.history));
        renderHistory();
      };
      list.appendChild(div);
    });
  }
  
  /* ---------- Chatbot ---------- */
  let chat = [];
  function clearChat(init=false){
    chat = [];
    $('#chatStream').innerHTML='';
    if(!state.currentAgent) return;
    const hello = chatHello(state.currentAgent.id);
    pushBot(hello);
    if(init) scrollChat();
  }
  function pushUser(text){
    chat.push({role:'user', content:text});
    addMsg('user', text);
  }
  function pushBot(text){
    chat.push({role:'assistant', content:text});
    addMsg('bot', text);
  }
  function addMsg(role, text){
    const row = document.createElement('div');
    row.className = `msg ${role}`;
    const avatar = document.createElement('div'); avatar.className='avatar';
    if(role==='bot'){ avatar.innerHTML = state.currentAgent?.character || ''; }
    const bubble = document.createElement('div'); bubble.className='bubble'; bubble.innerHTML = sanitize(text);
    if(role==='user'){ row.appendChild(bubble); row.appendChild(avatar); }
    else{ row.appendChild(avatar); row.appendChild(bubble); }
    $('#chatStream').appendChild(row); scrollChat();
  }
  function scrollChat(){ const s = $('#chatStream'); s.scrollTop = s.scrollHeight; }
  
  function sanitize(s){ // very light markdown -> strong
    return (s||'').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  }
  
  $('#chatForm')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const txt = $('#chatInput').value.trim(); if(!txt) return;
    $('#chatInput').value = '';
    pushUser(txt);
  
    if(state.mock){
      await wait(250);
      pushBot(chatMockReply(state.currentAgent.id, txt));
    }else{
      const prompt = `[Mode: chat ${state.currentAgent.id}] Contexte:\n` +
        chat.map(m=> `${m.role.toUpperCase()}: ${m.content}`).join('\n') +
        `\nRéponds brièvement en français.`;
      try{
        const out = await callLLM(prompt, state.api);
        pushBot(out || "Je n'ai pas compris, pouvez-vous reformuler ?");
      }catch{
        pushBot("Problème d’API. Je repasse en mode maquette si besoin.");
      }
    }
  });
  
  function wait(ms){ return new Promise(r=> setTimeout(r, ms)); }
  