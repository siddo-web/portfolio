#!/usr/bin/env python3
"""Regenerate the Vercel CSP script hash allowlist after modifying inline JS.
Requires only the Python standard library. Run from the repository with:
python scripts/refresh-csp.py
"""
from pathlib import Path
from html.parser import HTMLParser
import base64, hashlib, json

ROOT = Path(__file__).resolve().parent.parent
CONFIG = ROOT / 'vercel.json'

class Inline(HTMLParser):
    def __init__(self):
        super().__init__()
        self.current = False
        self.blocks = []
    def handle_starttag(self, tag, attrs):
        if tag == 'script' and 'src' not in dict(attrs):
            self.current = True
            self.blocks.append('')
    def handle_endtag(self, tag):
        if tag == 'script':
            self.current = False
    def handle_data(self, data):
        if self.current:
            self.blocks[-1] += data

hashes = set()
for f in ROOT.rglob('*.html'):
    p = Inline()
    p.feed(f.read_text(encoding='utf-8'))
    for value in p.blocks:
        if value.strip():
            hashes.add(base64.b64encode(hashlib.sha256(value.encode()).digest()).decode())

config = json.loads(CONFIG.read_text(encoding='utf-8'))
header = next(h for h in config['headers'][0]['headers'] if h['key'] == 'Content-Security-Policy')
parts = header['value'].split('; ')
parts = [('script-src \'self\' ' + ' '.join("'sha256-" + h + "'" for h in sorted(hashes)))
         if part.startswith('script-src ') else part for part in parts]
header['value'] = '; '.join(parts)
CONFIG.write_text(json.dumps(config, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Refreshed Content-Security-Policy: {len(hashes)} unique allowed inline scripts')
