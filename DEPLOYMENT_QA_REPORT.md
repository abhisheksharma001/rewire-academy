# Rewire Academy — Pre-Deployment QA Report

**Date:** 16 June 2026  
**Scope:** Static HTML/CSS/JS site (`/Users/abhisheksharma/Desktop/Rewire`)  
**Method:** Local server + Playwright automated crawl, visual screenshots (desktop 1280×900, mobile 390×844), link check, console-error check, reload tests, manual visual review.

---

## ✅ Fixes Applied

All Phase A, B, and C items below have been implemented and re-verified:

1. ✅ Mobile nav fixed on `free-class.html` and `mastermind.html` (ghost link now hidden on mobile).
2. ✅ `specialist.html` footer standardized to match all other pages.
3. ✅ `register.html` hero is now dynamic based on `?course=` (with aliases for short names like `3-Month Professional`).
4. ✅ `mastermind.html` replaced with a 301-style redirect to `free-class.html`.
5. ✅ Team photos brightened (`brightness(1.15)` default, `1.25` on hover).
6. ✅ `index.html` footer program links now point to actual course pages.
7. ✅ Reload smoothness improved: Google Fonts switched to `display=optional`; reveal animations now have a no-JS fallback.
8. ✅ Course pages (`starter.html`, `professional.html`, `specialist.html`) now share `js/common.js` instead of duplicated inline scripts.
9. ✅ `register.html` mobile layout tightened (reduced left-panel height/padding on small screens).
10. ✅ Asset cache-busting versions bumped (`style.css?v=13`, `app.js?v=12`, `form-handler.js?v=3`).
11. ✅ Detailed course pages (`starter.html`, `professional.html`, `specialist.html`) restored with full curriculum, tools, pricing, and FAQ.
12. ✅ 14-day Starter page connected from homepage program modal via "View full 14-day curriculum →" link.
13. ✅ Team member name corrected: `Palash Joshi` (image renamed to `palash-joshi.webp`).

**Final verification:** Deep QA passed with no broken links, no console/page errors, and all dynamic behaviors confirmed.

---

## ✅ What Passed

| Check | Result |
|-------|--------|
| All 12 HTML pages load without errors | ✅ Pass |
| No broken internal links (200+ link/back-button tests) | ✅ Pass |
| No console errors or page-level JS exceptions | ✅ Pass |
| Register form course prefill works from all program CTAs | ✅ Pass |
| FAQ accordions, mobile menu, modals open/close | ✅ Pass |
| Contact info consistent (phone + address) across footers | ✅ Pass |
| Legal pages (privacy, terms, refund, cookie) present and linked | ✅ Pass |
| 404 page has noindex and home link | ✅ Pass |

---

## ❌ Issues Found (Categorized)

### 1. Mobile Navigation Bug — HIGH
**Files:** `free-class.html`, `mastermind.html`  
**Problem:** The secondary nav link "Try before you commit" uses class `nav-ghost-link`, which is **not hidden on mobile** (only `nav-cta-secondary` is hidden in CSS). On mobile this text wraps/cramps next to the logo and breaks the header layout.  
**Evidence:** Mobile screenshot of `free-class.html` shows "REWIRE Try before you commit" crammed on one line.  
**Fix:** Change `nav-ghost-link` to `btn btn-secondary btn-pill nav-cta-secondary` on both pages (matching `index.html`), or add `.nav-ghost-link { display: none; }` inside the mobile media query.

### 2. Footer Inconsistency — MEDIUM
**File:** `specialist.html`  
**Problem:** Footer deviates from every other page:
- Programs column lists `Starter, Professional, Specialist, Mastermind` (links to `mastermind.html` instead of `free-class.html`; no "Free Mastermind" label).
- Company column lists `For Business, About Us, Free Class, Contact` instead of `FAQ`.
**Fix:** Copy the footer from `index.html` / `professional.html` into `specialist.html`.

### 3. Register Page Hero Is Hard-Coded for Mastermind — HIGH
**File:** `register.html`  
**Problem:** Left panel always says "Join the 3-Hour LIVE AI Training" even when user arrives from Professional or Specialist pages. This is confusing and looks unprofessional.  
**Fix:** Read the `?course=` URL parameter and update the heading + description dynamically (fallback to generic copy).

### 4. Index Footer Uses Anchor Links While Other Pages Use Page Links — MEDIUM
**File:** `index.html`  
**Problem:** In Programs column, `Starter`, `Professional`, `Specialist` point to `#programs` (scrolls to section), while all other pages link to `starter.html`, `professional.html`, `specialist.html`. Users on the home page clicking these expect the detail page, not just the section scroll.  
**Fix:** Standardize to page links (`starter.html`, etc.) or make the home-page footer match the detail-page footer exactly.

### 5. Team Photos Are Too Dark / Low Visibility — MEDIUM
**File:** `css/style.css`, `index.html`  
**Problem:** `.team-photo-img` has `filter: grayscale(100%) contrast(1.05)`. On dark cards the faces are hard to see, especially in grayscale.  
**Fix:** Increase brightness slightly: `filter: grayscale(100%) contrast(1.05) brightness(1.15);` and on hover `brightness(1.25)`.

### 6. Duplicate/Competing Pages — MEDIUM
**Files:** `free-class.html`, `mastermind.html`  
**Problem:** Both pages serve the same "Free 3-Hour Gen-AI Mastermind" purpose. `mastermind.html` appears to be the older design; `free-class.html` is the newer polished page. Having both live can split traffic and hurt SEO canonical signals.  
**Fix:** 301 redirect `mastermind.html` → `free-class.html` (via server config) OR keep `mastermind.html` as a simple redirect page.

### 7. Smoothness / Perceived Performance — MEDIUM
**Files:** `index.html`, `css/style.css`  
**Problem:** Several factors make reloads feel less smooth:
- **Google Fonts `display=swap`** causes a visible text reflow (FOUT) on every reload.
- **`.reveal` class starts at `opacity: 0`** before JS adds `.visible`. If JS runs late, content flashes invisible → visible.
- **No page-transition layer**: clicking internal links does a full hard reload with a white flash.
- **Large monolithic CSS** (~2,925 lines) is render-blocking.
**Fix options:**
- Add `font-display: optional` and a short preload for critical fonts.
- Add a no-JS fallback: `.no-js .reveal { opacity: 1; transform: none; }`.
- Add a tiny fade-in page wrapper on `DOMContentLoaded`.
- Consider splitting non-critical CSS, or at least moving above-the-fold CSS inline.

### 8. Course Pages Use Inline/Fragmented JS Instead of Shared `app.js` — LOW
**Files:** `starter.html`, `professional.html`, `specialist.html`  
**Problem:** Each course page duplicates reveal-animation, FAQ, and mobile-menu logic inline instead of loading `js/app.js`. This is harder to maintain and risks divergent behavior.  
**Fix:** Refactor to include `js/app.js` (or a smaller `js/common.js`) on all pages and remove duplicated inline scripts.

### 9. Register Page Split Layout on Mobile — LOW
**File:** `register.html`  
**Problem:** `.split-layout { height: 100vh; }` stacks on mobile but the left hero panel takes significant space before the form. Users may need to scroll more than expected.  
**Fix:** On mobile, reduce left-panel padding and font size, or place the form first.

### 10. Sticky Bottom CTA + Fixed Nav Reduce Mobile Viewport — LOW
**File:** `index.html`  
**Problem:** Fixed nav (top) + sticky CTA bar (bottom) on mobile can make the usable viewport narrow and hide content.  
**Fix:** Add `scroll-padding-top` / `scroll-padding-bottom` and verify all anchors scroll to visible content.

### 11. Minor Font/Visual Inconsistencies — LOW
- Section headlines use `<em>` inconsistently: some italicize the first word, some a descriptor word.
- Mega-menu card descriptions differ slightly from program cards.
- Hero eyebrow text "Live AI Programs" vs page titles use slightly different wording.
**Fix:** Standardize headline patterns in a style guide or componentize.

---

## 📋 Recommended Deployment Fix Plan

### Phase A — Must-Fix Before Launch (HIGH)
1. Fix mobile nav on `free-class.html` and `mastermind.html` (hide ghost link / use `nav-cta-secondary`).
2. Standardize `specialist.html` footer to match other pages.
3. Make `register.html` hero copy dynamic based on `?course=`.
4. Decide and implement redirect/consolidation for `mastermind.html` → `free-class.html`.

### Phase B — Polish Before Launch (MEDIUM)
5. Brighten team photo filters.
6. Standardize index footer program links to page URLs.
7. Improve reload smoothness (font-display strategy + no-JS reveal fallback + page fade-in).
8. Add scroll-padding for sticky nav/CTA.

### Phase C — Post-Launch Tech Debt (LOW)
9. Refactor course pages to share `app.js`/`common.js`.
10. Split/lazy-load non-critical CSS.
11. Optimize register page mobile layout.

---

## 📊 Performance Snapshot

| Metric | Value |
|--------|-------|
| Homepage networkidle load (warm cache) | ~3.2–3.9 s |
| DOMContentLoaded | ~1.0 s |
| Resources per page | ~11 |
| Largest page height | `index.html` ~9,077 px |

The load time is acceptable for a content site but can be improved by the Phase B/C items above.

---

## 🖼️ Screenshots Captured

All screenshots saved in `screenshots/qa/`:
- Full-page desktop: `index_full.png`, `starter_full.png`, `professional_full.png`, `specialist_full.png`, `free-class_full.png`, `register_full.png`, `404_full.png`, legal pages.
- Mobile top-of-page: `screenshots/qa/mobile/*.html_top.png`.
- Program cards + modal: `programs_cards.png`, `programs_modal.png`.
