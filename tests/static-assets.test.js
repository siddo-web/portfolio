'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pages=[
 'index.html','admin/index.html','webdev_portfolio/index.html',
 'UIUX_portfolio/index.html','graphic/index.html',
 'appdev_portfolio/index.html','digital-marketing/index.html'
];
for(const page of pages){
 test(`${page}: referenced local static assets exist`,()=>{
  const html=fs.readFileSync(path.join(root,page),'utf8');
  const pattern=/(?:href|src|poster)=["']([^"']+)["']/g;
  for(const [,target] of html.matchAll(pattern)){
   if(/^(https?:|\/\/|#|mailto:|tel:|data:|blob:|javascript:)/i.test(target))continue;
   const pathname=target.split(/[?#]/)[0];if(!pathname||pathname.includes('${'))continue;
   const file=pathname.startsWith('/')?path.join(root,pathname):path.resolve(root,path.dirname(page),pathname);
   assert.equal(fs.existsSync(file),true,`${page}: missing ${target}`);
  }
 });
}
test('all service pages mount the CMS script',()=>{
 for(const file of pages.filter(x=>x!=='index.html'&&x!=='admin/index.html')){
  const html=fs.readFileSync(path.join(root,file),'utf8');
  assert.match(html,/cms\/public\.js/);
 }
});
