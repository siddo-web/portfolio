/* Keep the original service-page layout, media and case studies untouched.
   Dynamically sync editable service copy and menu labels with the CMS. */
(()=>{
  'use strict';
  const script=document.currentScript;
  if(!script)return;
  const slug=script.dataset.service;
  const ROOT=new URL('../',script.src);
  const ids=['wordpress-development','shopify-development','webflow-wix-development','cms-migration-integration','cms-support-optimization'];
  const routes=['webdev_portfolio/','UIUX_portfolio/','graphic/','appdev_portfolio/','digital-marketing/'];
  const context=["The selected projects below demonstrate relevant front-end and interaction work, rather than claiming they were built in WordPress.", "The selected projects below highlight interface and shopping-journey thinking, rather than claiming they were built on Shopify.", "The creative work below highlights the visual direction I bring to CMS builds, rather than claiming a specific platform was used.", "The selected apps below illustrate product logic and user experience, rather than claiming they are CMS migration projects.", "The examples below illustrate CMS support capabilities; they are not presented as client performance results."];
  const update=(services)=>{
    if(!Array.isArray(services)||services.length!==5)return;
    const active=services.find(x=>x.slug===slug);
    if(active){
      const h=document.querySelector('main .intro h1');
      if(h)h.textContent=active.shortTitle||active.title;
      const intro=document.querySelector('main .intro p');
      if(intro&&active.summary){const index=ids.indexOf(slug);intro.textContent=active.summary+' '+(context[index]||'');}
      document.title=(active.title||'CMS Development')+' — Muhammad Siddique | CMS Developer';
      const desc=document.querySelector('meta[name="description"]');
      if(desc&&active.summary)desc.content=active.summary;
    }
    // Keeps desktop dropdown, mobile menu and footer labels consistent with /admin/ edits.
    document.querySelectorAll('[data-nav^="door:"]').forEach(el=>{
      const idx=Number(el.getAttribute('data-nav').slice(5));
      const d=services[idx];if(!d)return;
      if(el.tagName==='BUTTON'&&el.querySelector('small')){
        // Keep the existing numbered button and decorative arrow in place.
        [...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).forEach(n=>{if(n.nodeValue.trim())n.nodeValue=d.title;});
      }else if(el.tagName==='A'){
        el.textContent=d.title;
        el.href=new URL(routes[idx],ROOT).pathname;
      }else el.textContent=d.title;
    });
  };
  fetch(new URL('content/services.json',ROOT),{cache:'no-store'})
    .then(r=>{if(!r.ok)throw Error('Services not found');return r.json();})
    .then(d=>update(d.services)).catch(()=>{/* Static copy works without JavaScript. */});
})();
