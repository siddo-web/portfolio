/* Keep the original service-page layout, media and case studies untouched.
   Dynamically sync editable service copy and menu labels with the CMS. */
(()=>{
  'use strict';
  const script=document.currentScript;
  if(!script)return;
  const slug=script.dataset.service;
  const ROOT=new URL('../',script.src);
  const ids=['wordpress','shopify','webflow','wix','other-cms'];
  const routes=['wordpress/','shopify/','webflow/','wix/','other-cms/'];
  const context=["WordPress website builds and galleries.", "Shopify storefronts and Liquid sections.", "One live Webflow site and clearly marked sample briefs.", "Wix website references and clearly marked sample briefs.", "Custom CMS, migrations and other content systems."];
  const update=(services)=>{
    if(!Array.isArray(services)||services.length!==5)return;
    const active=services.find(x=>x.slug===slug);
    if(active){
      const h=document.querySelector('main .intro h1');
      if(h)h.textContent=active.shortTitle||active.title;
      const intro=document.querySelector('main .intro p');
      if(intro&&(active.intro||active.summary)){intro.textContent=active.intro||active.summary;}
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
