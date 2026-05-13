// CURSOR
const cur=document.getElementById('cursor'),rng=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
(function ar(){rx+=(mx-rx)*.12;ry+=(my-ry)*.12;rng.style.left=rx+'px';rng.style.top=ry+'px';requestAnimationFrame(ar);})();
document.querySelectorAll('a,button,input').forEach(el=>{
  el.addEventListener('mouseenter',()=>{cur.classList.add('h');rng.classList.add('h');});
  el.addEventListener('mouseleave',()=>{cur.classList.remove('h');rng.classList.remove('h');});
});

// NAV SCROLL
const nav=document.getElementById('nav');
if(nav) window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40));

// MOBILE MENU
const ham=document.getElementById('hamburger');
if(ham) ham.addEventListener('click',()=>document.getElementById('mobile-menu').classList.toggle('open'));
function closeMobile(){const m=document.getElementById('mobile-menu');if(m)m.classList.remove('open');}

// REVEAL ON SCROLL
const ro=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');ro.unobserve(e.target);}});
},{threshold:0.08});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

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
