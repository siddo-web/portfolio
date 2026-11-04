const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const expected={wordpress:['IES — Innovative Engineering Solutions','Naomi Amram Design','IES — Project Library'],shopify:['Mardoo Scrubs','Featured Products Grid','Palace Product Template'],webflow:['Siddique — Webflow Portfolio','Webflow CMS — Project Collection'],wix:['Steph Saffer','Heroes of Tomorrow Africa'], 'other-cms':['WooCommerce to Shopify Migration','IES — WordPress Content Import','OnyxDigital — Admin CMS']};
test('user supplied websites and work descriptions are present on matching service pages',()=>{for(const [page,titles] of Object.entries(expected))for(const title of titles)assert(read(page+'/index.html').includes(title),page+' missing '+title);});
test('10+ honest, individually described entries per service without invented linked client projects',()=>{
 for(const slug of Object.keys(expected)){
  const txt=read(slug+'/index.html');
  const count=slug==='webflow'?(txt.match(/<article class="vnext-work__card"/g)||[]).length:(txt.match(/<article class="card(?: flip)?"/g)||[]).length;
  assert(count>=10,slug+' '+count);assert(txt.includes('Media to be added')||txt.includes('Project media can be added'),slug);
 }
 for(const slug of ['webflow','wix'])assert(read(slug+'/index.html').includes('not a completed client'),slug);
});
test('CMS categories are consistent and unpublished example briefs are excluded from API',()=>{
 const projects=JSON.parse(read('content/projects.json')).projects;
 assert(projects.some(p=>p.title==='SXS Performance Part'&&!p.published));
 const cats=new Set(projects.filter(p=>p.published).map(p=>p.category));
 assert.deepEqual([...cats].sort(),['wordpress','shopify','webflow','wix','other-cms'].sort());
 assert(projects.filter(p=>!p.published).length>=20);
});
