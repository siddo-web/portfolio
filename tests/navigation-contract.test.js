'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const get=file=>fs.readFileSync(path.join(root,file),'utf8');
const routes=['wordpress','shopify','webflow','wix','other-cms','selected-sites'];
test('homepage top navigation follows Home, About, Services, Projects, Skills, Contact',()=>{
 const html=get('index.html');
 const nav=html.slice(html.indexOf('<header class="hdr rv">'),html.indexOf('</header>',html.indexOf('<header class="hdr rv">')));
 let at=-1;
 for(const label of ['Home','About','Services','Projects','Skills','Contact']){
  const next=nav.indexOf(`<span>${label}</span>`,at+1);
  assert(next>at,label+' is missing or out of order');at=next;
 }
 assert.match(html,/id="intro"/);assert.match(html,/id="expertise"/);assert.match(html,/id="skills"/);
 assert.match(html,/id="contact-footer"/);
 assert.match(html,/__portfolioRequestedSection/);
 assert.match(get('cms/public.js'),/intro:ready/);
});
test('all service menus link to actual homepage sections and keep modal contacts accessible',()=>{
 for(const slug of routes){
  const h=get(`${slug}/index.html`);
  for(const key of ['home','intro','projects','skills','contact'])assert.match(h,new RegExp(`data-nav="${key}"`),slug+': missing '+key);
  assert.match(h,/HOME \+ '#intro'/);assert.match(h,/HOME \+ '#projects'/);assert.match(h,/HOME \+ '#skills'/);
  assert.match(h,/HOME \+ '#contact-footer'/);
  assert.doesNotMatch(h,/data-nav="expertise"[^>]*>Expertise/);
  assert.doesNotMatch(h,/data-nav="about"[^>]*>My process/);
 }
});
