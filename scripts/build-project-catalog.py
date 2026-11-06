#!/usr/bin/env python3
"""Import the supplied CSV into the site's single public project catalog.

Usage: python scripts/build-project-catalog.py
The CSV is the source of ownership/category assertions; no unknown platforms are guessed.
Existing rich descriptions/images are retained when the project matches by exact URL or title.
"""
import csv, json, re, uuid
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit, unquote
from collections import Counter
from difflib import SequenceMatcher

ROOT=Path(__file__).resolve().parent.parent
CSV=ROOT/'content/project-source.csv'; OUT=ROOT/'content/projects.json'
old=json.loads(OUT.read_text())['projects'] if OUT.exists() else []
source=list(csv.DictReader(CSV.open(encoding='utf-8-sig', newline='')))

CATS={'WordPress Development':'wordpress','Shopify Development':'shopify','Webflow Development':'webflow','Wix Development':'wix','Other CMS & Integrations':'other-cms','Platform To Verify':'unverified'}

# Differences in titles explicitly documented in the previously published catalog.
ALIASES={'b10 life health lecture website':'b10 life lecture website',
         'onyxdigital agency website':'onyxdigital admin cms',
         'siddique webflow portfolio':'siddique webflow portfolio'}

def name_key(s):
 s=re.sub(r'[^a-z0-9]+',' ',(s or '').lower()).strip()
 return ALIASES.get(s,s)

def normal_url(s):
 if not s:return ''
 try:
  p=urlsplit(s.strip()); host=(p.hostname or '').lower().removeprefix('www.')
  if p.scheme not in ('http','https') or not host or not ('.' in host):return ''
  # Strip only tracking fragments and trailing slash, keep paths for genuine landing pages.
  path=unquote(p.path).rstrip('/').lower()
  return host+path
 except ValueError:return ''

def live_url(s):
 try:
  p=urlsplit((s or '').strip())
  if p.scheme in ('http','https') and p.hostname and '.' in p.hostname:return s.strip()
 except ValueError:pass
 return ''

oldByName={name_key(p.get('title')):p for p in old}
oldByUrl={normal_url(p.get('url')):p for p in old if normal_url(p.get('url'))}
used_old=set(); output=[]; seen_urls={}; seen_names={}; merges=[]
for r in source:
 title=r['Project Title'].strip(); uid=r['Project ID'].strip(); category=CATS[r['Portfolio Section']]
 url=live_url(r['Live Link']); key=name_key(title)
 match=oldByUrl.get(normal_url(url)) if normal_url(url) else None
 if not match:match=oldByName.get(key)
 if not match:
  for k,v in oldByName.items():
   # Highly conservative: avoid combining similar businesses with different names.
   if SequenceMatcher(None,key,k).ratio()>.95 and (not url or not v.get('url') or normal_url(url)==normal_url(v.get('url'))):
    match=v;break
 if match:used_old.add(match['id'])
 kind=('component' if 'Component / Feature' in r['Project Type Badge'] else
       'workflow' if 'Workflow / Service' in r['Project Type Badge'] else
       'concept' if 'Concept' in r['Project Type Badge'] or 'demo' in title.lower() else
       'personal' if 'Personal' in r['Project Type Badge'] else 'website')
 # Live URLs in the CSV replace older staging URLs. If CSV is blank, do not treat
 # an old Lovable concept as a verified client website.
 if not url and match and kind not in ('concept',):url=live_url(match.get('url',''))
 media=match.get('image','') if match else ''
 if media and (not (ROOT/media).is_file() or '/placeholders/' in media):media=''
 summary=(match.get('summary') if match else '') or r['Card Description'].strip()
 description=(match.get('description') if match else '') or r['Card Description'].strip()
 # Remove unjustified full-site claims from component/showcase entries.
 if kind=='component' and match and match.get('description'):
  description=match['description']
 tags=[]
 raw=(match.get('tags','') if match else '') or r['Platform / Tech Label']
 for x in re.split('[,|]',raw):
  x=x.strip()
  if x and x not in tags and x.lower()!='not confirmed' and len(x)<42:tags.append(x)
 tags=', '.join(tags[:5])
 verification=('platform-unconfirmed' if category=='unverified' else
               'concept-only' if kind=='concept' else
               'self-identified' if kind=='personal' else
               'component-only' if kind in ('component','workflow') else
               'scope-unverified')
 published=(bool(url) if kind in ('website','personal') else kind in ('component','workflow'))
 # No pretend case studies, no completed-work claims for supplied demo briefs.
 if kind=='concept' or 'demo' in title.lower() or (kind=='website' and not url):published=False
 if category=='unverified' and not url:published=False
 if category=='unverified' and kind!='website':published=False
 project={
  'id':uid, 'title':title,'category':category,'kind':kind,
  'year':match.get('year','') if match else '', 'tags':tags,
  'summary':summary,'description':description,'url':url,'image':media,
  'gallery':[x for x in (match.get('gallery',[]) if match else []) if isinstance(x,str) and (ROOT/x).is_file()],
  'featured':bool(match.get('featured')) if match else False,
  'published':published,'verification':verification,
  'sourceId':uid,'sourceNote':r['Publishing / Verification Note'].strip(),
  'sourceRows':r['Merged Source Rows'].strip(),
  'updatedAt':'2026-11-06T00:00:00.000Z'
 }
 # Deduplicate URLs by normalized website address (and titles where exact).
 dup=seen_urls.get(normal_url(url)) if normal_url(url) else seen_names.get(key)
 if dup is not None:
  prev=output[dup]
  if prev['category']=='unverified' and category!='unverified':
   prev['category']=category;prev['verification']=verification
  if len(description)>len(prev['description']):prev['description']=description
  if len(summary)>len(prev['summary']):prev['summary']=summary
  if not prev['image']:prev['image']=media
  prev['sourceRows']=', '.join(filter(None,[prev['sourceRows'],uid]))
  merges.append((prev['title'],title,'duplicate URL/title'))
  continue
 output.append(project);seen_names[key]=len(output)-1
 if normal_url(url):seen_urls[normal_url(url)]=len(output)-1
# Retain unique older projects even when not listed in CSV, but don't mislabel unknown platforms.
for p in old:
 if p.get('id') in used_old:continue
 key=name_key(p.get('title')); url=normal_url(p.get('url'))
 if key in seen_names or (url and url in seen_urls):
  merges.append((p['title'],'CSV entry','older record merged'));continue
 category=p.get('category')
 if category not in {'wordpress','shopify','webflow','wix','other-cms'}:category='unverified'
 media=p.get('image','')
 if not (media and (ROOT/media).is_file()) or '/placeholders/' in media:media=''
 project={**p,'id':p.get('id') or str(uuid.uuid4()),'category':category,
          'kind':'website' if p.get('url') else 'component',
          'verification':'scope-unverified' if p.get('url') else 'component-only',
          'published':bool(live_url(p.get('url'))),'image':media,
          'sourceId':'existing-site','sourceNote':'Unique existing-site record, review contribution details.',
          'updatedAt':'2026-11-06T00:00:00.000Z'}
 output.append(project)

# Only approved/public items belong in the deployed catalog. Preserve every other
# source record in an explicit review queue so nothing unique is discarded.
public=[p for p in output if p['published']]
review=[p for p in output if not p['published']]
OUT.write_text(json.dumps({'projects':public},indent=2,ensure_ascii=False)+'\n')
(ROOT/'content/review-queue.json').write_text(json.dumps({'projects':review},indent=2,ensure_ascii=False)+'\n')
print('Imported CSV rows:',len(source),'Catalog:',len(output),'Published:',sum(p['published'] for p in output))
for cat in [*CATS.values()]:
 arr=[p for p in output if p['category']==cat]
 print(cat, len(arr),'website cards',sum(p['published'] and p['kind'] in ('website','personal') for p in arr),'components',sum(p['published'] and p['kind'] in ('component','workflow') for p in arr),'unpublished',sum(not p['published'] for p in arr))
print('Merged duplicate records:',merges)
