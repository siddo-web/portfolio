const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'), read=p=>fs.readFileSync(path.join(root,p),'utf8');
const keys=['wordpress','shopify','webflow','wix','other-cms'];
test('all five canonical services preserve original scroll-driven portfolio presentation',()=>{
 for(const slug of keys){const s=read(slug+'/index.html');assert(s.includes('<section class="intro">'),slug);assert.match(s,new RegExp('canonical" href="https://siddique-profile\.vercel\.app/'+slug+'/"'),slug);assert(s.includes('ms-services-dd'),slug);}
 for(const slug of keys.filter(x=>x!=='webflow'))assert(read(slug+'/index.html').includes('class="card'),slug);
 const web=read('webflow/index.html');assert(web.includes('class="world'));assert(web.includes('vnext-work__card'));assert(!web.includes('Steph Saffer'));assert(!web.includes('Heroes of Tomorrow Africa'));
});
test('homepage animated doors and footer route to distinct clean canonical URLs',()=>{
 const s=read('index.html');for(const slug of keys){assert(s.includes("'./"+slug+"/'"),slug);assert(s.includes('href="'+slug+'/"'),slug);}
 const cfg=JSON.parse(read('vercel.json'));assert(cfg.redirects.find(x=>x.source==='/graphic/'&&x.destination==='/webflow/'&&x.permanent===true));
});
