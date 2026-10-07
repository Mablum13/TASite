/* ========================================
   MICKEY BLUM TRAVEL — MAIN JAVASCRIPT
   ======================================== */

// Lets CSS hold scroll-reveal content back only when this script is actually running
document.documentElement.classList.add('js');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// --- Sticky Nav with background on scroll ---
const header = document.getElementById('site-header');

function updateNav() {
  header.classList.toggle('scrolled', window.scrollY > 60);
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();


// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

function setNavOpen(open) {
  navLinks.classList.toggle('open', open);
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
}

navToggle?.addEventListener('click', () => setNavOpen(!navLinks.classList.contains('open')));

// Close mobile nav when a link is clicked
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => setNavOpen(false));
});


// --- Smooth-scroll for all anchor links (supplement to CSS) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // height of fixed nav
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
});


// --- Check-in dropdown ---
const checkinBtn   = document.getElementById('checkinBtn');
const checkinPanel = document.getElementById('checkinPanel');

if (checkinBtn && checkinPanel) {
  checkinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = checkinBtn.getAttribute('aria-expanded') === 'true';
    checkinBtn.setAttribute('aria-expanded', String(!open));
    checkinPanel.classList.toggle('open', !open);
  });
  document.addEventListener('click', () => {
    checkinBtn.setAttribute('aria-expanded', 'false');
    checkinPanel.classList.remove('open');
  });
  checkinPanel.addEventListener('click', (e) => e.stopPropagation());
}


// --- Reveal on scroll ---
const revealTargets = document.querySelectorAll('[data-reveal]');

if (reduceMotion || !('IntersectionObserver' in window)) {
  revealTargets.forEach(el => el.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px',
  });
  revealTargets.forEach(el => revealObserver.observe(el));
}


// --- How it works: sail the ship from stop to stop ---
const voyage = document.querySelector('[data-voyage]');
const sail   = document.getElementById('voyageSail');

function setSail() {
  voyage.classList.add('is-sailing');
  if (sail && typeof sail.beginElement === 'function') {
    if (reduceMotion) sail.setAttribute('dur', '0.01s');
    sail.beginElement();
  }
}

if (voyage) {
  if ('IntersectionObserver' in window) {
    const voyageObserver = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        setSail();
        voyageObserver.disconnect();
      }
    }, { threshold: 0.35 });
    voyageObserver.observe(voyage);
  } else {
    setSail();
  }
}


// --- Footer year ---
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
