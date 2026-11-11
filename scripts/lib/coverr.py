"""Coverr stock library helper (free licence: https://coverr.co/license).
Only non-AI, non-premium stock clips are accepted."""
import re, html, time, urllib.parse, urllib.request
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120).read()

def search(q):
    t = get("https://coverr.co/s?q=" + urllib.parse.quote(q)).decode("utf-8", "ignore")
    out = []
    for c in t.split("<coverr-video ")[1:]:
        title = re.search(r'title="([^"]+)"', c); slug = re.search(r"cdn\.coverr\.co/videos/([^/\"]+)/", c)
        href = re.search(r'href="(/videos/[^"]+)"', c)
        if not (title and slug and href):
            continue
        flagged = bool(re.search(r"AI generated|premium", c, re.I))
        out.append(dict(title=html.unescape(title.group(1)), slug=slug.group(1), page="https://coverr.co" + href.group(1), flagged=flagged))
    return out

def detail(page):
    t = get(page).decode("utf-8", "ignore")
    ai = bool(re.search(r'AI generated|"is_ai_generated":\s*true|is-ai-generated', t, re.I))
    prem = bool(re.search(r'"is_premium":\s*true|premium-badge', t, re.I))
    m = re.search(r'"author"\s*:\s*\{[^}]*"name"\s*:\s*"([^"]+)"', t) or re.search(r'by\s*<a[^>]*href="/(?:@|users/)[^"]*"[^>]*>([^<]+)</a>', t)
    return dict(ai=ai, premium=prem, author=html.unescape(m.group(1)).strip() if m else "Coverr")

def flags(page, slug):
    """Authoritative per-clip flags from the page state: (is_ai, is_premium)."""
    t = get(page).decode("utf-8", "ignore")
    m = re.search(r'"isPremium":(true|false),"fps":\d+,"isAiGenerated":(true|false),"slug":"' + re.escape(slug), t)
    if not m:
        return None
    return m.group(2) == "true", m.group(1) == "true"
