from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
pages={
'index.html':'/',
'webdev_portfolio/index.html':'/webdev_portfolio/',
'UIUX_portfolio/index.html':'/UIUX_portfolio/',
'graphic/index.html':'/graphic/',
'appdev_portfolio/index.html':'/appdev_portfolio/',
'digital-marketing/index.html':'/digital-marketing/',
'explorer.html':'/explorer.html',
'privacy.html':'/privacy.html',
}
for file,route in pages.items():
 p=root/file
 s=p.read_text(encoding='utf-8')
 s,n=re.subn(r'<iframe\s+id="nl-badge-frame"\b[\s\S]*?</iframe>','',s,flags=re.I)
 if n:print('Removed legacy Netlify iframe from',file)
 if file=='appdev_portfolio/index.html':
  s=s.replace('<aside class="ms-inner-demo" role="note">Concept showcase from the provided reference package. Replace demo projects with your own verified work before publishing.</aside>','')
 # Fix invalid OG url pointing at archived source HTML
 s=re.sub(r'<meta\s+property="og:url"\s+content="[^"]*"\s*/?>','<meta property="og:url" content="'+route+'">',s,flags=re.I)
 # Canonical for each actual route, not source capture
 s=re.sub(r'<link\s+rel="canonical"\s+href="[^"]*"\s*/?>','',s,flags=re.I)
 s=s.replace('</title>','</title>\n<link rel="canonical" href="'+route+'">',1)
 if 'name="description"' not in s and 'name=description' not in s:
  intro=('Explore the creative portfolio and experiments of Muhammad Siddique.' if file=='explorer.html' else 'Privacy, credits and contact details for the portfolio of Muhammad Siddique.')
  s=s.replace('</title>','</title>\n<meta name="description" content="'+intro+'">',1)
 if file=='index.html':
  s=s.replace('<link rel="icon" type="image/png" href="assets/images/siddique-mark.svg"','<link rel="icon" type="image/svg+xml" href="assets/images/siddique-mark.svg"')
  s=s.replace('<link rel="apple-touch-icon" href="assets/images/siddique-mark.svg" />','<link rel="apple-touch-icon" href="assets/images/siddique-touch-icon.png" />')
  og='<meta property="og:image" content="assets/images/muhammad-siddique-og.jpg" />'
  if s.count(og)>1:
   a,b=s.split(og,1);b=b.replace(og,'');s=a+og+b
 p.write_text(s,encoding='utf-8')
# redirect aliases are not distinct indexable pages
for file in ['home.html','work.html','my-story.html']:
 p=root/file;s=p.read_text(encoding='utf-8')
 s=s.replace('<title>','<meta name="robots" content="noindex,follow"><title>',1)
 s=re.sub(r'<script src="cms/public.js".*?</script>','',s)
 p.write_text(s,encoding='utf-8')
# Source archive contains full third-party site captures and Netlify metadata;
# they are not the active portfolio. Remove to prevent accidental indexing/exposure.
for p in root.glob('**/assets/other/*.html'):
 p.unlink()
for p in root.glob('**/manifest.json'):
 p.unlink()
for p in root.glob('**/assets/js/*hud.js'):
 p.unlink()
for p in root.glob('**/assets/js/*spector.bundle.js'):
 p.unlink()
