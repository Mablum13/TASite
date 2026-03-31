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


// --- Contact form handling ---
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form?.addEventListener('submit', function (e) {
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

  // Collect form data
  const data = {
    firstName:   form.querySelector('#firstName').value.trim(),
    lastName:    form.querySelector('#lastName').value.trim(),
    email:       form.querySelector('#email').value.trim(),
    phone:       form.querySelector('#phone').value.trim(),
    destination: form.querySelector('#destination').value,
    travelers:   form.querySelector('#travelers').value,
    travelDate:  form.querySelector('#travelDate').value.trim(),
    message:     form.querySelector('#message').value.trim(),
    submittedAt: new Date().toISOString(),
  };

  // Show success state
  // In production, replace the body below with a fetch() to your form handler or email service.
  console.log('Form submission:', data);
  showSuccess();
});

function showSuccess() {
  formSuccess.classList.add('visible');
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
}


// --- Fade-in on scroll (Intersection Observer) ---
const fadeTargets = document.querySelectorAll(
  '.service-card, .reason-card, .testimonial-card, .dest-card, .stat-item, .credential'
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


// --- Hamburger animation ---
const style = document.createElement('style');
style.textContent = `
  .nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .nav-toggle.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
  .nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
  .nav-toggle span { transition: all 0.25s ease; transform-origin: center; }
`;
document.head.appendChild(style);
