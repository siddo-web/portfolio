/* All five CMS services are sourced from content/services.json and editable in /admin/. */
(()=>{
 'use strict';
 const PAGE_ROUTES=['webdev_portfolio/','UIUX_portfolio/','graphic/','appdev_portfolio/','digital-marketing/'];
 const safeSlug=s=>/^[a-z0-9-]{2,64}$/.test(s||'');
 const setText=(el,value)=>{if(el&&typeof value==='string')el.textContent=value;};
 const scoped=(selector,i)=>document.querySelectorAll(selector)[i];
 const update=services=>{
  if(!Array.isArray(services)||services.length!==5)return;
  services.forEach((service,i)=>{
   if(!safeSlug(service.slug)||!service.title)return;
   setText(scoped('.nav-services__panel button[data-door] span:nth-child(2)',i),service.title);
   setText(scoped('#navList .navm__subitem span',i*2),service.title);
   const door=scoped('.doors__row .unit',i);
   if(door){setText(door.querySelector('.plate'),service.shortTitle||service.title);const btn=door.querySelector('.doorway');btn?.setAttribute('aria-label','Open the '+service.title+' door');btn?.setAttribute('aria-description',(service.tagline||'')+': '+(service.benefits||[]).join(', '));}
   const card=scoped('.ms-expertise__grid .ms-service',i);
   if(card){setText(card.querySelector('h3'),service.title);setText(card.querySelector('p'),service.summary);const button=card.querySelector('button');if(button&&button.firstChild?.nodeType===3)button.firstChild.textContent='Explore '+(service.shortTitle||service.title)+' '; }
   const foot=scoped('.sf__cols ul.work a',i);
   if(foot){setText(foot,service.title);foot.href=PAGE_ROUTES[i];}
   setText(scoped('.ld__pill',i+1)?.querySelector('span'),service.shortTitle||service.title);
   if(Array.isArray(window.__cmsDoorInfo)&&window.__cmsDoorInfo[i]){
     const info=window.__cmsDoorInfo[i];info[0]=service.title;info[1]=service.tagline||service.summary;info[2]=Array.isArray(service.benefits)?service.benefits:[];
   }
   if(Array.isArray(window.__cmsCalendarSkills))window.__cmsCalendarSkills[i]=service.shortTitle||service.title;
  });
  if(location.hash==='#expertise'){const exp=document.getElementById('expertise');exp?.setAttribute('data-services-loaded','true');}
 };
 fetch(new URL('../content/services.json',document.currentScript?.src||location.href),{cache:'no-store'})
  .then(r=>{if(!r.ok)throw new Error('Services unavailable');return r.json()})
  .then(data=>update(data.services)).catch(()=>{/* Original HTML remains fully usable */});
})();
