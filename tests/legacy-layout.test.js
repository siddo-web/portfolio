'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const routes=['webdev_portfolio','UIUX_portfolio','graphic','appdev_portfolio','digital-marketing'];
const slugs=['wordpress-development','shopify-development','webflow-wix-development','cms-migration-integration','cms-support-optimization'];
test('service pages use the existing portfolio card and gallery layouts, not generic service-card templates',()=>{
 routes.forEach((route,i)=>{
  const html=read(route+'/index.html');
  assert.match(html,/<section class="intro">/);
  assert.match(html,/data-cms-service-heading/);
  assert.match(html,/services\/legacy\.js/);
  assert.match(html,/<link rel="canonical" href="\/[^"]+"/);
  if(route==='graphic'){
    assert.match(html,/class="worlds"/);
    assert((html.match(/class="world"/g)||[]).length>=5);
  }else if(route==='digital-marketing'){
    assert.match(html,/const PROJECTS = \[/);
    assert.match(html,/"title":"Naomi Amram — Website Updates"/);
  }else{
    assert.match(html,/class="card/);
    assert.match(html,/class="stage"/);
    assert.match(html,/assets\/media\//);
  }
  const alias=read(`services/${slugs[i]}/index.html`);
  assert.match(alias,new RegExp(route+'\/'));
  assert.doesNotMatch(alias,/detail-card/);
 });
});
test('homepage cards, footer links and animated doors use restored routes',()=>{
 const home=read('index.html');
 for(const r of routes){assert.match(home,new RegExp(`\./${r}/index\.html`));assert.match(home,new RegExp(`href="${r}/"`));}
 assert.doesNotMatch(home,/\.\/services\/wordpress-development\/index\.html/);
 assert.match(read('services/public.js'),/PAGE_ROUTES/);
});
