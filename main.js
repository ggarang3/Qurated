// CURSOR — hide on touch devices
const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
const cur=document.getElementById('cursor'),rng=document.getElementById('cursor-ring');
if(isTouchDevice){
  if(cur) cur.style.display='none';
  if(rng) rng.style.display='none';
  document.body.classList.add('touch');
} else {
  let mx=0,my=0,rx=0,ry=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(cur){cur.style.left=mx+'px';cur.style.top=my+'px';}});
  (function ar(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;if(rng){rng.style.left=rx+'px';rng.style.top=ry+'px';}requestAnimationFrame(ar);})();
  document.querySelectorAll('a,button,input').forEach(el=>{
    el.addEventListener('mouseenter',()=>{if(cur)cur.classList.add('h');if(rng)rng.classList.add('h');});
    el.addEventListener('mouseleave',()=>{if(cur)cur.classList.remove('h');if(rng)rng.classList.remove('h');});
  });
}

// NAV SCROLL
const nav=document.getElementById('nav');
if(nav) window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40));

// MOBILE MENU
const ham=document.getElementById('hamburger');
if(ham) ham.addEventListener('click',()=>{
  const m=document.getElementById('mobile-menu');
  if(m) m.classList.toggle('open');
  // animate hamburger spans
  ham.classList.toggle('open');
});
function closeMobile(){
  const m=document.getElementById('mobile-menu');
  if(m) m.classList.remove('open');
  if(ham) ham.classList.remove('open');
}

// HAMBURGER ANIMATION
const style=document.createElement('style');
style.textContent=`.hamburger.open span:nth-child(1){transform:translateY(6.5px) rotate(45deg);}.hamburger.open span:nth-child(2){opacity:0;}.hamburger.open span:nth-child(3){transform:translateY(-6.5px) rotate(-45deg);}`;
document.head.appendChild(style);

// REVEAL ON SCROLL
const ro=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ro.unobserve(e.target);}});
},{threshold:0.08});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

// FAQ ACCORDION
document.querySelectorAll('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item');
    const answer=item.querySelector('.faq-a');
    const isOpen=btn.classList.contains('open');
    // close all
    document.querySelectorAll('.faq-q.open').forEach(b=>{
      b.classList.remove('open');
      const a=b.closest('.faq-item').querySelector('.faq-a');
      if(a) a.style.display='none';
    });
    // open this one if it was closed
    if(!isOpen){
      btn.classList.add('open');
      if(answer) answer.style.display='block';
    }
  });
});

// CALENDLY — ⚠ verify URL matches your live Calendly booking page
function openCalendly(){
  if(typeof Calendly!=='undefined'){
    Calendly.initPopupWidget({url:'https://calendly.com/quratedagency-info/30min'});
  }
}

// EMAIL CAPTURE
async function submitEmail(){
  const input=document.getElementById('email-cap');
  if(!input) return;
  const v=input.value.trim();
  if(!v||!v.includes('@')) return;
  try{
    await fetch('https://formspree.io/f/mreovojd',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:v,source:'Email capture — '+window.location.pathname})
    });
  }catch(e){}
  const ok=document.getElementById('email-ok');
  if(ok) ok.style.display='block';
  input.value='';
}

// BUDGET SELECTOR — active state
function selectBudget(btn,key){
  document.querySelectorAll('.budget-opt').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  const d=typeof budgetData!=='undefined'?budgetData[key]:null;
  if(!d) return;
  const ri=document.getElementById('budget-result-inner');
  const rb=document.getElementById('budget-result');
  if(ri) ri.innerHTML=`<div class="br-badge">${d.badge}</div><div class="br-name">${d.name}</div><p class="br-copy">${d.copy}</p><a href="/contact" class="btn btn-red">${d.cta}</a>`;
  if(rb) rb.classList.remove('hidden');
}


// CONTACT FORM SUBMISSION
async function submitContact(){
  const name  = document.getElementById('f-name')?.value.trim();
  const biz   = document.getElementById('f-biz')?.value.trim();
  const email = document.getElementById('f-email')?.value.trim();
  const phone = document.getElementById('f-phone')?.value.trim();
  const type  = document.getElementById('f-type')?.value;
  const chal  = document.getElementById('f-challenge')?.value;
  const msg   = document.getElementById('f-msg')?.value.trim();

  if(!name||!email||!email.includes('@')) return;

  const btn=document.querySelector('.form-submit');
  if(btn){btn.textContent='Sending...';btn.disabled=true;}

  try{
    await fetch('https://formspree.io/f/mreovojd',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        _subject:'New Contact: '+(biz||name),
        Name:name, Business:biz, Email:email, Phone:phone,
        'Business Type':type||'Not selected',
        'Main Challenge':chal||'Not selected',
        Message:msg||'—',
        Source:'Contact Form — '+window.location.pathname
      })
    });
  }catch(e){}

  const ok=document.getElementById('form-ok');
  if(ok) ok.style.display='block';
  if(btn) btn.style.display='none';
}
