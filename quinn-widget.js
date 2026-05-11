// Quinn Widget — full branching conversational flow
const qPanel=document.getElementById('q-panel'),
      qMsgs=document.getElementById('q-msgs'),
      qInput=document.getElementById('q-input'),
      qTyping=document.getElementById('q-typing'),
      qChips=document.getElementById('q-chips');

if(!qPanel) throw new Error('Quinn: missing DOM elements');

let qOpen=false,qStarted=false;
let collecting=false,dStep=0,dData={};
let qH=[],businessType='',mainChallenge='',quinnStage=0;

// Proactive bubble after 10s
setTimeout(()=>{
  const p=document.getElementById('q-proactive');
  if(p&&!qOpen){p.classList.add('visible');setTimeout(()=>p.classList.remove('visible'),9000);}
},10000);

function openQuinn(){
  const p=document.getElementById('q-proactive');
  if(p) p.classList.remove('visible');
  qOpen=true;qPanel.classList.add('open');
  if(!qStarted) initQ();
  setTimeout(()=>qInput.focus(),300);
}

const tog=document.getElementById('q-toggle');
if(tog) tog.addEventListener('click',()=>{
  qOpen=!qOpen;qPanel.classList.toggle('open',qOpen);
  const p=document.getElementById('q-proactive');if(p) p.classList.remove('visible');
  if(qOpen&&!qStarted) initQ();
  if(qOpen) setTimeout(()=>qInput.focus(),300);
});

// Branching scripts — one line each, then CTA
const T1={
  'Trades or Construction':"Got it. What's the biggest thing stopping your phone from ringing consistently?",
  'Real Estate':           "Got it. What's the biggest gap in your pipeline right now?",
  'Professional Services': "Got it. What's holding back consistent enquiries for you?",
  'Something else':        "Got it. What's your biggest challenge with getting leads online?"
};
const T2={
  'Not enough inbound leads':    "That's the core of what we fix. Most clients have a lead generation system live and generating within 30 days.",
  'No time to manage marketing': "That's what we're built for — the system runs without you managing it. Setup takes 30 days.",
  "Website isn't converting":    "We rebuild for conversion with AI follow-up built in so no lead goes cold. Live within 30 days.",
  'Need more visibility online': "Consistent presence is part of the system — content managed every month, end to end."
};
const CTA_CHIPS=[
  {l:'Book a free call',a:'book'},
  {l:'Leave my details',a:'details'}
];

// Helpers
function addQ(t){const d=document.createElement('div');d.className='qm qq';const p=document.createElement('p');p.textContent=t;d.appendChild(p);qMsgs.insertBefore(d,qTyping);qMsgs.scrollTop=qMsgs.scrollHeight;}
function addU(t){const d=document.createElement('div');d.className='qm qu';const p=document.createElement('p');p.textContent=t;d.appendChild(p);qMsgs.insertBefore(d,qTyping);qMsgs.scrollTop=qMsgs.scrollHeight;}
function showT(){qTyping.style.display='flex';qMsgs.scrollTop=qMsgs.scrollHeight;}
function hideT(){qTyping.style.display='none';}
function dl(ms){return new Promise(r=>setTimeout(r,ms));}

function showChips(chips){
  qChips.innerHTML='';
  chips.forEach(c=>{
    const b=document.createElement('button');b.className='q-chip';b.textContent=c.l;
    b.addEventListener('click',()=>{
      hideChips();
      if(c.a==='book')          openCalendly();
      else if(c.a==='details')  startCollect();
      else if(c.a==='business'){businessType=c.l;handleInput(c.l);}
      else if(c.a==='challenge'){mainChallenge=c.l;handleInput(c.l);}
      else handleInput(c.l);
    });
    qChips.appendChild(b);
  });
  qChips.classList.remove('hidden');
}
function hideChips(){qChips.classList.add('hidden');qChips.innerHTML='';}

// Init
async function initQ(){
  qStarted=true;
  showT();await dl(900);hideT();
  addQ("Hey — I'm Quinn. Two quick questions and I'll know if Qurated's the right fit for you.");
  showT();await dl(700);hideT();
  addQ("What kind of business do you run?");
  quinnStage=1;
  showChips([
    {l:'Trades or Construction',a:'business'},
    {l:'Real Estate',           a:'business'},
    {l:'Professional Services', a:'business'},
    {l:'Something else',        a:'business'}
  ]);
}

// Main handler
async function handleInput(text){
  if(!text.trim()) return;
  hideChips();addU(text);qH.push({role:'user',content:text});
  if(collecting){handleCollect(text);return;}

  if(quinnStage===1){
    const reply=T1[businessType]||T1['Something else'];
    showT();await dl(700);hideT();
    addQ(reply);qH.push({role:'assistant',content:reply});
    quinnStage=2;
    showChips([
      {l:'Not enough inbound leads',   a:'challenge'},
      {l:'No time to manage marketing',a:'challenge'},
      {l:"Website isn't converting",   a:'challenge'},
      {l:'Need more visibility online',a:'challenge'}
    ]);
    return;
  }
  if(quinnStage===2){
    const reply=T2[mainChallenge]||T2['Not enough inbound leads'];
    showT();await dl(700);hideT();
    addQ(reply);qH.push({role:'assistant',content:reply});
    showT();await dl(600);hideT();
    addQ("What's the best next step for you?");
    quinnStage=3;
    showChips(CTA_CHIPS);
    return;
  }
  // Stage 3+ — AI takes over, brief and CTA-focused
  showT();
  const rep=await callAPI();
  hideT();
  if(rep){addQ(rep);qH.push({role:'assistant',content:rep});}
  showChips(CTA_CHIPS);
}

async function callAPI(){
  try{
    const r=await fetch('/.netlify/functions/quinn',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({messages:qH,context:{businessType,mainChallenge}})
    });
    const d=await r.json();
    return d.reply||"Reach us at info@quratedagency.com.";
  }catch{return "Reach us at info@quratedagency.com.";}
}

// Detail collection
function startCollect(){
  collecting=true;dStep=0;dData={};hideChips();
  showT();setTimeout(()=>{hideT();addQ("What's your name?");},600);
}
function handleCollect(t){
  if(dStep===0){dData.name=t;dStep=1;showT();setTimeout(()=>{hideT();addQ("And your email?");},600);}
  else if(dStep===1){dData.email=t;dStep=2;showT();setTimeout(()=>{hideT();addQ("Best phone number?");},600);}
  else if(dStep===2){dData.phone=t;dStep=3;showT();setTimeout(()=>{hideT();addQ("What's your business called?");},600);}
  else if(dStep===3){dData.business=t;submitLead();}
}

async function submitLead(){
  showT();
  const payload={
    name:dData.name,email:dData.email,phone:dData.phone,business:dData.business,
    businessType:businessType||'Not specified',
    challenge:mainChallenge||'Not specified',
    source:'Quinn AI Chat — '+window.location.pathname
  };
  try{await fetch('/.netlify/functions/submit-lead',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}catch(e){}
  try{
    await fetch('https://formspree.io/f/mreovojd',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        _subject:'New Quinn Lead: '+dData.business,
        Name:dData.name,Email:dData.email,Phone:dData.phone,Business:dData.business,
        'Business Type':businessType||'Not specified',
        'Main Challenge':mainChallenge||'Not specified',
        'Page':window.location.pathname
      })
    });
  }catch(e){}
  hideT();collecting=false;
  addQ("Done, "+dData.name+" — we'll be in touch within 24 hours.");
  showChips([{l:'Book a call now →',a:'book'}]);
}

// Send
async function send(){const t=qInput.value.trim();if(!t)return;qInput.value='';await handleInput(t);}
document.getElementById('q-send').addEventListener('click',send);
qInput.addEventListener('keydown',e=>{if(e.key==='Enter')send();});
