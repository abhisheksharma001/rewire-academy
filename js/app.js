/* ============================================
   REWIRE ACADEMY — App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ===== Disable heavy animations on slow networks =====
  const isSlowNetwork = navigator.connection && (navigator.connection.effectiveType === '2g' || navigator.connection.saveData);
  if (isSlowNetwork) {
    document.body.classList.add('reduce-motion');
  }

  // ===== Mobile Nav =====
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  function openMobileMenu() {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle) navToggle.addEventListener('click', openMobileMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMobileMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMobileMenu));

  // Swipe right to close mobile menu
  let touchStartX = 0;
  if (mobileMenu) {
    mobileMenu.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
    mobileMenu.addEventListener('touchend', e => {
      if (e.changedTouches[0].screenX - touchStartX > 50) closeMobileMenu();
    }, {passive: true});
  }

  // ===== Mega Menu Keyboard / ARIA =====
  const programsDropdown = document.querySelector('.nav-item-dropdown');
  const programsTrigger = document.getElementById('programsTrigger');
  const megaMenu = document.getElementById('megaMenu');
  if (programsDropdown && programsTrigger && megaMenu) {
    const megaFocusables = Array.from(megaMenu.querySelectorAll('a[href], button'));
    let keyboardOpen = false;

    function openMegaMenu(fromKeyboard = false) {
      programsDropdown.classList.add('open');
      programsTrigger.setAttribute('aria-expanded', 'true');
      if (fromKeyboard) {
        keyboardOpen = true;
        if (megaFocusables.length) megaFocusables[0].focus();
      }
    }
    function closeMegaMenu(returnFocus = false) {
      programsDropdown.classList.remove('open');
      programsTrigger.setAttribute('aria-expanded', 'false');
      keyboardOpen = false;
      if (returnFocus) programsTrigger.focus();
    }

    programsTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (programsDropdown.classList.contains('open')) {
        closeMegaMenu();
      } else {
        openMegaMenu(true);
      }
    });

    programsTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        openMegaMenu(true);
      }
      if (e.key === 'Escape' && programsDropdown.classList.contains('open')) {
        e.preventDefault();
        closeMegaMenu(true);
      }
    });

    megaMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMegaMenu(true);
        return;
      }
      if (e.key === 'Tab' && megaFocusables.length) {
        const first = megaFocusables[0];
        const last = megaFocusables[megaFocusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          closeMegaMenu(true);
        } else if (!e.shiftKey && document.activeElement === last) {
          closeMegaMenu();
        }
      }
    });

    document.addEventListener('focusin', (e) => {
      if (keyboardOpen && !programsDropdown.contains(e.target)) {
        closeMegaMenu(false);
      }
    });
    document.addEventListener('click', (e) => {
      if (programsDropdown.classList.contains('open') && !programsDropdown.contains(e.target)) {
        closeMegaMenu(false);
      }
    });

    window.addEventListener('scroll', () => {
      if (programsDropdown.classList.contains('open')) {
        closeMegaMenu(false);
      }
    }, { passive: true });
  }

  // ===== Global Escape Key for Modals =====
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.duna-modal.active, .mobile-menu.active, .quiz-modal.active');
      activeModals.forEach(m => m.classList.remove('active'));
      document.body.style.overflow = '';
    }
  });

  // ===== Navbar Background on Scroll & Intersection Observer for Active Links =====
  const nav = document.getElementById('nav');
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

  // ===== Sticky Bottom CTA Bar =====
  const stickyCtaBar = document.getElementById('stickyCtaBar');
  function updateStickyCta() {
    if (!stickyCtaBar) return;
    if (window.scrollY > window.innerHeight * 0.8) {
      stickyCtaBar.classList.add('visible');
    } else {
      stickyCtaBar.classList.remove('visible');
    }
  }

  function updateNav() {
    if (nav) {
      if (window.scrollY > 60) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    updateStickyCta();
  }

  // Intersection Observer for Active Nav State
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navItems.forEach(link => {
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.classList.add('active-nav-link');
          } else {
            link.classList.remove('active-nav-link');
          }
        });
      }
    });
  }, { rootMargin: '-20% 0px -80% 0px' });
  sections.forEach(section => navObserver.observe(section));

  // Debounce scroll for performance
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) cancelAnimationFrame(scrollTimeout);
    scrollTimeout = requestAnimationFrame(() => {
      updateNav();
    });
  }, { passive: true });
  updateNav();

  // ===== Scroll Reveal =====
  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px 0px 0px' });
  revealEls.forEach(el => revealObserver.observe(el));

  // Safety fallback: force all reveal elements visible after 1.5s
  // in case IntersectionObserver misses them (e.g. cached pages, tab switch)
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 1500);

  // ===== Stats Counter Animation =====
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsSection = document.getElementById('stats');
  let statsAnimated = false;

  function animateStats() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.dataset.count, 10);
      const suffix = stat.textContent.includes('%') ? '%' : '+';
      const duration = 2000;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        stat.textContent = current + (target === 95 ? '%' : '+');
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateStats();
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  if (statsSection) statsObserver.observe(statsSection);

  // ===== FAQ Accordion =====
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  // ===== Shared Focus Trap for Modals =====
  function trapFocus(container, closeFn) {
    container.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const focusables = Array.from(container.querySelectorAll('a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  const quizModal = document.getElementById('quizModal');
  const quizOpenBtn = document.getElementById('quizOpenBtn');
  const quizClose = document.getElementById('quizClose');
  const quizQuestion = document.getElementById('quizQuestion');
  const quizOptions = document.getElementById('quizOptions');
  const quizProgressFill = document.getElementById('quizProgressFill');

  const quizData = [
    {
      question: 'What best describes your current situation?',
      options: [
        { text: 'I am a student or recent graduate', scores: { starter: 2, professional: 1, specialist: 0 } },
        { text: 'I work full-time and want to upskill', scores: { starter: 0, professional: 2, specialist: 1 } },
        { text: 'I want to switch careers into AI', scores: { starter: 1, professional: 1, specialist: 2 } },
        { text: 'I am exploring AI out of curiosity', scores: { starter: 3, professional: 0, specialist: 0 } }
      ]
    },
    {
      question: 'How much time can you commit per week?',
      options: [
        { text: '2-3 hours', scores: { starter: 3, professional: 0, specialist: 0 } },
        { text: '4-6 hours', scores: { starter: 1, professional: 2, specialist: 0 } },
        { text: '6-8 hours', scores: { starter: 0, professional: 2, specialist: 1 } },
        { text: '8+ hours', scores: { starter: 0, professional: 1, specialist: 3 } }
      ]
    },
    {
      question: 'What is your coding experience?',
      options: [
        { text: 'None or very little', scores: { starter: 3, professional: 1, specialist: 0 } },
        { text: 'Basic Python or scripting', scores: { starter: 1, professional: 2, specialist: 1 } },
        { text: 'Comfortable with code', scores: { starter: 0, professional: 2, specialist: 2 } },
        { text: 'I build things regularly', scores: { starter: 0, professional: 1, specialist: 3 } }
      ]
    },
    {
      question: 'What is your primary goal?',
      options: [
        { text: 'Understand what AI can do', scores: { starter: 3, professional: 0, specialist: 0 } },
        { text: 'Add AI to my current role', scores: { starter: 0, professional: 3, specialist: 1 } },
        { text: 'Build a portfolio of projects', scores: { starter: 0, professional: 2, specialist: 2 } },
        { text: 'Get hired as an AI engineer', scores: { starter: 0, professional: 1, specialist: 3 } }
      ]
    }
  ];

  const quizResults = {
    starter: {
      title: 'Starter Program',
      desc: 'You are at the beginning of your journey. Join our free weekly mastermind to explore AI with zero commitment.',
      link: 'register.html?course=14-Day%20AI%20Generalist%20Accelerator'
    },
    professional: {
      title: 'Professional Program',
      desc: 'You are ready to commit. The 3-month Professional program will give you the skills and portfolio to stand out.',
      link: 'register.html?course=3-Month%20Applied%20AI%20Live'
    },
    specialist: {
      title: 'Specialist Program',
      desc: 'You are all in. The 6-month Specialist program offers advanced training, 1:1 mentorship, and career placement support.',
      link: 'register.html?course=6-Month%20AI%20Engineering%20Specialist'
    }
  };

  let quizIndex = 0;
  let quizScores = { starter: 0, professional: 0, specialist: 0 };
  let quizAnswers = [];

  function renderQuizQuestion() {
    const q = quizData[quizIndex];
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
        quizAnswers.push({ question: q.question, answer: opt.text });
        Object.keys(opt.scores).forEach(k => quizScores[k] += opt.scores[k]);
        quizIndex++;
        if (quizIndex < quizData.length) {
          quizProgressFill.style.width = ((quizIndex + 1) / quizData.length * 100) + '%';
          renderQuizQuestion();
        } else {
          showQuizResult();
        }
      });
      quizOptions.appendChild(btn);
    });
  }

  function getReadableDate() {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  }

  function sendQuizCapture(winner, result) {
    const payload = {
      keyword: 'quiz_capture',
      form_type: 'quiz',
      quiz_result: result.title,
      quiz_result_key: winner,
      quiz_scores: quizScores,
      quiz_answers: quizAnswers,
      page_url: window.location.href,
      source_page: window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1) || 'index.html',
      referrer: document.referrer || '',
      submitted_at: getReadableDate(),
      user_agent: navigator.userAgent,
    };

    const url = window.REWIRE_WEBHOOK_URL;
    if (!url) return;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => {
      // Silent fail — don't block the user experience.
      console.error('Quiz capture error:', err);
    });
  }

  function showQuizResult() {
    quizProgressFill.style.width = '100%';
    const winner = Object.keys(quizScores).reduce((a, b) => quizScores[a] > quizScores[b] ? a : b);
    const result = quizResults[winner];
    sendQuizCapture(winner, result);
    quizQuestion.innerHTML = `<div class="quiz-result-title">${result.title}</div>`;
    quizOptions.innerHTML = `
      <p class="quiz-result-desc">${result.desc}</p>
      <a href="${result.link}" class="btn btn-primary" style="width:100%;">Register for this program →</a>
      <button class="btn btn-ghost" id="quizRestart" style="width:100%;margin-top:10px;">Retake Quiz</button>
    `;
    document.getElementById('quizRestart').addEventListener('click', () => {
      quizIndex = 0;
      quizScores = { starter: 0, professional: 0, specialist: 0 };
      quizAnswers = [];
      quizProgressFill.style.width = '25%';
      renderQuizQuestion();
    });
  }

  let lastFocusedBeforeQuiz = null;

  function openQuiz() {
    lastFocusedBeforeQuiz = document.activeElement;
    quizModal.classList.add('active');
    quizModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    quizIndex = 0;
    quizScores = { starter: 0, professional: 0, specialist: 0 };
    quizAnswers = [];
    quizProgressFill.style.width = '25%';
    renderQuizQuestion();
    if (quizClose) quizClose.focus();
  }
  function closeQuiz() {
    quizModal.classList.remove('active');
    quizModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedBeforeQuiz && lastFocusedBeforeQuiz.focus) {
      lastFocusedBeforeQuiz.focus();
    }
  }

  if (quizOpenBtn) quizOpenBtn.addEventListener('click', openQuiz);
  if (quizClose) quizClose.addEventListener('click', closeQuiz);
  if (quizModal) {
    quizModal.addEventListener('click', (e) => {
      if (e.target === quizModal) closeQuiz();
    });
    trapFocus(quizModal, closeQuiz);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && quizModal && quizModal.classList.contains('active')) closeQuiz();
  });

  // Journey Animation removed in favor of static CSS grid

    // Animate hero progress bar after load
    setTimeout(() => {
      const heroProgress = document.getElementById('heroProgress');
      if (heroProgress) heroProgress.style.width = '70%';
    }, 800);


  // ===== Hero Animation Initialization =====
  const runHeroAnimations = () => {
    // Animate hero content elements in sequence with GSAP
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.1 });
      gsap.fromTo('.hero-headline', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, delay: 0.3 });
      gsap.fromTo('.hero-subline', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.5 });
      gsap.fromTo('.hero-ctas', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.7 });
    }
  };

  if (document.readyState === 'complete') {
    runHeroAnimations();
  } else {
    window.addEventListener('load', runHeroAnimations);
  }


  // ===== Intersection Observer for Hero Animation Pause =====
  const heroSection = document.getElementById('hero');
  if (heroSection) {
    const meshGradients = document.querySelectorAll('.mesh-gradient');
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        meshGradients.forEach(mesh => {
          if (entry.isIntersecting) {
            mesh.style.animationPlayState = 'running';
          } else {
            mesh.style.animationPlayState = 'paused';
          }
        });
      });
    }, { threshold: 0 });
    heroObserver.observe(heroSection);
  }

  // ===== Lenis Smooth Scroll =====
  let lenisInstance = null;
  if (typeof Lenis !== 'undefined' && !isSlowNetwork) {
    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis scroll with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenisInstance.on('scroll', ScrollTrigger.update);
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenisInstance.scrollTo(target, { offset: -80 });
        }
      });
    });
  } else {
    // Fallback simple smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // ===== Course Detail Modal =====
  const courseModal = document.getElementById('courseModal');
  const courseModalBackdrop = document.getElementById('courseModalBackdrop');
  const courseModalClose = document.getElementById('courseModalClose');
  const courseModalCard = document.getElementById('courseModalCard');
  const programCards = document.querySelectorAll('.program-card');

  const courseDetailData = {
    starter: {
      step: 'Step 1: The Foundation',
      title: '14-Day Starter',
      desc: '14 days continuous • 2 hours daily. Build your first AI workflow, master prompt engineering, and discover if this path is right for you.',
      features: [
        'Live, beginner-friendly sessions',
        '20+ AI tools from Day 1',
        'Build your first AI workflow',
        'Certificate of completion'
      ],
      audience: [
        'Students & freshers curious about AI',
        'Working professionals exploring AI tools',
        'Founders & creators who want to automate tasks'
      ],
      link: 'register.html?course=14-Day%20Starter',
      page: 'starter.html',
      pageLabel: 'View full 14-day curriculum →'
    },
    professional: {
      step: 'Step 2: Mastery',
      title: '3-Month Professional',
      desc: 'Weekends only • 26 days total. A no-code journey from basics to AI-powered business systems. Learn business processes and implement AI to automate manual workflows.',
      features: [
        'No-code AI agents & automation',
        'Business process mapping from basics',
        'Replace manual systems with AI workflows',
        'Custom GPTs & internal AI tools',
        'Portfolio of 4 real business projects'
      ],
      audience: [
        'Working professionals & operators',
        'Product managers & founders',
        'Career switchers with no coding background'
      ],
      link: 'register.html?course=3-Month%20Professional',
      page: 'professional.html',
      pageLabel: 'View full 3-month curriculum →'
    },
    specialist: {
      step: 'Step 3: Engineering',
      title: '6-Month Specialist',
      desc: 'Weekends only • 52 days total. Master LangChain, RAG, Vector DBs, and deploy production-ready multi-agent systems with Python.',
      features: [
        'Advanced Python & agent architecture',
        'Production deployment skills',
        'Multi-agent system projects',
        'Placement & career support'
      ],
      audience: [
        'Senior engineers & architects',
        'Tech leads building AI products',
        'Engineers targeting top AI roles'
      ],
      link: 'register.html?course=6-Month%20Specialist',
      page: 'specialist.html',
      pageLabel: 'View full 6-month curriculum →'
    }
  };

  function populateCourseModal(courseKey) {
    const data = courseDetailData[courseKey];
    if (!data) return;

    document.getElementById('courseModalStep').textContent = data.step;
    document.getElementById('courseModalTitle').innerHTML = `<em>${data.title.split(' ')[0]}</em> ${data.title.split(' ').slice(1).join(' ')}`;
    document.getElementById('courseModalDesc').textContent = data.desc;

    const featuresList = document.getElementById('courseModalFeatures');
    featuresList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');

    const audienceList = document.getElementById('courseModalAudience');
    audienceList.innerHTML = data.audience.map(a => `<li>${a}</li>`).join('');

    document.getElementById('courseModalCta').href = data.link;

    const pageLink = document.getElementById('courseModalPageLink');
    if (pageLink && courseKey === 'starter' && data.page) {
      pageLink.href = data.page;
      pageLink.textContent = data.pageLabel || 'View full curriculum →';
      pageLink.style.display = 'block';
    } else if (pageLink) {
      pageLink.style.display = 'none';
    }
  }

  let lastFocusedProgramCard = null;

  function openCourseModal(card) {
    const courseKey = card.getAttribute('data-course');
    if (!courseKey || !courseDetailData[courseKey]) return;

    lastFocusedProgramCard = card;
    populateCourseModal(courseKey);

    courseModalBackdrop.classList.add('active');
    courseModal.classList.add('active');
    courseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (courseModalClose) courseModalClose.focus();
  }

  function closeCourseModal() {
    courseModalBackdrop.classList.remove('active');
    courseModal.classList.remove('active');
    courseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedProgramCard) lastFocusedProgramCard.focus();
  }

  programCards.forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.program-know-more')) {
        e.preventDefault();
        openCourseModal(card);
      }
    });
  });

  // Mega menu cards also open the course modal
  document.querySelectorAll('.mega-menu-column').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openCourseModal(card);
    });
  });

  if (courseModalClose) courseModalClose.addEventListener('click', closeCourseModal);
  if (courseModalBackdrop) courseModalBackdrop.addEventListener('click', closeCourseModal);
  if (courseModal) {
    courseModal.addEventListener('click', (e) => {
      if (e.target === courseModal) closeCourseModal();
    });
    trapFocus(courseModal, closeCourseModal);
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && courseModal && courseModal.classList.contains('active')) {
      closeCourseModal();
    }
  });


});

