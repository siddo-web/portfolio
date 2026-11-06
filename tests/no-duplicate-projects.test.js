'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');const data=require('../content/projects.json').projects;
const review=require('../content/review-queue.json').projects;
const csv=fs.readFileSync(path.join(root,'content/project-source.csv'),'utf8');
function norm(u){if(!u)return '';const parsed=new URL(u);return parsed.hostname.replace(/^www\./,'').toLowerCase()+decodeURIComponent(parsed.pathname).replace(/\/$/,'').toLowerCase();}
test('CSV import retains all unique project records, without duplicate websites or titles',()=>{
 assert.equal(data.length+review.length,76);
 const seenUrl=new Map(),seenTitles=new Set();
 for(const p of [...data,...review]){
  const title=p.title.trim().toLowerCase();assert(!seenTitles.has(title),`Duplicate title: ${p.title}`);seenTitles.add(title);
  const u=norm(p.url);if(u){assert(!seenUrl.has(u),`Duplicate website URL ${p.title}, ${seenUrl.get(u)}`);seenUrl.set(u,p.title);}
  assert(p.sourceId&&p.sourceNote,p.title+' missing provenance/verification');
 }
 assert.match(csv,/PRJ-076/);
});
test('all owner-supplied live websites appear once, with URL retained',()=>{
 const domains=['hollywood-associates.com','greatergaingroup.com','artandindustryinc.com','sxspartsusa.com','williamhthielen.com','tikuyatravels.com','oemachinecompany.com','reagsreviews.com','deviantappleinc.com','schoolofimagination.org','uwflorence.org','eliedesignfl.com','bostoncustomsigns.com','cambiar.ae','swankypros.com','nolanwells-studios.com','greenbergpsychology.com','rnlrealty.com','kaanthaa.com','adornmarmor.com','lisaeven.com','smartlifefoundation.org','tenfoldbrand.com','srny.webflow.io','pleasepaulostopcappin.com'];
 const urls=data.map(p=>norm(p.url));for(const host of domains)assert.equal(urls.filter(u=>u.startsWith(host)).length,1,`Missing / repeated ${host}`);
});
