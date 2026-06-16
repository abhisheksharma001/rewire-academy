import re
from pathlib import Path

FILES = ['starter.html', 'professional.html', 'specialist.html']

# Standard footer contact block (matches current index.html style)
STANDARD_CONTACT = """<div style="color:var(--text-secondary); font-size:0.9rem; line-height:1.6; margin-bottom:16px;">
            📧 <a href="mailto:hello@rewire.academy" style="color:inherit;">hello@rewire.academy</a><br>
            📞 <a href="tel:+919999204834" style="color:inherit;">+91 99992 04834</a>
          </div>
          <div style="color:var(--text-secondary); font-size:0.8rem; line-height:1.6; margin-bottom:16px;">
            A unit of Rewire Education Pvt. Ltd.<br>
            Ground 0, Durga City Center, Haldwani, Nainital, Uttarakhand, 263139
          </div>"""

# Standard footer programs column
STANDARD_PROGRAMS = """<ul class="footer-links">
            <li><a href="free-class.html">Free Mastermind</a></li>
            <li><a href="starter.html">Starter</a></li>
            <li><a href="professional.html">Professional</a></li>
            <li><a href="specialist.html">Specialist</a></li>
          </ul>"""

# Standard footer company column
STANDARD_COMPANY = """<ul class="footer-links">
            <li><a href="index.html#business">For Business</a></li>
            <li><a href="index.html#who">About Us</a></li>
            <li><a href="index.html#faq">FAQ</a></li>
            <li><a href="index.html#contact">Contact</a></li>
          </ul>"""


def replace_last_inline_script(html):
    """Replace the last <script>...</script> block before </body> with common.js reference."""
    body_end = html.rfind('</body>')
    if body_end == -1:
        return html
    before_body = html[:body_end]
    # Find last <script> ... </script> in before_body
    last_script_end = before_body.rfind('</script>')
    if last_script_end == -1:
        return html
    last_script_start = before_body.rfind('<script>', 0, last_script_end)
    if last_script_start == -1:
        return html
    # Replace that block
    new_before = before_body[:last_script_start] + '  <script src="js/common.js?v=1"></script>\n' + before_body[last_script_end + len('</script>'):]
    return new_before + html[body_end:]


for fname in FILES:
    path = Path(fname)
    html = path.read_text()

    # 1. Replace bottom inline script with common.js FIRST
    html = replace_last_inline_script(html)

    # 2. Add js-loaded script right after <head>
    if '<script>document.documentElement.classList.add(\'js-loaded\');</script>' not in html:
        html = html.replace('<head>\n  <meta charset="UTF-8">',
                            '<head>\n  <script>document.documentElement.classList.add(\'js-loaded\');</script>\n  <meta charset="UTF-8">')

    # 3. Change font display to optional
    html = html.replace('display=swap', 'display=optional')

    # 4. Bump CSS version
    html = html.replace('css/style.css?v=12', 'css/style.css?v=13')

    # 5. Standardize footer contact info block
    html = re.sub(
        r'<p class="footer-tagline" style="margin-bottom:16px;">.*?</p>\s*<div style="color:var\(--text-secondary\); font-size:0\.9rem; line-height:1\.6; margin-bottom:16px;">\s*📧.*?</div>\s*<div style="color:var\(--text-secondary\); font-size:0\.8rem; line-height:1\.6; margin-bottom:16px;">\s*A unit of Rewire Education Pvt\. Ltd\..*?</div>',
        '<p class="footer-tagline" style="margin-bottom:16px;">An elite, project-based studio for mastering applied AI. Live, deliberate, and deliberately small.</p>\n          ' + STANDARD_CONTACT,
        html,
        flags=re.DOTALL
    )

    # 6. Standardize footer programs column
    html = re.sub(
        r'<div class="footer-title">Programs</div>\s*<ul class="footer-links">\s*<li><a href="[^"]*">Free Mastermind</a></li>\s*<li><a href="[^"]*">Starter</a></li>\s*<li><a href="[^"]*">Professional</a></li>\s*<li><a href="[^"]*">Specialist</a></li>\s*</ul>',
        '<div class="footer-title">Programs</div>\n          ' + STANDARD_PROGRAMS,
        html
    )
    html = re.sub(
        r'<div class="footer-title">Programs</div>\s*<ul class="footer-links">\s*<li><a href="[^"]*">Starter</a></li>\s*<li><a href="[^"]*">Professional</a></li>\s*<li><a href="[^"]*">Specialist</a></li>\s*<li><a href="[^"]*">Mastermind</a></li>\s*</ul>',
        '<div class="footer-title">Programs</div>\n          ' + STANDARD_PROGRAMS,
        html
    )

    # 7. Standardize footer company column
    html = re.sub(
        r'<div class="footer-title">Company</div>\s*<ul class="footer-links">\s*<li><a href="index\.html#business">For Business</a></li>\s*<li><a href="index\.html#who">About Us</a></li>\s*<li><a href="[^"]*">FAQ</a></li>\s*<li><a href="index\.html#contact">Contact</a></li>\s*</ul>',
        '<div class="footer-title">Company</div>\n          ' + STANDARD_COMPANY,
        html
    )
    html = re.sub(
        r'<div class="footer-title">Company</div>\s*<ul class="footer-links">\s*<li><a href="index\.html#business">For Business</a></li>\s*<li><a href="index\.html#who">About Us</a></li>\s*<li><a href="free-class\.html">Free Class</a></li>\s*</ul>',
        '<div class="footer-title">Company</div>\n          ' + STANDARD_COMPANY,
        html
    )

    path.write_text(html)
    print(f"Updated {fname}")
