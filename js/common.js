/**
 * REWIRE ACADEMY — Shared behaviors for all pages
 * Mobile menu, nav scroll state, reveal animations, FAQ accordion.
 */
(function () {
  'use strict';

  // Mobile menu toggle
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  function openMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'true');
    }
  }

  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      if (mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileMenuClose && mobileMenu) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  // Close mobile menu when clicking a link inside it
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  // Nav scroll state
  const nav = document.getElementById('nav');
  if (nav) {
    function updateNavScroll() {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    updateNavScroll();
    window.addEventListener('scroll', updateNavScroll, { passive: true });
  }

  // Reveal animations
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => revealObserver.observe(reveal));
  }

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const item = button.closest('.faq-item');
      const isOpen = item && item.classList.contains('open');

      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open');
        const q = i.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen && item) {
        item.classList.add('open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();
