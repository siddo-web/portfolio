'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const data=require('../content/projects.json').projects,review=require('../content/review-queue.json').projects;
const groups=new Set(['wordpress','shopify','webflow','wix','other-cms','unverified']);
test('known-platform projects appear only in their service category; unknown platforms stay separate',()=>{
 assert(data.every(p=>groups.has(p.category)));
 assert.equal(data.filter(p=>p.category==='unverified').length,35);
 assert(data.filter(p=>p.category==='unverified').every(p=>p.verification==='platform-unconfirmed'));
 for(const [title,category] of [['Hollywood Associates','wix'],['Greater Gain Group','webflow'],['SXS Parts USA','shopify'],['Art & Industry Inc.','wordpress'],['OnyxDigital — Agency Website','other-cms']]){
  const p=data.find(p=>p.title===title);assert(p,title);assert.equal(p.category,category);
 }
});
test('sample briefs and components are not displayed as completed website work',()=>{
 const websites=data.filter(p=>p.kind==='website');assert(websites.every(p=>p.url&&p.verification!=='concept-only'));
 assert(review.some(p=>p.title==='Mardoo Scrubs'&&p.kind==='concept'));
 assert(review.some(p=>p.title.includes('demo')));
 assert(data.some(p=>p.kind==='component'));
});
test('all published website URLs are unique and syntactically safe',()=>{
 let urls=new Set();for(const p of data){if(!p.url)continue;const u=new URL(p.url);assert(['https:','http:'].includes(u.protocol));const norm=u.host.replace(/^www\./,'')+u.pathname.replace(/\/$/,'');assert(!urls.has(norm),p.title);urls.add(norm);}
});
