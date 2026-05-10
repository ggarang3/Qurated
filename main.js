/* main.js — shared across all Qurated pages */

// ── CURSOR ────────────────────────────────────────────────────────────────────
const cur = document.getElementById('cursor');
const rng = document.getElementById('cursor-ring');
let mx=0, my=0, rx=0, ry=0;
if(cur && rng){
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });
  (function ar(){
    rx += (mx - rx) * .12; ry += (my - ry) * .12;
    rng.style.left = rx + 'px'; rng.style.top = ry + 'px';
    requestAnimationFrame(ar);
  })();
  document.querySelectorAll('a,button,input,label').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.classList.add('h'); rng.classList.add('h'); });
    el.addEventListener('mouseleave', () => { cur.classList.remove('h'); rng.classList.remove('h'); });
  });
}

// ── COVER OVERLAY — first visit only ─────────────────────────────────────────
const overlay = document.getElementById('cover-overlay');
if (overlay) {
  if (sessionStorage.getItem('qr-entered')) {
    overlay.style.display = 'none';
  } else {
    const btn = document.getElementById('enter-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        overlay.classList.add('gone');
        sessionStorage.setItem('qr-entered', '1');
        setTimeout(() => { overlay.style.display = 'none'; }, 950);
      });
    }
  }
}

// ── NAV SCROLL ────────────────────────────────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── HAMBURGER + MOBILE MENU ───────────────────────────────────────────────────
const ham = document.getElementById('hamburger');
const mob = document.getElementById('mobile-menu');
const qBubble = document.querySelector('.quinn-bubble');

if (ham && mob) {
  ham.addEventListener('click', () => {
    const isOpen = mob.classList.toggle('open');
    ham.classList.toggle('open', isOpen);
    // Hide Quinn bubble when menu is open so it doesn't block links
    if (qBubble) qBubble.style.display = isOpen ? 'none' : 'flex';
  });
}

function closeMobile() {
  if (mob) mob.classList.remove('open');
  if (ham) ham.classList.remove('open');
  // Restore Quinn bubble
  if (qBubble) qBubble.style.display = 'flex';
}

// Close mobile menu on any nav link tap (belt-and-braces)
document.querySelectorAll('.mobile-menu a').forEach(a => {
  a.addEventListener('click', closeMobile);
});

// ── ACTIVE NAV LINK ───────────────────────────────────────────────────────────
const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(a => {
  const href = (a.getAttribute('href') || '').replace(/\/$/, '');
  if (href === currentPath || href + '.html' === currentPath) {
    a.classList.add('active');
  }
});

// ── REVEAL ON SCROLL ──────────────────────────────────────────────────────────
const ro = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

// ── CALENDLY ─────────────────────────────────────────────────────────────────
// ⚠ Verify this URL matches your live Calendly booking page
function openCalendly() {
  if (typeof Calendly !== 'undefined') {
    Calendly.initPopupWidget({ url: 'https://calendly.com/quratedagency-info/30min' });
  }
}

// ── EMAIL CAPTURE ─────────────────────────────────────────────────────────────
async function submitEmail() {
  const input = document.getElementById('email-cap');
  if (!input) return;
  const v = input.value.trim();
  if (!v || !v.includes('@')) return;
  try {
    await fetch('https://formspree.io/f/mreovojd', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: v, source: 'Email capture', page: window.location.pathname })
    });
  } catch(e) {}
  const ok = document.getElementById('email-ok');
  if (ok) ok.style.display = 'block';
  input.value = '';
}
