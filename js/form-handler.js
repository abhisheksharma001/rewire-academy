/**
 * REWIRE ACADEMY — Form-to-n8n Webhook Handler
 *
 * Security notes:
 * - The n8n endpoint is obfuscated but still client-visible. For production,
 *   move the POST call to a backend/cloud-function proxy so the real URL is
 *   never exposed.
 * - This file includes honeypot, per-form rate limiting, bot timing checks,
 *   and field-level validation as defense-in-depth.
 */

(function () {
  'use strict';

  // Obfuscated webhook URL — split and encoded to avoid trivial scraping.
  const WEBHOOK_PARTS = [
    atob('aHR0cHM6Ly9hYmhpc2hla3NoYXI2NDkuYXBwLm44bi5jbG91ZC93ZWJob29rLw=='),
    atob('OGI4NTA3ZDYtMTdmNy00ZDFjLTkwMGMtMGEyYzBkMDdkNTYz'),
  ];
  const WEBHOOK_URL = WEBHOOK_PARTS.join('');

  // Timestamp when the page loaded — used for basic bot detection.
  const pageLoadTime = Date.now();

  /**
   * Reads a URL query parameter by name.
   * @param {string} name
   */
  function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name) || '';
  }

  /**
   * Returns current date/time in a normal, readable format.
   * Example: "11 Jun 2026, 4:11:24 pm"
   */
  function getReadableDate() {
    return new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });
  }

  /**
   * Extracts the page filename from the current URL.
   * Example: "https://example.com/starter.html?course=abc" → "starter.html"
   */
  function getSourcePage() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  }

  /**
   * Creates a URL-friendly slug from the course name.
   */
  function slugify(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Determines traffic type from referrer.
   */
  function getSourceType() {
    const referrer = document.referrer || '';
    if (!referrer) return 'direct';
    if (referrer.includes(window.location.hostname)) return 'internal';
    return 'referral';
  }

  /**
   * Validates a single field and displays/clears its error message.
   * Returns true if valid.
   */
  function validateField(input) {
    const errorId = input.getAttribute('aria-describedby');
    const errorEl = errorId ? document.getElementById(errorId) : null;
    let message = '';

    if (input.type === 'checkbox') {
      if (input.required && !input.checked) {
        message = 'Please check this box to continue.';
      }
    } else if (input.type === 'email') {
      const value = input.value.trim();
      if (!value) {
        message = 'Email is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = 'Please enter a valid email address.';
      }
    } else if (input.name === 'phone') {
      const digits = input.value.replace(/\D/g, '');
      if (!input.value.trim()) {
        message = 'Phone number is required.';
      } else if (!/^[6-9]\d{9}$/.test(digits)) {
        message = 'Please enter a valid 10-digit Indian mobile number.';
      }
    } else if (input.name === 'full_name') {
      const value = input.value.trim();
      if (!value) {
        message = 'Full name is required.';
      } else if (value.length < 2) {
        message = 'Name must be at least 2 characters.';
      }
    } else if (input.required && !input.value.trim()) {
      message = 'This field is required.';
    }

    if (message) {
      input.classList.add('invalid');
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.classList.remove('invalid');
      input.setAttribute('aria-invalid', 'false');
    }

    if (errorEl) {
      errorEl.textContent = message;
    }

    return !message;
  }

  /**
   * Validates all fields in a form.
   */
  function validateFormFields(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    inputs.forEach((input) => {
      if (input.type === 'submit' || input.name === 'website') return;
      if (!validateField(input)) isValid = false;
    });
    return isValid;
  }

  /**
   * Validates the form submission before sending.
   */
  function validateSubmission(form, formType) {
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      throw new Error('Bot detected');
    }

    if (!validateFormFields(form)) {
      throw new Error('Please fix the errors above');
    }

    const rateLimitKey = `rewireLastSubmit_${formType}`;
    const lastSubmit = window.localStorage.getItem(rateLimitKey);
    if (lastSubmit && Date.now() - parseInt(lastSubmit, 10) < 60000) {
      throw new Error('Please wait a moment before submitting again');
    }

    if (Date.now() - pageLoadTime < 3000) {
      throw new Error('Form submitted too quickly');
    }
  }

  /**
   * Records the last submission timestamp for rate limiting.
   */
  function recordSubmission(formType) {
    try {
      window.localStorage.setItem(`rewireLastSubmit_${formType}`, Date.now().toString());
    } catch (e) {
      // localStorage may be unavailable in private mode
    }
  }

  /**
   * Sends form payload to the n8n webhook with a timeout.
   */
  async function sendToWebhook(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Webhook responded with ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Builds a clean, parsable payload from a form element.
   */
  function buildPayload(form, formType) {
    const formData = new FormData(form);
    const fields = {};

    formData.forEach((value, key) => {
      if (fields.hasOwnProperty(key)) {
        fields[key] = [].concat(fields[key], value);
      } else {
        fields[key] = value;
      }
    });

    // Course tracking: form field beats URL param
    const courseFromField = fields.course || '';
    const courseFromUrl = getUrlParam('course');
    const course = courseFromField || courseFromUrl || 'Not specified';
    delete fields.course;

    // Remove honeypot from payload; sanitize phone
    delete fields.website;
    if (fields.phone) {
      fields.phone = String(fields.phone).replace(/\D/g, '');
    }

    const consentGiven = fields.consent === 'on' || fields.consent === true || fields.consent === 'true';
    delete fields.consent;

    return {
      keyword: form.dataset.keyword || formType,
      form_type: formType,
      course: course,
      course_slug: slugify(course),
      consent: consentGiven,
      page_url: window.location.href,
      source_page: getSourcePage(),
      source_type: getSourceType(),
      cta_location: getUrlParam('cta') || '',
      referrer: document.referrer || '',
      utm_source: getUrlParam('utm_source'),
      utm_campaign: getUrlParam('utm_campaign'),
      submitted_at: getReadableDate(),
      user_agent: navigator.userAgent,
      fields: fields,
    };
  }

  /**
   * Announces a message to screen readers.
   */
  function announce(message) {
    let announcer = document.getElementById('formAnnouncer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'formAnnouncer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.style.position = 'absolute';
      announcer.style.left = '-10000px';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      document.body.appendChild(announcer);
    }
    announcer.textContent = message;
  }

  /**
   * Attaches submit handler to a form.
   */
  function attachHandler(form, formType) {
    if (!form || form.dataset.webhookAttached) return;
    form.dataset.webhookAttached = 'true';

    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      if (input.type === 'submit' || input.name === 'website') return;
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) validateField(input);
      });
    });

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        validateSubmission(form, formType);
        const payload = buildPayload(form, formType);
        await sendToWebhook(payload);
        recordSubmission(formType);

        if (submitButton) {
          submitButton.textContent = 'Sent!';
        }
        form.reset();

        const message = 'Thanks! We received your submission.';
        showFeedback(form, message, 'success');
        announce(message);
      } catch (error) {
        console.error('Webhook error:', error);
        if (submitButton) {
          submitButton.textContent = 'Try Again';
        }
        const message = error.message || 'Something went wrong. Please try again.';
        showFeedback(form, message, 'error');
        announce(message);
      } finally {
        setTimeout(() => {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
          }
        }, 3000);
      }
    });
  }

  /**
   * Shows a small inline message after the form.
   */
  function showFeedback(form, message, type) {
    let feedback = form.parentElement.querySelector('.form-feedback');
    if (!feedback) {
      feedback = document.createElement('p');
      feedback.className = 'form-feedback';
      feedback.style.marginTop = '12px';
      feedback.style.fontSize = '0.9rem';
      form.insertAdjacentElement('afterend', feedback);
    }
    feedback.textContent = message;
    feedback.style.color = type === 'success' ? '#22c55e' : '#ef4444';

    setTimeout(() => {
      feedback.textContent = '';
    }, 5000);
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      attachHandler(newsletterForm, 'newsletter');
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      attachHandler(registerForm, 'registration');
    }
  }
})();
