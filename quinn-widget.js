/* ── QUINN PAGE CONFIG ──────────────────────────────────────
 *  Set `const QUINN_PAGE = 'pagename'` in each HTML file
 *  before this script loads.
 * ──────────────────────────────────────────────────────── */
const PAGE = (typeof QUINN_PAGE !== 'undefined') ? QUINN_PAGE : 'home';

const PAGE_CONFIG = {
  cover:        { greeting: "Not sure where to start? Tell me a bit about your business and I'll point you in the right direction.", proactive: "Not sure where to start? Ask Quinn →", delay: 8000, bizType: null },
  home:         { greeting: "Hey — I'm Quinn. Two quick questions and I'll know exactly whether Qurated's the right fit for your business.", proactive: "Not sure if we're the right fit? Ask Quinn →", delay: 5000, bizType: null },
  about:        { greeting: "Curious about how Qurated works or who's behind it? Ask me anything — no prep needed.", proactive: "Curious about how we work? Ask Quinn →", delay: 7000, bizType: null },
  trades:       { greeting: "Hey — I work with trade businesses across Perth. What's your biggest challenge right now — leads, follow-up, or online presence?", proactive: "What's your biggest challenge right now? →", delay: 4000, bizType: 'Trades or Construction' },
  realestate:   { greeting: "Hey — I work with Perth agents and property businesses. Where's your pipeline at right now — consistent, patchy, or barely there?", proactive: "Where's your pipeline at right now? →", delay: 4000, bizType: 'Real Estate' },
  capabilities: { greeting: "Not sure which Qurated package fits your business? Tell me what you're working with and I'll give you a straight answer.", proactive: "Not sure which package fits? Give me 60 seconds →", delay: 5000, bizType: null },
  contact:      { greeting: "Need help before you hit submit? Ask me anything — how we work, what to expect, whether we're the right fit.", proactive: "Need help before you submit? Ask Quinn →", delay: 6000, bizType: null },
};

const cfg = PAGE_CONFIG[PAGE] || PAGE_CONFIG.home;

/* ── STATE ──────────────────────────────────────────────── */
let stage        = cfg.bizType ? 2 : 1; // skip bizType stage if page pre-selects
let businessType = cfg.bizType || '';
let challenge    = '';
let isOpen       = false;
let proactiveTimer;

/* ── DOM REFS ────────────────────────────────────────────── */
const panel     = document.getElementById('q-panel');
const msgs      = document.getElementById('q-msgs');
const typing    = document.getElementById('q-typing');
const chipsWrap = document.getElementById('q-chips');
const input     = document.getElementById('q-input');
const sendBtn   = document.getElementById('q-send');
const toggle    = document.getElementById('q-toggle');
const proactive = document.getElementById('q-proactive');

if(!panel) console.warn('Quinn: panel not found');

/* ── OPEN / CLOSE ────────────────────────────────────────── */
function openQuinn(){
  if(!panel) return;
  if(!isOpen){
    isOpen = true;
    panel.classList.add('open');
    if(proactive) proactive.classList.remove('visible');
    if(!msgs.dataset.started) initQ();
    setTimeout(() => input && input.focus(), 350);
  }
}
function closeQuinn(){
  isOpen = false;
  if(panel) panel.classList.remove('open');
}

if(toggle){ toggle.addEventListener('click', () => isOpen ? closeQuinn() : openQuinn()); }

/* ── PROACTIVE BUBBLE ────────────────────────────────────── */
if(proactive && cfg.proactive){
  proactive.textContent = cfg.proactive;
  proactiveTimer = setTimeout(() => {
    if(!isOpen) proactive.classList.add('visible');
  }, cfg.delay);
  proactive.addEventListener('click', () => { proactive.classList.remove('visible'); openQuinn(); });
}

/* ── MESSAGES ────────────────────────────────────────────── */
function addMsg(text, who){
  const div = document.createElement('div');
  div.className = `qm ${who}`;
  const p = document.createElement('p');
  p.textContent = text;
  div.appendChild(p);
  msgs.insertBefore(div, typing);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

function showTyping(){ if(typing) typing.style.display = 'flex'; msgs.scrollTop = msgs.scrollHeight; }
function hideTyping(){ if(typing) typing.style.display = 'none'; }

function quinnSay(text, delay = 900){
  return new Promise(resolve => {
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMsg(text, 'qq');
      resolve();
    }, delay);
  });
}

/* ── CHIPS ───────────────────────────────────────────────── */
function setChips(options, onSelect){
  if(!chipsWrap) return;
  chipsWrap.innerHTML = '';
  chipsWrap.className = 'q-chips';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'q-chip';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      clearChips();
      addMsg(opt, 'qu');
      onSelect(opt);
    });
    chipsWrap.appendChild(btn);
  });
}
function clearChips(){ if(chipsWrap){ chipsWrap.innerHTML = ''; chipsWrap.className = 'q-chips hidden'; } }

/* ── INIT FLOW ───────────────────────────────────────────── */
async function initQ(){
  msgs.dataset.started = '1';
  await quinnSay(cfg.greeting, 700);

  if(stage === 1){
    // Stage 1: What type of business?
    await quinnSay("First — what type of business are you running?", 600);
    setChips(['Trades or Construction','Real Estate','Professional Services','Other'], async (opt) => {
      businessType = opt;
      stage = 2;
      await handleStage2();
    });
  } else {
    // Page already has business type (trades/RE pages)
    await handleStage2();
  }
}

async function handleStage2(){
  await quinnSay("Got it. And what's the biggest gap right now?", 600);
  setChips(['Not enough inbound leads','Leads going cold before follow-up','No time to manage marketing','Website isn\'t converting','Need more visibility online','Not sure — need advice'], async (opt) => {
    challenge = opt;
    stage = 3;
    await handleStage3();
  });
}

async function handleStage3(){
  await quinnSay(getRecommendation(), 700);
  await quinnSay("Want me to connect you with the team for a free 30-minute diagnosis call? No pitch — just clarity on what your business actually needs.", 700);
  setChips(['Yes — book me in','Not yet, I have more questions','Send me more info'], async (opt) => {
    if(opt === 'Yes — book me in'){
      await quinnSay("Perfect. Click the button below to pick a time — the call is free, 30 minutes, and we won't pitch you anything you didn't ask for.", 600);
      setTimeout(() => openCalendly(), 1000);
    } else if(opt === 'Not yet, I have more questions'){
      clearChips();
      await quinnSay("No problem — what do you want to know? I'll answer honestly, even if that means telling you we're not the right fit.", 600);
    } else {
      await quinnSay("Easy — head to our Capabilities page for the full breakdown, then reach out when you're ready. I'll be here.", 600);
      setTimeout(() => window.location.href = '/capabilities', 1800);
    }
  });
}

function getRecommendation(){
  const t = businessType.toLowerCase();
  const c = challenge.toLowerCase();

  if(c.includes('inbound leads') || c.includes('not enough')){
    return `Based on what you've told me — ${businessType} with a lead generation gap — I'd start with The Foundation (website + AI). That's where the fastest change happens. Most clients see inbound within 30 days of launch.`;
  }
  if(c.includes('cold') || c.includes('follow-up')){
    return `The leads-going-cold problem is almost always an automation gap. The AI follow-up layer is what fixes it — instant response, lead qualification, no manual chasing. That's built into The Foundation package.`;
  }
  if(c.includes('time') || c.includes('managing marketing')){
    return `If time is the constraint, The Authority package is the answer — we handle all content and social management monthly. You review, we publish. You get your time back.`;
  }
  if(c.includes('converting') || c.includes('website')){
    return `A non-converting website is usually a copy and structure problem, not a design one. The Foundation package rebuilds it around your buyer's journey — with a clear CTA path, local SEO, and a lead capture funnel built in.`;
  }
  if(c.includes('visibility')){
    const re = t.includes('real') ? ' — suburb-specific content and Google authority building for your areas.' : ' — local SEO, Google Business Profile, and consistent content publishing.';
    return `Visibility is a content + SEO game${re} The Authority package covers that. The Foundation + Authority combo is usually the sweet spot.`;
  }
  return `Based on what you've shared — ${businessType}, and a bit unsure where to start — the free diagnosis call is honestly the best next step. 30 minutes and you'll know exactly what the system should look like for your business.`;
}

/* ── FREE TEXT INPUT ─────────────────────────────────────── */
async function sendUserMsg(){
  if(!input) return;
  const text = input.value.trim();
  if(!text) return;
  input.value = '';
  clearChips();
  addMsg(text, 'qu');
  await handleFreeText(text.toLowerCase());
}

async function handleFreeText(text){
  try {
    showTyping();
    const sysPrompt = `You are Quinn — a friendly, direct AI assistant for Qurated, a Perth-based growth systems agency. Qurated builds lead generation systems (website, AI, CRM, content) for trade businesses and real estate agents. Be concise, warm, and honest. If someone is clearly not a fit, say so. Always guide toward a free 30-minute diagnosis call at /contact or help them understand the right package (Foundation = web+AI, Authority = content+social, Full Engine = both). Current page context: ${PAGE}. Business type collected: "${businessType}". Challenge: "${challenge}". Answer in 2-3 sentences max unless a detailed explanation is genuinely needed.`;
    const res = await fetch('/.netlify/functions/quinn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, systemPrompt: sysPrompt, page: PAGE, businessType, challenge })
    });
    hideTyping();
    if(res.ok){
      const data = await res.json();
      const reply = data.reply || data.message || "Let me get the team to answer that one properly — head to our contact page and we'll follow up within the hour.";
      addMsg(reply, 'qq');
    } else {
      addMsg(getFallbackReply(text), 'qq');
    }
  } catch(e){
    hideTyping();
    addMsg(getFallbackReply(text), 'qq');
  }
}

function getFallbackReply(text){
  if(text.includes('price') || text.includes('cost') || text.includes('how much')){
    return "Pricing varies by business — we don't do generic packages at generic prices. The fastest way to get a number is the free diagnosis call. We'll tell you what the system should look like and what it should cost. Book at the link above.";
  }
  if(text.includes('how long') || text.includes('timeline')){
    return "The Foundation package goes live within 30 days. Authority management starts the following month. Full Engine is both running simultaneously. Good systems take 90 days to show their full capability.";
  }
  if(text.includes('perth') || text.includes('where')){
    return "We're based in Perth, WA. We work primarily with Perth businesses and have clients in Adelaide too. If you're elsewhere in Australia — reach out. We'll tell you honestly if we can do the job well.";
  }
  if(text.includes('seo')){
    return "Yes — local SEO is part of The Foundation package. Google Business Profile, service-page optimisation, suburb targeting where relevant. It's built in, not an add-on.";
  }
  return "Good question — that one's better answered by the team directly. Book a free diagnosis call at /contact and you'll get a straight answer within 24 hours, no pitch attached.";
}

/* ── SEND EVENTS ─────────────────────────────────────────── */
if(sendBtn) sendBtn.addEventListener('click', sendUserMsg);
if(input){
  input.addEventListener('keydown', e => { if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendUserMsg(); } });
}

/* ── EXPOSE openQuinn GLOBALLY ───────────────────────────── */
window.openQuinn = openQuinn;
window.closeQuinn = closeQuinn;
