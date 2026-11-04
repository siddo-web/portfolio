'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const expected={
 'webdev_portfolio/index.html':['IES — Innovative Engineering Solutions','Naomi Amram Design','IES — Project Library'],
 'UIUX_portfolio/index.html':['Mardoo Scrubs','Featured Products Grid','Palace Product Template'],
 'graphic/index.html':['Siddique — Webflow Portfolio','Steph Saffer','Heroes of Tomorrow Africa'],
 'appdev_portfolio/index.html':['WooCommerce to Shopify Migration','IES — WordPress Content Import','OnyxDigital — Admin CMS'],
 'digital-marketing/index.html':['Naomi Amram — Website Updates','IES — Project Content Audit','HYRA — Sales Landing Page']
};
test('portfolio cards and supporting JavaScript contain the supplied owned-site content',()=>{
 for(const [file,names] of Object.entries(expected)){
  const html=read(file);
  for(const name of names)assert(html.includes(name),`${file} missing ${name}`);
 }
});
test('published CMS projects preserve previously unpublished draft and use five CMS categories',()=>{
 const projects=JSON.parse(read('content/projects.json')).projects;
 assert.equal(projects.filter(x=>x.published).length,12);
 assert(projects.some(x=>x.title==='SXS Performance Part' && x.published===false));
 const categories=new Set(projects.filter(x=>x.published).map(x=>x.category));
 assert.deepEqual([...categories].sort(), ['wordpress-development','shopify-development','webflow-wix-development','cms-migration-integration','cms-support-optimization'].sort());
 assert(projects.filter(x=>x.published).every(x=>x.image==='' && Array.isArray(x.gallery)));
});
