/* ── TOUCH DETECTION ─────────────────────────────────────── */
const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

/* ── CURSOR (desktop only) ───────────────────────────────── */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if(!isTouch && cursor && ring){
  cursor.style.display = 'block';
  ring.style.display   = 'block';
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });
  (function animRing(){
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  })();
  document.querySelectorAll('a, button, [onclick], .q-chip, .faq-q').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('h'); ring.classList.add('h'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('h'); ring.classList.remove('h'); });
  });
} else if(cursor && ring){
  /* Touch device — hide custom cursor, restore native pointer */
  cursor.style.display = 'none';
  ring.style.display   = 'none';
}

/* ── NAV SCROLL + ACTIVE ────────────────────────────────── */
const nav = document.getElementById('nav');
if(nav){
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
  // Highlight active link based on current path
  const path = window.location.pathname.replace(/\/$/, '') || '/home';
  nav.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').replace(/\/$/, '');
    if(path === href || path.endsWith(href)) a.classList.add('active');
  });
}

/* ── MOBILE MENU ────────────────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobile-menu');
function closeMobile(){ if(mobileMenu) mobileMenu.classList.remove('open'); }
function toggleMobile(e){
  if(e) e.preventDefault();
  if(mobileMenu) mobileMenu.classList.toggle('open');
}
if(hamburger && mobileMenu){
  // Use touchstart for instant response on mobile; click as fallback on desktop
  if(isTouch){
    hamburger.addEventListener('touchstart', toggleMobile, { passive: false });
  } else {
    hamburger.addEventListener('click', toggleMobile);
  }
  mobileMenu.addEventListener('click', e => { if(e.target === mobileMenu) closeMobile(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMobile(); });
}

/* ── SCROLL REVEAL ──────────────────────────────────────── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── FAQ TOGGLE ─────────────────────────────────────────── */
function toggleFaq(btn){
  const item = btn.closest('.faq-item');
  const ans  = item.querySelector('.faq-a');
  const icon = btn.querySelector('.faq-icon');
  const open = ans.classList.contains('open');
  // Close all first
  document.querySelectorAll('.faq-a.open').forEach(a => {
    a.classList.remove('open');
    a.closest('.faq-item').querySelector('.faq-icon').textContent = '+';
  });
  if(!open){ ans.classList.add('open'); icon.textContent = '−'; }
}

/* ── CALENDLY (lazy-loaded on demand) ───────────────────── */
function openCalendly(){
  const url = 'https://calendly.com/quratedagency-info/30min';
  if(window.Calendly){ Calendly.initPopupWidget({ url }); return; }
  if(!document.querySelector('link[href*="calendly"]')){
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://assets.calendly.com/assets/external/widget.css';
    document.head.appendChild(css);
  }
  const js = document.createElement('script');
  js.src = 'https://assets.calendly.com/assets/external/widget.js';
  js.onload = () => Calendly.initPopupWidget({ url });
  js.onerror = () => window.open(url, '_blank');
  document.head.appendChild(js);
}

/* ── EMAIL CAPTURE ───────────────────────────────────────── */
async function submitEmail(){
  const inp = document.getElementById('email-cap');
  if(!inp) return;
  const email = inp.value.trim();
  if(!email || !email.includes('@')){ inp.focus(); return; }
  try {
    await fetch('/.netlify/functions/submit-lead', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ email, source: window.location.pathname })
    });
  } catch(e){}
  inp.value = '';
  const ok = document.getElementById('email-ok');
  if(ok){ ok.style.display = 'block'; }
}

/* ── CONTACT FORM ────────────────────────────────────────── */
async function submitContact(){
  const name      = document.getElementById('f-name')?.value.trim()      || '';
  const biz       = document.getElementById('f-biz')?.value.trim()       || '';
  const email     = document.getElementById('f-email')?.value.trim()     || '';
  const phone     = document.getElementById('f-phone')?.value.trim()     || '';
  const type      = document.getElementById('f-type')?.value             || '';
  const challenge = document.getElementById('f-challenge')?.value        || '';
  const msg       = document.getElementById('f-msg')?.value.trim()       || '';

  if(!name || !email){ document.getElementById('f-email')?.focus(); return; }

  const payload = { name, biz, email, phone, type, challenge, msg, source: 'contact-form' };

  try {
    // Try Netlify function first, fall back to Formspree
    const res = await fetch('/.netlify/functions/submit-lead', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error('Netlify fn failed');
  } catch(e){
    try {
      await fetch('https://formspree.io/f/mreovojd', {
        method:'POST', headers:{'Accept':'application/json','Content-Type':'application/json'},
        body: JSON.stringify({ name, email, phone, message: `Biz: ${biz}\nType: ${type}\nChallenge: ${challenge}\n\n${msg}` })
      });
    } catch(e2){}
  }

  const ok = document.getElementById('form-ok');
  if(ok){ ok.style.display = 'block'; }
  // Clear form
  ['f-name','f-biz','f-email','f-phone','f-msg'].forEach(id => {
    const el = document.getElementById(id); if(el) el.value = '';
  });
  ['f-type','f-challenge'].forEach(id => {
    const el = document.getElementById(id); if(el) el.selectedIndex = 0;
  });
}
