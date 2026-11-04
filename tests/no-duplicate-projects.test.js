'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=['wordpress','shopify','wix','other-cms','selected-sites'];
const normal=url=>{
  if(!url)return '';
  const u=new URL(url);
  return u.hostname.replace(/^www\./,'').toLowerCase()+decodeURIComponent(u.pathname).replace(/\/$/,'').toLowerCase();
};
test('service projects show one card per website across category pages',()=>{
 const urls=new Map(),titles=new Map();
 for(const slug of pages){
  const html=fs.readFileSync(path.join(root,slug,'index.html'),'utf8');
  const m=html.match(/const PROJECTS\s*=\s*(\[.*?\])\s*;/s);assert(m,`Missing static project data: ${slug}`);
  const projects=JSON.parse(m[1]);
  const cards=html.match(/<article\b[^>]*class="card(?: flip)?"[^>]*>/g)||[];
  assert.equal(cards.length,projects.length,`Static card count differs from JS data: ${slug}`);
  for(const [i,p] of projects.entries()){
   const n=normal(p.url);
   if(n){assert(!urls.has(n),`${slug} repeats ${p.title} already in ${urls.get(n)}`);urls.set(n,slug+' / '+p.title);}
   const t=p.title.toLowerCase().replace(/\s+/g,' ').trim();
   assert(!titles.has(t),`${slug} repeats ${p.title} already in ${titles.get(t)}`);
   titles.set(t,slug+' / '+p.title);
   assert.match(html,new RegExp(`id="p${i}"`));
  }
 }
});
test('all supplied 25 websites are retained as service or selected site links',()=>{
 const urls = ['hollywood-associates.com','greatergaingroup.com','artandindustryinc.com','sxspartsusa.com','williamhthielen.com','tikuyatravels.com','oemachinecompany.com','reagsreviews.com','deviantappleinc.com','schoolofimagination.org','uwflorence.org','eliedesignfl.com','bostoncustomsigns.com','cambiar.ae','swankypros.com','nolanwells-studios.com','greenbergpsychology.com','rnlrealty.com','kaanthaa.com','adornmarmor.com','lisaeven.com','smartlifefoundation.org','tenfoldbrand.com','srny.webflow.io','pleasepaulostopcappin.com'];
 const combined=['wordpress','shopify','webflow','wix','other-cms','selected-sites'].map(p=>fs.readFileSync(path.join(root,p,'index.html'),'utf8')).join('\n');
 for(const domain of urls) assert(combined.includes(domain),`Missing owner site ${domain}`);
});
