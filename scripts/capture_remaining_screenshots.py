#!/usr/bin/env python3
"""Capture *real* homepage screenshots for project cards still using labelled SVG fallbacks.

Run on a computer with internet access:
  pip install playwright pillow beautifulsoup4
  python -m playwright install chromium
  python scripts/capture_remaining_screenshots.py

Only sites which respond successfully are changed. This keeps unrelated pages intact.
"""
from pathlib import Path
from urllib.parse import urlparse
from bs4 import BeautifulSoup
from PIL import Image
import io, re, json, subprocess

ROOT = Path(__file__).resolve().parent.parent
CATS = ['wordpress','shopify','webflow','wix','other-cms','selected-sites']
DEST = ROOT/'assets/images/project-screenshots'; DEST.mkdir(parents=True, exist_ok=True)
try:
    from playwright.sync_api import sync_playwright
except ImportError as exc:
    raise SystemExit('Install Playwright first: pip install playwright pillow beautifulsoup4') from exc

success = []
with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for area in CATS:
        page_path = ROOT/area/'index.html'
        soup = BeautifulSoup(page_path.read_text('utf8'), 'html.parser')
        changed = {}
        for card in soup.select('.card'):
            img = card.select_one('img.page[data-live-shot]')
            link = card.select_one('a.live[href]')
            if not img or not link: continue
            url = link.get('href','').strip()
            old = img.get('src','')
            if not (url.startswith('https://') and old.endswith('.svg')): continue
            key = Path(old).stem
            if key == 'portfolio-media': continue
            file = DEST/(key+'.webp')
            try:
                tab = browser.new_page(viewport={'width':1600,'height':1000}, device_scale_factor=1)
                tab.goto(url, wait_until='domcontentloaded', timeout=25000)
                tab.wait_for_timeout(2200)
                data = tab.screenshot(full_page=False, animations='disabled')
                with Image.open(io.BytesIO(data)) as im:
                    im.convert('RGB').save(file,'WEBP',quality=83,method=5)
                tab.close()
                if file.stat().st_size < 20_000: raise ValueError('Screenshot too small')
                new = '../assets/images/project-screenshots/'+file.name
                img['src'] = new
                img.pop('data-live-shot', None)
                img.pop('data-fallback', None)
                changed[old] = new
                success.append({'page':area,'url':url,'file':str(file.relative_to(ROOT))})
                print('Saved:', area, url, '->', file.name)
            except Exception as exc:
                print('Skipped:', url, str(exc)[:120])
        if changed:
            # Keep pre-rendered cards and client-side PROJECTS data synchronized.
            text = str(soup)
            m = re.search(r'(const PROJECTS = )(\[.*?\])(\s*;)',text,re.S)
            if m:
                projects = json.loads(m.group(2))
                for p in projects:
                    if p.get('shot') in changed:
                        p['shot'] = changed[p['shot']]
                        p.pop('liveShot',None)
                        p['mediaPlaceholder'] = False
                        p['note'] = 'Live website screenshot'
                text=text[:m.start(2)]+json.dumps(projects,ensure_ascii=False,separators=(',',':'))+text[m.end(2):]
            page_path.write_text(text, encoding='utf8')
    browser.close()
(ROOT/'CAPTURED_NEW_SCREENSHOTS.json').write_text(json.dumps(success,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
# Regenerate CSP script hashes for changed inline scripts.
subprocess.run(['python',str(ROOT/'scripts/refresh-csp.py')],check=True)
print('Finished:',len(success),'real screenshots captured; unsuccessful websites kept their local fallback.')
