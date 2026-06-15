/**
 * REWIRE ACADEMY — Form-to-n8n Webhook Handler
 * Sends every form submission to:
 * https://abhishekshar649.app.n8n.cloud/webhook/8b8507d6-17f7-4d1c-900c-0a2c0d07d563
 */

(function () {
  'use strict';

  const WEBHOOK_URL = 'https://abhishekshar649.app.n8n.cloud/webhook/8b8507d6-17f7-4d1c-900c-0a2c0d07d563';

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
   * Example: "14-Day AI Generalist Accelerator" → "14-day-ai-generalist-accelerator"
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
   * Sends form payload to the n8n webhook.
   * @param {Object} payload - Structured data to POST.
   */
  async function sendToWebhook(payload) {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  /**
   * Builds a clean, parsable payload from a form element.
   * @param {HTMLFormElement} form
   * @param {string} formType
   */
  function buildPayload(form, formType) {
    const formData = new FormData(form);
    const fields = {};

    formData.forEach((value, key) => {
      // Keep multi-value fields as arrays, single values as strings
      if (fields.hasOwnProperty(key)) {
        fields[key] = [].concat(fields[key], value);
      } else {
        fields[key] = value;
      }
    });

    // Course tracking: form field beats URL param (dropdown/hidden input wins)
    const courseFromField = fields.course || '';
    const courseFromUrl = getUrlParam('course');
    const course = courseFromField || courseFromUrl || 'Not specified';
    // Avoid duplicate course key inside fields object
    delete fields.course;

    return {
      keyword: form.dataset.keyword || formType,
      form_type: formType,
      course: course,
      course_slug: slugify(course),
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
   * Attaches submit handler to a form.
   * @param {HTMLFormElement} form
   * @param {string} formType
   */
  function attachHandler(form, formType) {
    if (!form || form.dataset.webhookAttached) return;
    form.dataset.webhookAttached = 'true';

    form.addEventListener('submit', async function (event) {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submitButton ? submitButton.textContent : '';

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }

      try {
        const payload = buildPayload(form, formType);
        await sendToWebhook(payload);

        if (submitButton) {
          submitButton.textContent = 'Sent!';
        }
        form.reset();

        // Optional: simple feedback message
        showFeedback(form, 'Thanks! We received your submission.', 'success');
      } catch (error) {
        console.error('Webhook error:', error);
        if (submitButton) {
          submitButton.textContent = 'Try Again';
        }
        showFeedback(form, 'Something went wrong. Please try again.', 'error');
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
    // Newsletter form on index.html
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      attachHandler(newsletterForm, 'newsletter');
    }

    // Registration form on register.html
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      attachHandler(registerForm, 'registration');
    }
  }
})();
