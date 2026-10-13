#!/usr/bin/env python3
"""Paginate the Clear Recipe homepage into 12 pages of 50 recipes each."""
import re, sys, os

BASE = os.path.expanduser("~/workspace/clearrecipe-deploy")
SRC = os.path.join(BASE, "index.html")
PAGE_SIZE = 50
SITE = "https://clearrecipe.net"
TODAY = "2026-10-12"

with open(SRC, encoding="utf-8") as f:
    content = f.read()

# --- Extract recipe list ---
m = re.search(r'<ul class="recipelist">.*?</ul>', content, re.DOTALL)
assert m, "recipelist <ul> not found"
ul_html = m.group(0)
pre_ul = content[:m.start()]
post_ul = content[m.end():]

items = re.findall(r'<li>.*?</li>', ul_html, re.DOTALL)
assert len(items) == 575, f"expected 575 items, got {len(items)}"

# Verify numbering 01..575 with no gaps
nums = []
for it in items:
    nm = re.search(r'<span class="num">(\d+)</span>', it)
    assert nm, "item missing number span"
    nums.append(int(nm.group(1)))
assert nums == list(range(1, 576)), "numbering is not a clean 1..575 sequence"
print(f"OK: extracted 575 items, numbered 01..575 cleanly")

# --- Shared pagination CSS (site design language) ---
PAG_CSS = (
    ".pagination{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:48px 0 0;"
    "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}"
    ".pagination .pg{display:inline-flex;align-items:center;justify-content:center;min-width:42px;height:42px;"
    "padding:0 13px;border:1px solid #e0e0e0;border-radius:21px;color:#6b6b6b;font-size:15px;font-weight:600}"
    ".pagination .pg:hover{border-color:#1a8917;color:#1a8917;text-decoration:none}"
    ".pagination .pg.on{background:#1a8917;border-color:#1a8917;color:#fff}"
)

def pagination_nav(current):
    links = []
    for n in range(1, 13):
        href = "/" if n == 1 else f"/page{n}.html"
        cls = "pg on" if n == current else "pg"
        extra = ' aria-current="page"' if n == current else ""
        links.append(f'<a class="{cls}" href="{href}"{extra}>{n}</a>')
    return '<nav class="pagination" aria-label="Browse all recipes">' + "".join(links) + "</nav>"

def build_head(page_num, start, end):
    head = pre_ul
    # inject pagination CSS before </style>
    assert "</style>" in head
    head = head.replace("</style>", PAG_CSS + "</style>", 1)
    if page_num == 1:
        canonical = f"{SITE}/"
        head = head.replace(
            f'<link rel="canonical" href="{SITE}/">',
            f'<link rel="canonical" href="{canonical}">\n<link rel="next" href="{SITE}/page2.html">',
            1)
        return head
    # paginated pages: self-canonical, range-specific title/description
    canonical = f"{SITE}/page{page_num}.html"
    title = f"Clear Recipe {start} to {end} | Clear Recipe"
    desc = (f"No ads. Just great recipes. Browse clean recipes {start} to {end}. "
            "Loads in milliseconds. Every recipe has a video.")
    head = head.replace(
        "<title>Clear Recipe - No ads. Just great recipes.</title>",
        f"<title>{title}</title>", 1)
    head = head.replace(
        '<meta name="description" content="No ads. Just great recipes. Easy peasy. Loads in milliseconds. Every recipe has a video.">',
        f'<meta name="description" content="{desc}">', 1)
    head = head.replace(
        f'<link rel="canonical" href="{SITE}/">',
        f'<link rel="canonical" href="{canonical}">', 1)
    # drop hreflang alternates (they point at /id/ and /es/ full homepages, not page slices)
    head = re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n', "", head)
    head = head.replace(
        '<meta property="og:title" content="Clear Recipe - No ads. Just great recipes.">',
        f'<meta property="og:title" content="{title}">', 1)
    head = head.replace(
        '<meta property="og:description" content="No ads. Just great recipes. Easy peasy.">',
        f'<meta property="og:description" content="{desc}">', 1)
    head = head.replace(
        f'<meta property="og:url" content="{SITE}/">',
        f'<meta property="og:url" content="{canonical}">', 1)
    # rel prev/next
    nav_links = f'<link rel="prev" href="{SITE}/">' if page_num == 2 else \
                f'<link rel="prev" href="{SITE}/page{page_num-1}.html">'
    if page_num < 12:
        nav_links += f'\n<link rel="next" href="{SITE}/page{page_num+1}.html">'
    head = head.replace(
        f'<link rel="canonical" href="{canonical}">',
        f'<link rel="canonical" href="{canonical}">\n{nav_links}', 1)
    return head

H1_ORIG = '<h1 class="title">The clearest recipe site on the internet.</h1>'

total_pages = (len(items) + PAGE_SIZE - 1) // PAGE_SIZE
assert total_pages == 12, f"expected 12 pages, got {total_pages}"

seen = set()
for p in range(1, 13):
    start_i = (p - 1) * PAGE_SIZE          # 0-based
    end_i = min(p * PAGE_SIZE, len(items)) # exclusive
    slice_items = items[start_i:end_i]
    start_n, end_n = start_i + 1, end_i
    for it in slice_items:
        nm = int(re.search(r'<span class="num">(\d+)</span>', it).group(1))
        assert nm not in seen, f"duplicate recipe {nm}"
        seen.add(nm)

    head = build_head(p, start_n, end_n)
    if p == 1:
        body_top = head  # homepage H1 unchanged
    else:
        body_top = head.replace(H1_ORIG,
            f'<h1 class="title">Clear Recipe {start_n} to {end_n}</h1>', 1)
    new_ul = '<ul class="recipelist">' + "".join(slice_items) + "</ul>"
    page_html = body_top + new_ul + pagination_nav(p) + post_ul

    # sanity checks
    assert page_html.count("<h1") == 1, f"page {p}: H1 count != 1"
    assert "—" not in page_html and "–" not in page_html, f"page {p}: dash found"
    assert page_html.count('class="rlink"') == len(slice_items), f"page {p}: item count mismatch"
    assert len(re.findall(r'<span class="num">(\d+)</span>', page_html)) == len(slice_items)

    fname = "index.html" if p == 1 else f"page{p}.html"
    with open(os.path.join(BASE, fname), "w", encoding="utf-8") as f:
        f.write(page_html)
    print(f"wrote {fname}: recipes {start_n}-{end_n} ({len(slice_items)} items), "
          f"{os.path.getsize(os.path.join(BASE, fname))} bytes")

assert seen == set(range(1, 576)), "not all recipes covered exactly once"
print(f"OK: all 575 recipes appear on exactly one page")

# --- Update sitemap.xml ---
sm_path = os.path.join(BASE, "sitemap.xml")
with open(sm_path, encoding="utf-8") as f:
    sm = f.read()
home_block = (f"  <url>\n    <loc>{SITE}/</loc>\n    <lastmod>{TODAY}</lastmod>\n"
              "    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n")
assert home_block in sm, "homepage block not found in sitemap"
additions = ""
for p in range(2, 13):
    assert f"<loc>{SITE}/page{p}.html</loc>" not in sm, f"page{p} already in sitemap"
    additions += (f"  <url>\n    <loc>{SITE}/page{p}.html</loc>\n    <lastmod>{TODAY}</lastmod>\n"
                  "    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n")
sm = sm.replace(home_block, home_block + additions, 1)
with open(sm_path, "w", encoding="utf-8") as f:
    f.write(sm)
print(f"OK: sitemap.xml updated with page2.html through page12.html ({sm.count('<url>')} urls total)")
