'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const read=x=>fs.readFileSync(path.join(root,x),'utf8');
const categories=['wordpress','shopify','webflow','wix','other-cms'];
test('five service pages retain branded navigation and use one shared dynamic project renderer',()=>{
 for(const slug of categories){const page=read(slug+'/index.html');
  assert(page.includes('<section class="intro">'),slug);assert(page.includes('https://siddique-profile.vercel.app/'+slug+'/'),slug);
  assert(page.includes('ms-services-dd'),slug);assert(page.includes('src="../cms/public.js"'),slug);
  assert(page.includes('data-category="'+slug+'"'),slug);
  assert(!page.includes('const PROJECTS ='),`${slug} still embeds duplicated project data`);
  assert(!page.includes('Wix — Services Website'),`${slug} still displays a demo brief as client work`);
 }
});
test('homepage animated service doors and footer retain five clean service destinations',()=>{
 const s=read('index.html');for(const cat of categories)assert(s.includes(cat+'/'),cat);
 assert(s.includes('doors__row'));assert(s.includes('data-go="projects"'));
 assert(s.includes('id="skills"'));assert(s.includes('id="intro"'));
});
