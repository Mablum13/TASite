/* ========================================
   MICKEY BLUM TRAVEL — MAIN JAVASCRIPT
   ======================================== */

// --- Sticky Nav with background on scroll ---
const header = document.getElementById('site-header');
const heroHeight = document.querySelector('.hero')?.offsetHeight || 300;

function updateNav() {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
}

window.addEventListener('scroll', updateNav, { passive: true });
updateNav();


// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

// Close mobile nav when a link is clicked
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});


// --- Smooth-scroll for all anchor links (supplement to CSS) ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = 80; // height of fixed nav
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});


// --- Contact form handling (Formspree) ---
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form?.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Basic validation
  let valid = true;
  const required = form.querySelectorAll('[required]');

  required.forEach(field => {
    field.classList.remove('error');
    if (!field.value.trim()) {
      field.classList.add('error');
      valid = false;
    }
  });

  // Email format check
  const emailField = form.querySelector('#email');
  if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
    emailField.classList.add('error');
    valid = false;
  }

  if (!valid) {
    const firstError = form.querySelector('.error');
    if (firstError) {
      firstError.focus();
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return;
  }

  // Submit to Formspree
  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      showSuccess();
    } else {
      throw new Error('Server error');
    }
  } catch {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send My Request';
    alert('Something went wrong. Please email MickeyBlumTravel@gmail.com directly or call (513) 400-7325.');
  }
});

function showSuccess() {
  formSuccess.classList.add('visible');
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// --- Fade-in on scroll (Intersection Observer) ---
const fadeTargets = document.querySelectorAll(
  '.service-tile, .testimonial-card, .dest-card'
);

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
});

fadeTargets.forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  fadeObserver.observe(el);
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


// --- Hamburger animation ---
const style = document.createElement('style');
style.textContent = `
  .nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-toggle.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .nav-toggle span { transition: all 0.25s ease; transform-origin: center; }
`;
document.head.appendChild(style);
