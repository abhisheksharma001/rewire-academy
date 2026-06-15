/* ============================================
   REWIRE ACADEMY — App Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ===== Initialize Lenis Smooth Scroll =====
  if (typeof Lenis !== 'undefined') {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

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
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) item.classList.add('active');
    });
  });

  // ===== Duna Video Carousel Modal Logic =====
  const dunaCards = document.querySelectorAll('.duna-card');
  const dunaModal = document.getElementById('dunaModal');
  const dunaModalClose = document.getElementById('dunaModalClose');
  const dunaModalQuote = document.getElementById('dunaModalQuote');
  const dunaModalAuthor = document.getElementById('dunaModalAuthor');
  const dunaModalLogo = document.getElementById('dunaModalLogo');

  if (dunaModal && dunaCards.length > 0) {
    dunaCards.forEach(card => {
      card.addEventListener('click', () => {
        const quote = card.getAttribute('data-quote');
        const author = card.getAttribute('data-author');
        const logo = card.getAttribute('data-logo');

        if (dunaModalQuote) dunaModalQuote.textContent = `"${quote}"`;
        if (dunaModalAuthor) dunaModalAuthor.textContent = author;
        if (dunaModalLogo) dunaModalLogo.textContent = logo;

        dunaModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeDunaModal = () => {
      dunaModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (dunaModalClose) dunaModalClose.addEventListener('click', closeDunaModal);
    dunaModal.addEventListener('click', (e) => {
      if (e.target === dunaModal) closeDunaModal();
    });
  }

  // ===== Course Bento Modal Logic =====
  const courseCards = document.querySelectorAll('.course-bento-card');
  const courseModal = document.getElementById('courseModal');
  const courseModalClose = document.getElementById('courseModalClose');
  
  const courseData = {
    'starter': {
      step: 'STEP 1: The Foundation',
      title: '14-Day Starter',
      desc: '14 days continuous • 2 hours daily. Build your first AI workflow, master prompt engineering, and discover if this path is right for you. (MRP: ₹25k)',
      features: ['Live, beginner-friendly', '20+ AI tools from Day 1', 'Build your first AI workflow', 'Certificate of completion'],
      link: 'starter.html'
    },
    'professional': {
      step: 'STEP 2: Mastery',
      title: '3-Month Professional',
      desc: 'Weekends only • 26 days total. Deep GenAI & LLM mastery. Build no-code AI agents, custom GPTs, and automate workflows. (MRP: ₹75k)',
      features: ['Everything in Starter', 'No-code AI agents (Make/Zapier)', 'Custom GPT creation & deployment', '1:1 mentorship sessions'],
      link: 'professional.html'
    },
    'specialist': {
      step: 'STEP 3: Engineering',
      title: '6-Month Specialist',
      desc: 'Weekends only • 52 days total. Master LangChain, RAG, Vector DBs, and deploy production-ready multi-agent systems with Python. (MRP: ₹3 Lakh)',
      features: ['Everything in Professional', 'LangChain, RAG, Vector DBs', 'Build & deploy real AI products', 'Multi-agent systems', 'Career placement support'],
      link: 'specialist.html'
    }
  };

  if (courseModal && courseCards.length > 0) {
    courseCards.forEach(card => {
      card.addEventListener('click', () => {
        const courseId = card.getAttribute('data-course-id');
        const data = courseData[courseId];
        
        if (data) {
          document.getElementById('courseModalStep').textContent = data.step;
          document.getElementById('courseModalTitle').textContent = data.title;
          document.getElementById('courseModalDesc').textContent = data.desc;
          document.getElementById('courseModalLink').href = data.link;
          
          const featuresList = document.getElementById('courseModalFeatures');
          featuresList.innerHTML = '';
          data.features.forEach(feature => {
            const li = document.createElement('li');
            li.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0088FF" stroke-width="2" style="margin-right:8px;vertical-align:text-bottom;"><polyline points="20 6 9 17 4 12"></polyline></svg> ${feature}`;
            featuresList.appendChild(li);
          });

          courseModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    const closeCourseModal = () => {
      courseModal.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (courseModalClose) courseModalClose.addEventListener('click', closeCourseModal);
    courseModal.addEventListener('click', (e) => {
      if (e.target === courseModal) closeCourseModal();
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
      link: 'https://wa.me/919876543210?text=Hi,%20I%20took%20the%20quiz%20and%20got%20Starter!'
    },
    professional: {
      title: 'Professional Program',
      desc: 'You are ready to commit. The 8-week Professional program will give you the skills and portfolio to stand out.',
      link: 'https://wa.me/919876543210?text=Hi,%20I%20took%20the%20quiz%20and%20got%20Professional!'
    },
    specialist: {
      title: 'Specialist Program',
      desc: 'You are all in. The Specialist program offers advanced training, 1:1 mentorship, and career placement support.',
      link: 'https://wa.me/919876543210?text=Hi,%20I%20took%20the%20quiz%20and%20got%20Specialist!'
    }
  };

  let quizIndex = 0;
  let quizScores = { starter: 0, professional: 0, specialist: 0 };

  function renderQuizQuestion() {
    const q = quizData[quizIndex];
    quizQuestion.textContent = q.question;
    quizOptions.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = opt.text;
      btn.addEventListener('click', () => {
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

  function showQuizResult() {
    quizProgressFill.style.width = '100%';
    const winner = Object.keys(quizScores).reduce((a, b) => quizScores[a] > quizScores[b] ? a : b);
    const result = quizResults[winner];
    quizQuestion.innerHTML = `<div class="quiz-result-title">${result.title}</div>`;
    quizOptions.innerHTML = `
      <p class="quiz-result-desc">${result.desc}</p>
      <a href="${result.link}" class="btn btn-primary" target="_blank" style="width:100%;">Enquire on WhatsApp</a>
      <button class="btn btn-ghost" id="quizRestart" style="width:100%;margin-top:10px;">Retake Quiz</button>
    `;
    document.getElementById('quizRestart').addEventListener('click', () => {
      quizIndex = 0;
      quizScores = { starter: 0, professional: 0, specialist: 0 };
      quizProgressFill.style.width = '25%';
      renderQuizQuestion();
    });
  }

  function openQuiz() {
    quizModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    quizIndex = 0;
    quizScores = { starter: 0, professional: 0, specialist: 0 };
    quizProgressFill.style.width = '25%';
    renderQuizQuestion();
  }
  function closeQuiz() {
    quizModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (quizOpenBtn) quizOpenBtn.addEventListener('click', openQuiz);
  if (quizClose) quizClose.addEventListener('click', closeQuiz);
  if (quizModal) {
    quizModal.addEventListener('click', (e) => {
      if (e.target === quizModal) closeQuiz();
    });
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
      
      ScrollTrigger.scrollerProxy(document.body, {
        scrollTop(value) {
          return arguments.length ? lenisInstance.scrollTo(value, { immediate: true }) : lenisInstance.scroll;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        }
      });
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

  // ===== Live Countdown Timer =====
  const countdownDisplay = document.getElementById('countdownDisplay');
  if (countdownDisplay) {
    // Set target date to next Monday
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7));
    targetDate.setHours(9, 0, 0, 0);

    function updateCountdown() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        countdownDisplay.textContent = 'Started!';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);

      countdownDisplay.textContent = `${days} days ${hours} hours ${minutes} minutes`;
    }

    updateCountdown();
    setInterval(updateCountdown, 60000);
  }

  // ===== Marquee Pause on Hover =====
  const marqueeTrack = document.getElementById('marqueeTrack');
  if (marqueeTrack) {
    const marqueeSection = marqueeTrack.closest('.marquee');
    if (marqueeSection) {
      marqueeSection.addEventListener('mouseenter', () => {
        marqueeTrack.style.animationPlayState = 'paused';
      });
      marqueeSection.addEventListener('mouseleave', () => {
        marqueeTrack.style.animationPlayState = 'running';
      });
    }
  }

  // ===== Newsletter Form =====
  // NOTE: js/form-handler.js now manages form submissions to the n8n webhook.
  // Only attach the local fallback UI handler if the webhook handler isn't present.
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm && !newsletterForm.dataset.webhookAttached) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = newsletterForm.querySelector('button');
      const original = btn.textContent;
      btn.textContent = 'Subscribed';
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = original;
        btn.disabled = false;
        newsletterForm.reset();
      }, 3000);
    });
  }

  // ===== Offer Timer =====
  const offerTimer = document.getElementById('offerTimer');
  if (offerTimer) {
    let timeRemaining = 281; // 4 min 41 sec
    setInterval(() => {
      if (timeRemaining > 0) {
        timeRemaining--;
        const mins = Math.floor(timeRemaining / 60);
        const secs = timeRemaining % 60;
        offerTimer.textContent = `Offer expires in ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }
});

