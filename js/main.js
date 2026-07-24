/* =============================================
   SYNS ASSOCIATES — Main JavaScript
   ============================================= */

/* ---------- Sticky Header ---------- */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

/* ---------- Mobile Nav ---------- */
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');
const mobileClose = document.getElementById('mobileClose');

function openMobileNav() {
  mobileNav.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeMobileNav() {
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openMobileNav);
if (mobileClose) mobileClose.addEventListener('click', closeMobileNav);
if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileNav);

/* ---------- Scroll Reveal ---------- */
const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const delay = el.dataset.delay || 0;
      setTimeout(() => {
        el.classList.add('visible');
      }, delay);
      revealObserver.unobserve(el);
    }
  });
}, { threshold: 0.12 });

reveals.forEach((el) => revealObserver.observe(el));

/* ---------- Active Nav Link ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('active'));
      const id = entry.target.id;
      const active = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });

sections.forEach(s => navObserver.observe(s));

/* ---------- Duplicate Ticker for Infinite Scroll (industries only — ticker-track duplicated in HTML) ---------- */
document.querySelectorAll('.industries-track').forEach(track => {
  const children = [...track.children];
  children.forEach(child => {
    track.appendChild(child.cloneNode(true));
  });
});

/* ---------- Contact Form Submit ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Sending…</span>';
    btn.disabled = true;

    // Formspree endpoint — replace YOUR_FORM_ID with actual ID
    const formData = new FormData(contactForm);
    const formspreeId = contactForm.dataset.formspree || 'YOUR_FORM_ID';

    try {
      const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        showNotification('✓ Thank you! We\'ll be in touch shortly.', 'success');
        contactForm.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch {
      showNotification('Something went wrong. Please email us directly at info@synsassociates.in', 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/* ---------- Notification Toast ---------- */
function showNotification(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: ${type === 'success' ? '#0f1f45' : '#dc2626'};
    color: #fff;
    padding: 16px 28px;
    border-radius: 10px;
    font-size: .92rem;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 8px 32px rgba(0,0,0,.2);
    transition: transform .4s cubic-bezier(.4,0,.2,1), opacity .4s;
    max-width: 420px;
    text-align: center;
  `;

  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 4500);
}

/* ---------- Counter Animation ---------- */
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = target * eased;
    el.textContent = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

/* ---------- Testimonial Carousel ---------- */
const testimonialCarousel = document.getElementById('testimonial-carousel');
if (testimonialCarousel) {
  const slides = [...testimonialCarousel.querySelectorAll('.testimonial-card')];
  const dots = [...testimonialCarousel.querySelectorAll('.carousel-dot')];
  let activeSlide = 0;
  let carouselTimer = null;

  function goToSlide(index) {
    if (index === activeSlide) return;

    const outgoing = slides[activeSlide];
    dots[activeSlide].classList.remove('active');
    dots[index].classList.add('active');

    outgoing.classList.remove('active');
    outgoing.classList.add('prev');
    slides[index].classList.add('active');

    setTimeout(() => outgoing.classList.remove('prev'), 650);

    activeSlide = index;
  }

  function nextSlide() {
    goToSlide((activeSlide + 1) % slides.length);
  }

  function startCarousel() {
    stopCarousel();
    carouselTimer = setInterval(nextSlide, 5000);
  }

  function stopCarousel() {
    if (carouselTimer) clearInterval(carouselTimer);
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      goToSlide(i);
      startCarousel();
    });
  });

  testimonialCarousel.addEventListener('mouseenter', stopCarousel);
  testimonialCarousel.addEventListener('mouseleave', startCarousel);
  testimonialCarousel.addEventListener('touchstart', stopCarousel, { passive: true });
  testimonialCarousel.addEventListener('touchend', startCarousel);

  startCarousel();
}

/* ---------- Smooth Scroll for anchor links ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      closeMobileNav();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
