import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3001"
ERRORS = []

def log(msg):
    print(msg)

def check(cond, msg):
    if not cond:
        ERRORS.append(msg)
        log(f"  FAIL: {msg}")
    else:
        log(f"  OK: {msg}")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()

    # Homepage checks
    log("\n--- index.html ---")
    page.goto(f"{BASE}/index.html")
    page.wait_for_load_state("networkidle")
    check("Rewire Academy" in page.title(), "title contains Rewire Academy")
    check(page.locator('meta[name="robots"]').count() == 0, "no robots meta on homepage")

    # Mega menu click (hover disabled)
    trigger = page.locator("#programsTrigger")
    trigger.click()
    page.wait_for_timeout(300)
    menu = page.locator("#megaMenu")
    check(menu.is_visible(), "mega menu visible on click")
    first_link = menu.locator(".mega-menu-column").first
    check("Starter" in first_link.inner_text(), "mega menu first card is Starter")

    # Course bento modal
    card = page.locator(".program-know-more").first
    card.click()
    page.wait_for_timeout(300)
    modal = page.locator("#courseModal")
    check(modal.is_visible(), "course modal opens")
    page.keyboard.press("Escape")
    page.wait_for_timeout(800)
    check(not modal.is_visible(), "course modal closes on Escape")

    # Quiz modal
    quiz_btn = page.locator("#quizOpenBtn")
    if quiz_btn.count():
        quiz_btn.click()
        page.wait_for_timeout(300)
        quiz = page.locator("#quizModal")
        check(quiz.is_visible(), "quiz modal opens")
        page.keyboard.press("Escape")
        page.wait_for_timeout(200)
        check(not quiz.is_visible(), "quiz modal closes on Escape")

    page.screenshot(path="screenshots/qa_home.png", full_page=True)
    log("screenshot saved: screenshots/qa_home.png")

    # Register form prefill
    log("\n--- register.html ---")
    page.goto(f"{BASE}/register.html?course=3-Hour%20Gen-AI%20Mastermind")
    page.wait_for_load_state("networkidle")
    select = page.locator("select[name='course']")
    check(select.input_value() == "3-Hour Gen-AI Mastermind", "course select prefilled from URL")

    # Mastermind copy
    log("\n--- mastermind.html ---")
    page.goto(f"{BASE}/mastermind.html")
    check("3-Hour" in page.title(), "mastermind title ok")
    check("3-Hour AI Mastermind" in page.content(), "mastermind heading is present")
    check("Every Saturday, 10 AM IST" in page.content(), "mastermind time is 10 AM IST")

    # Pricing alignment
    log("\n--- pricing checks ---")
    page.goto(f"{BASE}/professional.html")
    check("₹75,000" in page.content(), "professional price is ₹75,000")
    check("placeholder" not in page.content().lower(), "professional no placeholder pricing")
    page.goto(f"{BASE}/specialist.html")
    check("₹3,00,000" in page.content(), "specialist price is ₹3,00,000")
    check("placeholder" not in page.content().lower(), "specialist no placeholder pricing")
    page.goto(f"{BASE}/starter.html")
    check("₹25,000" in page.content(), "starter price is ₹25,000")

    # 404 noindex
    log("\n--- 404.html ---")
    page.goto(f"{BASE}/404.html")
    robots = page.locator('meta[name="robots"]')
    check(robots.count() == 1 and "noindex" in robots.first.get_attribute("content"), "404 has noindex robots")
    check(page.locator('link[rel="canonical"]').count() == 0, "404 has no canonical")

    browser.close()

if ERRORS:
    log(f"\n{len(ERRORS)} check(s) failed:")
    for e in ERRORS:
        log(f"  - {e}")
    sys.exit(1)
else:
    log("\nAll QA checks passed.")
    sys.exit(0)
