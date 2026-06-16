import os
import re
import sys
from urllib.parse import urljoin, urlparse
from playwright.sync_api import sync_playwright, expect

BASE = "http://localhost:3001"
PAGES = [
    "index.html",
    "starter.html",
    "professional.html",
    "specialist.html",
    "free-class.html",
    "mastermind.html",
    "register.html",
    "404.html",
    "legal/privacy.html",
    "legal/terms.html",
    "legal/cookie.html",
    "legal/refund.html",
]

os.makedirs('screenshots/qa', exist_ok=True)
ERRORS = []
BROKEN_LINKS = []
CONSOLE_ERRORS = []

def log(msg):
    print(msg)

def check(cond, msg):
    if not cond:
        ERRORS.append(msg)
        log(f"  FAIL: {msg}")
    else:
        log(f"  OK: {msg}")

def get_links(page):
    """Return all unique internal hrefs on current page."""
    hrefs = page.eval_on_selector_all('a[href]', 'els => els.map(e => e.href)')
    seen = set()
    out = []
    for h in hrefs:
        if h in seen:
            continue
        seen.add(h)
        out.append(h)
    return out

def is_internal(href):
    return href.startswith(BASE) or href.startswith('/') or (not href.startswith('http') and not href.startswith('mailto:') and not href.startswith('tel:') and not href.startswith('#'))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900})

    for path in PAGES:
        url = f"{BASE}/{path}"
        log(f"\n=== {path} ===")
        page = context.new_page()
        page.on("console", lambda msg: CONSOLE_ERRORS.append((path, msg.type, msg.text)) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: CONSOLE_ERRORS.append((path, "pageerror", str(exc))))

        # Redirect pages (e.g. mastermind.html -> free-class.html)
        is_redirect_page = path == "mastermind.html"

        try:
            page.goto(url, wait_until="networkidle", timeout=15000)
        except Exception as e:
            ERRORS.append(f"{path}: failed to load - {e}")
            log(f"  FAIL: failed to load {e}")
            page.close()
            continue

        if is_redirect_page:
            check("free-class" in page.url, f"{path}: redirects to free-class ({page.url})")
            page.close()
            continue

        check("Rewire" in page.title() or "404" in page.title() or path.startswith("legal/"), f"{path}: reasonable title ({page.title()})")
        
        # Screenshot full page
        safe_name = path.replace('/', '_').replace('.html', '')
        page.screenshot(path=f"screenshots/qa/{safe_name}_full.png", full_page=True)
        
        # Test reload smoothness
        log("  Reloading...")
        page.reload(wait_until="networkidle", timeout=15000)
        check(page.url == url, f"{path}: reload keeps same URL")
        
        # Get all links
        links = get_links(page)
        internal_links = []
        for h in links:
            if h.startswith(BASE):
                internal_links.append(h)
            elif h.startswith('/') or (not h.startswith('http') and not h.startswith('mailto:') and not h.startswith('tel:') and not h.startswith('#')):
                internal_links.append(urljoin(BASE, h))
        
        # Test each internal link once
        for link in internal_links[:30]:  # limit to avoid too many
            if link == url or link.endswith('#'):
                continue
            try:
                resp = page.goto(link, wait_until="domcontentloaded", timeout=10000)
                if resp and resp.status >= 400:
                    BROKEN_LINKS.append((path, link, resp.status))
                    log(f"  BROKEN LINK: {link} ({resp.status})")
                page.go_back(wait_until="networkidle", timeout=10000)
                check(page.url == url, f"{path}: back from {link} returns correctly")
            except Exception as e:
                BROKEN_LINKS.append((path, link, str(e)))
                log(f"  LINK ERROR: {link} - {e}")
        
        page.close()

    # Check all clickable buttons on index.html
    log("\n=== CLICKABLE ELEMENTS AUDIT (index.html) ===")
    page = context.new_page()
    page.goto(f"{BASE}/index.html", wait_until="networkidle")
    buttons = page.locator('button, a[href], [role="button"]').all()
    log(f"  Found {len(buttons)} clickable elements")
    for i, btn in enumerate(buttons[:40]):
        try:
            text = (btn.inner_text() or btn.get_attribute('aria-label') or btn.get_attribute('href') or '')[:40].strip().replace('\n',' ')
            visible = btn.is_visible()
            enabled = btn.is_enabled() if btn.count() else False
            if visible and text:
                log(f"  [{i}] {text} — visible={visible}")
        except Exception:
            pass
    page.close()

    browser.close()

log("\n" + "="*60)
log("CONSOLE/PAGE ERRORS:")
if CONSOLE_ERRORS:
    for path, typ, txt in set(CONSOLE_ERRORS):
        log(f"  [{path}] {typ}: {txt}")
else:
    log("  None")

log("\nBROKEN LINKS:")
if BROKEN_LINKS:
    for src, link, status in BROKEN_LINKS:
        log(f"  {src} -> {link} ({status})")
else:
    log("  None")

log("\nGENERAL ERRORS:")
if ERRORS:
    for e in ERRORS:
        log(f"  - {e}")
else:
    log("  None")

with open('screenshots/qa/qa_report.txt', 'w') as f:
    f.write("CONSOLE/PAGE ERRORS:\n")
    for path, typ, txt in set(CONSOLE_ERRORS):
        f.write(f"  [{path}] {typ}: {txt}\n")
    f.write("\nBROKEN LINKS:\n")
    for src, link, status in BROKEN_LINKS:
        f.write(f"  {src} -> {link} ({status})\n")
    f.write("\nGENERAL ERRORS:\n")
    for e in ERRORS:
        f.write(f"  - {e}\n")

if ERRORS or BROKEN_LINKS:
    sys.exit(1)
else:
    log("\nDeep QA passed — no broken links or load errors.")
    sys.exit(0)
