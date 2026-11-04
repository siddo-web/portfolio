/* Progressive enhancement: HTML already contains the five initial service pages for SEO and no-JS users. */
(()=>{
 'use strict';
 const slug=document.body.getAttribute('data-service');
 document.getElementById('year').textContent=String(new Date().getFullYear());
 const set=(id,str)=>{const el=document.getElementById(id);if(el&&typeof str==='string')el.textContent=str;};
 const fill=(id,items,build)=>{
  const el=document.getElementById(id);if(!el||!Array.isArray(items))return;
  const frag=document.createDocumentFragment();items.forEach((item,i)=>{const node=build(item,i);if(node)frag.append(node)});el.replaceChildren(frag);
 };
 const span=(tag,text,cls)=>{const el=document.createElement(tag);el.textContent=text;if(cls)el.className=cls;return el;};
 fetch('../../content/services.json',{cache:'no-store'})
  .then(r=>{if(!r.ok)throw Error('Not found');return r.json()})
  .then(data=>{
   const services=data.services||[],d=services.find(s=>s.slug===slug);if(!d)return;
   document.title=d.title+' — Muhammad Siddique | CMS Developer';
   const description=document.querySelector('meta[name="description"]');if(description)description.content=d.summary||'';
   set('serviceTitle',d.title);set('serviceSummary',d.summary);set('serviceTagline',d.tagline);set('serviceIntro',d.intro);
   fill('serviceBenefits',d.benefits,item=>span('li',String(item)));
   fill('serviceDeliverables',d.deliverables,(item,i)=>{const card=span('article','', 'detail-card');card.append(span('span',`0${i+1} / 0${d.deliverables.length}`),span('strong',String(item)));return card});
   fill('serviceSteps',d.steps,(item,i)=>{const li=span('li',String(item));li.prepend(span('span','STEP 0'+(i+1)));return li});
   fill('serviceTools',d.tools,item=>span('span',String(item),'tool'));
   fill('serviceFaq',d.faq,item=>{const det=document.createElement('details');det.append(span('summary',String(item.question||'')),span('p',String(item.answer||'')));return det});
   fill('serviceSwitch',services,other=>{const a=span('a',String(other.shortTitle||other.title));a.href='../'+other.slug+'/';if(other.slug===slug)a.setAttribute('aria-current','page');return a;});
  }).catch(()=>{/* Preserve server-rendered initial copy */});
})();
