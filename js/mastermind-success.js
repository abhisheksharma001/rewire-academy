/**
 * REWIRE ACADEMY — Mastermind Success Page Handler
 *
 * Reads form data from sessionStorage (set by mastermind-form.js),
 * starts a 60-second timer, and tracks WhatsApp link clicks.
 *
 * Logic:
 * - If user clicks WhatsApp link within 60s → send to n8n with whatsapp_joined: true
 * - If 60s pass without click → send to n8n with whatsapp_joined: false
 * - Data is only sent ONCE (click OR timer, whichever fires first)
 */
(function () {
  'use strict';

  // Same obfuscated webhook as form-handler.js
  const WEBHOOK_PARTS = [
    atob('aHR0cHM6Ly9hYmhpc2hla3NoYXI2NDkuYXBwLm44bi5jbG91ZC93ZWJob29rLw=='),
    atob('OGI4NTA3ZDYtMTdmNy00ZDFjLTkwMGMtMGEyYzBkMDdkNTYz'),
  ];
  const WEBHOOK_URL = WEBHOOK_PARTS.join('');

  const TIMER_DURATION = 60; // seconds
  let timerInterval = null;
  let dataSent = false;
  let formPayload = null;

  // ─── Read Form Data ────────────────────────────────────────
  function loadFormData() {
    try {
      const raw = sessionStorage.getItem('rewire_mastermind_data');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Could not read form data:', e);
      return null;
    }
  }

  // ─── Send to n8n ───────────────────────────────────────────
  async function sendToWebhook(payload) {
    if (dataSent) return; // Guard: only send once
    dataSent = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: 'mastermind_registration',
          form_type: 'mastermind',
          ...payload,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('Webhook error:', response.status, response.statusText);
      } else {
        console.log('Data sent to n8n successfully. WhatsApp joined:', payload.whatsapp_joined);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Webhook send failed:', error);
      dataSent = false; // Allow retry on network failure
    }

    // Clean up sessionStorage after sending
    try {
      sessionStorage.removeItem('rewire_mastermind_data');
    } catch (e) {
      // ignore
    }
  }

  // ─── WhatsApp Click Handler ────────────────────────────────
  function handleWhatsAppClick() {
    if (dataSent) return;

    // Stop the timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Send with whatsapp_joined = true
    formPayload.whatsapp_joined = true;
    sendToWebhook(formPayload);

    // Update UI to show confirmation
    const statusEl = document.getElementById('waStatus');
    if (statusEl) {
      statusEl.textContent = '✅ WhatsApp link opened! Your data has been submitted.';
      statusEl.style.color = '#16a34a';
    }
  }

  // ─── Timer Expiry Handler ──────────────────────────────────
  function handleTimerExpiry() {
    if (dataSent) return;

    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Send with whatsapp_joined = false
    formPayload.whatsapp_joined = false;
    sendToWebhook(formPayload);

    // Update UI
    const statusEl = document.getElementById('waStatus');
    if (statusEl) {
      statusEl.textContent = 'Your registration has been recorded.';
      statusEl.style.color = '#6b7280';
    }
  }

  // ─── Countdown Timer ──────────────────────────────────────
  function startTimer() {
    let remaining = TIMER_DURATION;

    timerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        handleTimerExpiry();
      }
    }, 1000);
  }

  // ─── Fetch Dynamic WhatsApp Link ───────────────────────────
  // Replace this with your new n8n webhook URL that returns the link
  const WA_LINK_FETCH_WEBHOOK = 'https://n8n-cbac.srv1785299.hstgr.cloud/webhook/30ad4fff-32b7-4ecf-a3e8-33791b158894'; 
  
  async function fetchWhatsAppLink() {
    try {
      const response = await fetch(WA_LINK_FETCH_WEBHOOK);
      if (response.ok) {
        const data = await response.json();
        // Assuming your n8n webhook returns JSON like: { "whatsapp_link": "https://chat.whatsapp.com/..." }
        if (data && data.whatsapp_link) {
          const waLink = document.getElementById('whatsappLink');
          if (waLink) {
            waLink.href = data.whatsapp_link;
          }
        }
      }
    } catch (e) {
      console.warn('Could not fetch dynamic WhatsApp link:', e);
    }
  }

  // ─── Initialize ────────────────────────────────────────────
  function init() {
    formPayload = loadFormData();

    // Fetch the dynamic link from n8n as soon as the page loads
    fetchWhatsAppLink();

    if (!formPayload) {
      // No form data — user navigated here directly
      console.warn('No form data found. User may have navigated directly.');
      // Still show the page, but skip tracking
      return;
    }

    // Wire up WhatsApp link click
    const waLink = document.getElementById('whatsappLink');
    if (waLink) {
      waLink.addEventListener('click', function (e) {
        // Don't prevent default — let the link open in new tab
        handleWhatsAppClick();
      });
    }

    // Start the 60-second timer
    startTimer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
