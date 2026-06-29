/**
 * REWIRE ACADEMY — Qualifying Questions Form (4 Steps)
 *
 * This page comes AFTER register.html. Contact info + course are already
 * captured and stored in sessionStorage by form-handler.js.
 *
 * Steps:
 *   1. What do you currently do?
 *   2. How many years of work experience?
 *   3. What is your goal?
 *   4. Are you into No-Code?
 *
 * On completion, merges question answers with registration data,
 * saves to sessionStorage, and redirects to success page.
 */
(function () {
  'use strict';

  const TOTAL_STEPS = 3;
  let currentStep = 1;

  // Collected answers
  const answers = {
    current_role: '',
    work_experience: '',
    goal: '',
  };

  // DOM references
  const progressFill = document.getElementById('progressFill');
  const stepIndicator = document.getElementById('stepIndicator');
  const backBtn = document.getElementById('backBtn');
  const allSteps = document.querySelectorAll('.mf-step');

  // ─── Utility ───────────────────────────────────────────────
  function getReadableDate() {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  }

  // ─── Progress Bar ──────────────────────────────────────────
  function updateProgress() {
    const pct = (currentStep / TOTAL_STEPS) * 100;
    progressFill.style.width = pct + '%';
    stepIndicator.textContent = 'Step ' + currentStep + ' of ' + TOTAL_STEPS;
  }

  // ─── Step Navigation ──────────────────────────────────────
  function showStep(step) {
    allSteps.forEach(function (el) {
      el.classList.remove('active');
      if (parseInt(el.dataset.step, 10) === step) {
        el.classList.add('active');
      }
    });
    backBtn.style.display = step === 1 ? 'none' : 'flex';
    updateProgress();
  }

  function goNext() {
    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      showStep(currentStep);
      document.querySelector('.mf-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function goBack() {
    if (currentStep > 1) {
      currentStep--;
      showStep(currentStep);
      document.querySelector('.mf-wrapper').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ─── Option Card Selection ─────────────────────────────────
  function initOptionCards() {
    document.querySelectorAll('.mf-option-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var step = this.closest('.mf-step');
        step.querySelectorAll('.mf-option-card').forEach(function (c) {
          c.classList.remove('selected');
        });
        this.classList.add('selected');
      });
    });
  }

  function getSelectedOption(stepNum) {
    var step = document.querySelector('.mf-step[data-step="' + stepNum + '"]');
    var selected = step ? step.querySelector('.mf-option-card.selected') : null;
    return selected ? selected.dataset.value : '';
  }

  // ─── Next Button Handlers ─────────────────────────────────
  function initNextButtons() {
    for (var s = 1; s <= TOTAL_STEPS; s++) {
      var btn = document.getElementById('nextStep' + s);
      if (!btn) continue;
      btn.addEventListener('click', (function (stepNum) {
        return function () {
          var value = getSelectedOption(stepNum);
          if (!value) {
            var stepEl = document.querySelector('.mf-step[data-step="' + stepNum + '"]');
            var errEl = stepEl.querySelector('.mf-step-error');
            if (errEl) {
              errEl.textContent = 'Please select an option to continue.';
              setTimeout(function () { errEl.textContent = ''; }, 3000);
            }
            return;
          }

          // Store the value
          var fieldMap = {
            1: 'current_role',
            2: 'work_experience',
            3: 'goal',
          };
          answers[fieldMap[stepNum]] = value;

          if (stepNum === TOTAL_STEPS) {
            completeForm();
          } else {
            goNext();
          }
        };
      })(s));
    }
  }

  // ─── Form Completion ───────────────────────────────────────
  function completeForm() {
    // Read registration data saved by form-handler.js
    var regData = {};
    try {
      var raw = sessionStorage.getItem('rewire_registration_data');
      if (raw) regData = JSON.parse(raw);
    } catch (e) {
      console.warn('Could not read registration data:', e);
    }

    // Merge registration data with question answers
    var payload = {
      // From register.html
      full_name: (regData.fields && regData.fields.full_name) || '',
      phone: (regData.fields && regData.fields.phone) || '',
      email: (regData.fields && regData.fields.email) || '',
      course: regData.course || '',
      // From this form
      current_role: answers.current_role,
      work_experience: answers.work_experience,
      goal: answers.goal,
      // Tracking
      form_filled: true,
      whatsapp_joined: null, // determined on success page
      submitted_at: getReadableDate(),
      // Carry over UTM/tracking from registration
      utm_source: regData.utm_source || '',
      utm_campaign: regData.utm_campaign || '',
      source_type: regData.source_type || '',
      referrer: regData.referrer || '',
      page_url: regData.page_url || '',
      source_page: regData.source_page || '',
      cta_location: regData.cta_location || '',
    };

    // Save combined payload for the success page
    try {
      sessionStorage.setItem('rewire_mastermind_data', JSON.stringify(payload));
    } catch (e) {
      console.warn('sessionStorage unavailable:', e);
    }

    // Redirect to success page
    window.location.href = 'mastermind-success.html';
  }

  // ─── Back Button ───────────────────────────────────────────
  function initBackButton() {
    backBtn.addEventListener('click', goBack);
  }

  // ─── Initialize ────────────────────────────────────────────
  function init() {
    showStep(1);
    initOptionCards();
    initNextButtons();
    initBackButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
