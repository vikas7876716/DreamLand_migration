/* Dreamland Migration Services — interactions */
(function () {
  'use strict';

  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky nav shadow
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      })
    );
  }

  // Active nav link based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');
  const setActive = () => {
    const y = window.scrollY + 120;
    let current = '';
    sections.forEach(s => { if (y >= s.offsetTop) current = s.id; });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  };
  window.addEventListener('scroll', setActive, { passive: true });

  // Reveal on scroll
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }

  // Contact form (Formspree)
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form-status';

      // Basic validation
      const requiredFields = ['name', 'email', 'phone', 'service'];
      for (const f of requiredFields) {
        const input = form.querySelector(`[name="${f}"]`);
        if (!input || !input.value.trim()) {
          status.textContent = 'Please fill all required fields.';
          status.classList.add('error');
          input && input.focus();
          return;
        }
      }
      const email = form.querySelector('[name="email"]').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = 'Please enter a valid email address.';
        status.classList.add('error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const label = submitBtn.querySelector('.btn-label');
      const loading = submitBtn.querySelector('.btn-loading');
      submitBtn.disabled = true;
      if (label) label.hidden = true;
      if (loading) loading.hidden = false;

      const action = form.getAttribute('action') || '';
      const isFormspreeConfigured = action.includes('formspree.io/f/');

      try {
        if (isFormspreeConfigured) {
          const data = new FormData(form);
          const res = await fetch(action, {
            method: 'POST',
            body: data,
            headers: { 'Accept': 'application/json' }
          });
          if (res.ok) {
            form.reset();
            status.textContent = 'Thank you! Your request has been sent. We will reach out within 24 hours.';
            status.classList.add('success');
          } else {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || 'Submission failed');
          }
        } else {
          // Demo mode — Formspree endpoint not configured
          await new Promise(r => setTimeout(r, 800));
          form.reset();
          status.textContent = 'Demo mode: form is captured locally. Replace the Formspree endpoint in index.html (action="https://formspree.io/f/yourFormId") to receive real submissions.';
          status.classList.add('success');
          console.log('[Dreamland] Demo submission captured:', Object.fromEntries(new FormData(form)));
        }
      } catch (err) {
        status.textContent = 'Sorry, something went wrong. Please try again or call us directly.';
        status.classList.add('error');
        console.error(err);
      } finally {
        submitBtn.disabled = false;
        if (label) label.hidden = false;
        if (loading) loading.hidden = true;
      }
    });
  }
})();