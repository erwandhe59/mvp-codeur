// agents.js — agents + génération + chat mock
import { toast } from './ui.js';

/* Personnages cartoon 3D (SVG inline, légers) */
const CHARACTERS = {
  mandat: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9cc2ff"/><stop offset="1" stop-color="#ffd28b"/></linearGradient></defs>
      <circle cx="32" cy="32" r="31" fill="#eef3ff" stroke="#dfe7ff"/>
      <circle cx="32" cy="28" r="14" fill="url(#g1)"/>
      <ellipse cx="28" cy="26" rx="2.5" ry="2.6" fill="#102a43"/>
      <ellipse cx="36" cy="26" rx="2.5" ry="2.6" fill="#102a43"/>
      <path d="M26 32c4 4 8 4 12 0" stroke="#102a43" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <rect x="40" y="12" width="14" height="18" rx="3" fill="#fff" stroke="#dfe7ff"/>
      <path d="M43 18h8M43 22h8M43 26h5" stroke="#9bb3ff" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  formulaire: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#e9fff6" stroke="#d7f4ea"/>
      <circle cx="32" cy="28" r="14" fill="#6ad3b1"/>
      <ellipse cx="28" cy="26" rx="2.3" ry="2.4" fill="#0e3b2d"/>
      <ellipse cx="36" cy="26" rx="2.3" ry="2.4" fill="#0e3b2d"/>
      <path d="M26 31h12" stroke="#0e3b2d" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M45 16l7 7-12 4 5-11z" fill="#ffd28b" stroke="#f0b55a"/>
    </svg>`,
  analyse: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#fff5e9" stroke="#ffe6c7"/>
      <circle cx="32" cy="28" r="14" fill="#ffb347"/>
      <ellipse cx="28" cy="26" rx="2.3" ry="2.4" fill="#4b2c06"/>
      <ellipse cx="36" cy="26" rx="2.3" ry="2.4" fill="#4b2c06"/>
      <path d="M26 31c4-3 8-3 12 0" stroke="#4b2c06" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="44" cy="18" r="6.5" fill="none" stroke="#ff9d2e" stroke-width="2.2"/>
      <path d="M48 22l5 5" stroke="#ff9d2e" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M41 16v5M44 15v6M47 14v7" stroke="#fff" stroke-width="2"/>
    </svg>`,
  homestaging: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="31" fill="#ffe9f0" stroke="#ffd3e1"/>
      <circle cx="32" cy="28" r="14" fill="#ff7aa2"/>
      <ellipse cx="28" cy="26" rx="2.3" ry="2.4" fill="#4a1020"/>
      <ellipse cx="36" cy="26" rx="2.3" ry="2.4" fill="#4a1020"/>
      <path d="M26 32c2 3 10 3 12 0" stroke="#4a1020" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <rect x="44" y="14" width="9" height="7" rx="1.6" fill="#fff" stroke="#ffc0d2"/>
      <path d="M19 18c4 4 0 9 6 13" stroke="#88d6ba" stroke-width="2.4" stroke-linecap="round" fill="none"/>
      <circle cx="25" cy="31" r="2.2" fill="#88d6ba"/>
    </svg>`
};

export const AGENTS = [
  {
    id:'mandat',
    name:'Agent Mandat',
    tagline:'Génère un mandat de vente',
    avatar:'assets/avatars/mandat.svg',
    character: CHARACTERS.mandat,
    fields:[
      {name:'nom_vendeur', label:'Nom du vendeur', type:'text', required:true},
      {name:'adresse_bien', label:'Adresse du bien', type:'text', required:true},
      {name:'type_bien', label:'Type de bien', type:'select', options:['Appartement','Maison','Terrain','Local'], required:true},
      {name:'surface', label:'Surface (m²)', type:'number'},
      {name:'prix', label:'Prix demandé (€)', type:'number'},
      {name:'date_debut', label:'Date de début', type:'date'},
      {name:'duree', label:'Durée (mois)', type:'number'},
      {name:'exclusivite', label:'Exclusivité', type:'select', options:['Oui','Non']},
    ]
  },
  {
    id:'formulaire',
    name:'Agent Formulaire',
    tagline:'Aide à remplir un document administratif',
    avatar:'assets/avatars/formulaire.svg',
    character: CHARACTERS.formulaire,
    fields:[
      {name:'type_formulaire', label:'Type de formulaire', type:'select', options:['CERFA Vente','CERFA Location','DPE','Autre'], required:true},
      {name:'nom', label:'Nom / Raison sociale', type:'text'},
      {name:'adresse', label:'Adresse postale', type:'text'},
      {name:'references', label:'Références / N° dossier', type:'text'}
    ]
  },
  {
    id:'analyse',
    name:'Agent Analyse',
    tagline:'Synthèse d’un bien ou d’un marché',
    avatar:'assets/avatars/analyse.svg',
    character: CHARACTERS.analyse,
    fields:[
      {name:'ville', label:'Ville', type:'text', required:true},
      {name:'quartier', label:'Quartier', type:'text'},
      {name:'type_bien', label:'Type de bien', type:'select', options:['Appartement','Maison','Immeuble','Local']},
      {name:'surface', label:'Surface (m²)', type:'number'},
      {name:'etat', label:'État', type:'select', options:['À rénover','Bon état','Neuf']},
      {name:'objectif', label:'Objectif', type:'select', options:['Vente','Location']}
    ]
  },
  {
    id:'homestaging',
    name:'Agent Home Staging',
    tagline:'Idées d’aménagement et mise en valeur',
    avatar:'assets/avatars/homestaging.svg',
    character: CHARACTERS.homestaging,
    fields:[
      {name:'style', label:'Style souhaité', type:'select', options:['Scandinave','Moderne','Classique','Minimal']},
      {name:'pieces', label:'Pièces concernées', type:'textarea', placeholder:'Ex : salon, cuisine, chambre...'},
      {name:'budget', label:'Budget', type:'select', options:['Bas','Moyen','Élevé']}
    ]
  }
];

export function buildPrompt(agentId, formData, prefs){
  const base = `Tu es un assistant pour des pros de l'immobilier en France.
Ton=${prefs.tone||'neutre'} | Détail=${prefs.detail||'moyen'} | Sortie en français.`;
  const ctx = Object.entries(formData).map(([k,v])=> `${k}: ${v||'-'}`).join('\n');
  return `${base}\n\nAgent: ${agentId}\n${ctx}\n\nDonne un résultat structuré avec titres et listes si utile.`;
}

export async function generate(agentId, formData, prefs, isMock, api){
  const prompt = buildPrompt(agentId, formData, prefs);
  if(isMock){ return mockGenerate(agentId, formData, prefs); }
  try{
    const out = await callLLM(prompt, api);
    return out || mockGenerate(agentId, formData, prefs);
  }catch(e){
    toast('Erreur API — retour au mode maquette');
    return mockGenerate(agentId, formData, prefs);
  }
}

/* ---------- MOCK Documents ---------- */
function euro(n){ if(!n) return '—'; return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR', maximumFractionDigits:0}).format(+n); }
function m2(n){ return n ? `${n} m²` : '—'; }
function estimateFromSurface(surface, etat='Bon état', type_bien='Appartement'){
  if(!surface) return { priceRange: '—', note:'Données insuffisantes pour une estimation indicative.' };
  const base = (type_bien==='Maison' ? 3200 : 4200);
  const coefEtat = etat==='Neuf'?1.2: etat==='À rénover'?0.8:1;
  const p = surface * base * coefEtat;
  const min = Math.max(p*0.9, p-15000), max = p*1.1+15000;
  return { priceRange: `${euro(min)} – ${euro(max)}`, note:'Fourchette indicative à affiner avec des comparables locaux.' };
}

function mandatHTML(d){ return `
  <div class="badge">Brouillon</div>
  <h4>Mandat de vente — ${d.type_bien||'Bien'}</h4>
  <table class="meta-table">
    <tr><th>Vendeur</th><td>${d.nom_vendeur||'—'}</td></tr>
    <tr><th>Adresse du bien</th><td>${d.adresse_bien||'—'}</td></tr>
    <tr><th>Surface</th><td>${m2(d.surface)}</td></tr>
    <tr><th>Prix demandé</th><td>${euro(d.prix)}</td></tr>
    <tr><th>Début</th><td>${d.date_debut||'—'}</td></tr>
    <tr><th>Durée</th><td>${d.duree? d.duree+' mois':'—'}</td></tr>
    <tr><th>Exclusivité</th><td>${d.exclusivite||'Non'}</td></tr>
  </table>
  <h4>Clauses principales</h4>
  <ul>
    <li><strong>Objet :</strong> Commercialisation du bien.</li>
    <li><strong>Durée :</strong> ${d.duree||'—'} mois dès ${d.date_debut||'—'}.</li>
    <li><strong>Rémunération :</strong> selon barème (à compléter).</li>
    <li><strong>Documents :</strong> DPE, diagnostics, titre.</li>
    <li><strong>Exclusivité :</strong> ${d.exclusivite==='Oui'?'négociation par tiers interdite':'mandat simple'}.</li>
  </ul>`; }

function formulaireHTML(d){ return `
  <div class="badge">${d.type_formulaire||'Formulaire'}</div>
  <h4>Pré‑remplissage</h4>
  <table class="meta-table">
    <tr><th>Nom / Raison sociale</th><td>${d.nom||'—'}</td></tr>
    <tr><th>Adresse</th><td>${d.adresse||'—'}</td></tr>
    <tr><th>Références dossier</th><td>${d.references||'—'}</td></tr>
  </table>
  <h4>Sections proposées</h4>
  <ul>
    <li>Identité du déclarant</li><li>Infos du bien</li><li>Justificatifs à joindre</li>
  </ul>`; }

function analyseHTML(d){
  const est = estimateFromSurface(+d.surface||0, d.etat, d.type_bien);
  const ville = [d.ville, d.quartier].filter(Boolean).join(' — ');
  return `
  <div class="badge">Synthèse marché</div>
  <h4>${ville||'Zone non précisée'}</h4>
  <table class="meta-table">
    <tr><th>Type</th><td>${d.type_bien||'—'}</td></tr>
    <tr><th>Surface</th><td>${m2(d.surface)}</td></tr>
    <tr><th>État</th><td>${d.etat||'—'}</td></tr>
    <tr><th>Objectif</th><td>${d.objectif||'—'}</td></tr>
  </table>
  <h4>Estimation indicative</h4>
  <p><strong>Fourchette :</strong> ${est.priceRange}<br><span class="muted small">${est.note}</span></p>`; }

function homestagingHTML(d){
  const style = d.style || 'Moderne';
  return `
  <div class="badge">Home Staging</div>
  <h4>Style ${style}</h4>
  <p><strong>Pièces :</strong> ${d.pieces||'—'} • <strong>Budget :</strong> ${d.budget||'—'}</p>
  <ul><li>Salon : circulation fluide, lumière indirecte.</li><li>Cuisine : crédence propre, plans dégagés.</li><li>Chambre : textile clair, chevets assortis.</li></ul>`; }

function mockGenerate(agentId, formData){
  switch(agentId){
    case 'mandat': return mandatHTML(formData);
    case 'formulaire': return formulaireHTML(formData);
    case 'analyse': return analyseHTML(formData);
    case 'homestaging': return homestagingHTML(formData);
    default: return `<p>Agent inconnu.</p>`;
  }
}

/* ---------- MOCK Chatbot ---------- */
const OPENERS = {
  mandat: "Bonjour ! Je suis votre agent Mandat. Donnez-moi le type de bien, l’adresse et si c’est exclusif : je vous prépare le brouillon.",
  formulaire: "Salut ! Dites-moi le type de formulaire (CERFA, DPE…), votre nom et l’adresse à mettre.",
  analyse: "Hello ! Ville, type de bien et surface ? Je vous propose une synthèse rapide avec une fourchette indicative.",
  homestaging: "Coucou ! Précisez le style visé, les pièces et le budget. Je suggère des idées pièce par pièce."
};
export function chatHello(agentId){ return OPENERS[agentId] || "Comment puis-je vous aider ?"; }

export function chatMockReply(agentId, text){
  text = (text||"").toLowerCase();
  if(agentId==='analyse' && /\b(\d{2,3})\s?m/i.test(text)){
    const s = +RegExp.$1; const est = estimateFromSurface(s);
    return `Pour ~${s} m², une fourchette réaliste serait **${est.priceRange}** (indicatif). Souhaitez‑vous que je liste 3 points forts et 3 risques ?`;
  }
  if(agentId==='mandat' && /exclu|exclus/i.test(text)){
    return "Noté : **mandat exclusif**. Je peux générer la clause d’exclusivité et le rappel des pénalités en cas de rupture anticipée.";
  }
  if(agentId==='formulaire' && /cerfa|dpe|location|vente/i.test(text)){
    return "Parfait. Je pré‑remplis les sections standard et je vous indique les justificatifs à joindre. Vous me donnez le **nom** et **adresse** ?";
  }
  if(agentId==='homestaging' && /(scandi|scandinave|moderne|minim|classique)/i.test(text)){
    return "Très bon choix de style ! Je propose une palette claire + 2 touches colorées. Vous me citez les **pièces** à traiter ?";
  }
  return "Compris. Je peux poursuivre et générer un résultat à partir de ces éléments, ou vous poser 2–3 questions pour affiner.";
}

/* ---------- API chat (si besoin) ---------- */
export async function callLLM(prompt, api){
  const { key, url, model } = api;
  if(!key || !url || !model) throw new Error('Config API incomplète');
  const res = await fetch(url, {
    method:'POST', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${key}` },
    body: JSON.stringify({ model, messages:[{role:'user', content: prompt}], temperature:0.4 })
  });
  if(!res.ok) throw new Error('HTTP '+res.status);
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
  return content.trim();
}

export { mockGenerate }; // (optionnel si import ailleurs)
