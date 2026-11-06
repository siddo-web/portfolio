/* Portfolio explorer. One shared project catalog powers the homepage and all service pages.
   Website references and component showcases are intentionally presented separately. */
(()=>{
  'use strict';
  const script=document.currentScript;
  if(!script)return;
  const root=new URL('../',script.src);
  const selected=script.dataset.category||'';
  const labels={wordpress:'WordPress Development',shopify:'Shopify Development',webflow:'Webflow Development',wix:'Wix Development','other-cms':'Other CMS & Integrations',unverified:'Platform to verify'};
  const isHome=!selected;
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('public.css',script.src);document.head.append(css);
  const elem=(tag,cls,content)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(content!==undefined)e.textContent=content;return e;};
  const validImage=/^(?:assets\/uploads\/[a-z0-9_.-]+|assets\/images\/project-screenshots\/[a-z0-9_.-]+)\.(?:png|webp|jpe?g)$/i;
  const safeImage=s=>typeof s==='string'&&validImage.test(s)?new URL(s,root).href:'';
  const safeUrl=s=>{try{const u=new URL(s);return /^https?:$/.test(u.protocol)?u.href:'';}catch{return '';}};
  const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gallery=elem('section','ms-cms-section');gallery.id='projects';gallery.setAttribute('aria-labelledby','portfolioHeading');
  gallery.hidden=true;
  const shell=elem('div','ms-cms-shell');gallery.append(shell);
  const top=elem('div','ms-cms-top');shell.append(top);
  const introduction=elem('div','ms-cms-intro');
  introduction.append(elem('span','ms-cms-eyebrow',selected==='unverified'?'UNVERIFIED PLATFORM / SEPARATE ARCHIVE':'A SELECTION OF DIGITAL WORK'));
  const heading=elem('h2');heading.id='portfolioHeading';
  heading.append(document.createTextNode(selected==='unverified'?'Platform to ':selected?'Projects & ':'Selected '),elem('em','',selected==='unverified'?'confirm.':selected?'work.':'projects.'));
  introduction.append(heading);
  introduction.append(elem('p','',selected==='unverified'
    ?'These website references are kept separate until their CMS platform and project contribution are confirmed.'
    :selected?'Website references and personal projects are separated from component examples. Every project appears only once.'
    :'Explore website references by platform. A separate collection holds websites whose CMS has not been confirmed.'));
  top.append(introduction);
  const controls=elem('div','ms-cms-controls');top.append(controls);
  const filters=elem('div','ms-cms-filters');filters.setAttribute('role','group');filters.setAttribute('aria-label','Filter projects by platform');controls.append(filters);
  const srch=elem('label','ms-cms-search');
  const srLabel=elem('span','sr-only','Search projects');srch.append(srLabel);
  const search=elem('input');search.type='search';search.placeholder='Search projects';search.setAttribute('aria-label','Search projects by name or keyword');search.autocomplete='off';srch.append(search);controls.append(srch);
  const count=elem('p','ms-cms-count');count.setAttribute('role','status');count.setAttribute('aria-live','polite');shell.append(count);
  const grid=elem('div','ms-cms-grid');shell.append(grid);
  const more=elem('button','ms-cms-more','Show more projects ↓');more.type='button';more.hidden=true;shell.append(more);
  const components=elem('section','ms-cms-components');components.setAttribute('aria-labelledby','componentsTitle');components.hidden=true;shell.append(components);
  const aside=elem('p','ms-cms-archive-link');
  if(isHome){const a=elem('a','','View websites awaiting platform verification ↗');a.href=new URL('selected-sites/',root).pathname;aside.append(a);shell.append(aside);}
  const modal=elem('dialog','ms-cms-dialog');modal.setAttribute('aria-label','Project information');document.body.append(modal);
  let lastFocus=null;
  modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
  modal.addEventListener('close',()=>{modal.replaceChildren();lastFocus?.focus({preventScroll:true});});
  let records=[],active=selected||'all',shown=9;

  function openDetails(p){
    lastFocus=document.activeElement;
    modal.replaceChildren();
    const x=elem('button','ms-cms-close','×');x.type='button';x.setAttribute('aria-label','Close project details');x.addEventListener('click',()=>modal.close());modal.append(x);
    const img=safeImage(p.image);
    if(img){const cover=elem('img','ms-cms-large');cover.src=img;cover.alt=p.title+' project preview';cover.loading='lazy';modal.append(cover);}
    const body=elem('div','ms-cms-dialogbody');
    const state=p.verification==='platform-unconfirmed'?'Platform not confirmed':p.kind==='personal'?'Personal project':'Website reference';
    body.append(elem('span','ms-cms-eyebrow',p.category==='unverified'?state:labels[p.category]+' · '+state));
    body.append(elem('h2','',p.title));
    if(p.tags)body.append(elem('p','ms-cms-meta',p.tags));
    if(p.summary)body.append(elem('p','ms-cms-summary',p.summary));
    if(p.description&&p.description!==p.summary)body.append(elem('p','ms-cms-desc',p.description));
    if(p.verification==='platform-unconfirmed'||p.verification==='scope-unverified'){
      body.append(elem('p','ms-cms-verification',p.verification==='platform-unconfirmed'
        ?'CMS platform and scope of work have not yet been verified.'
        :'Website reference. Exact contribution is subject to confirmation.'));
    }
    const pictures=(Array.isArray(p.gallery)?p.gallery:[]).map(safeImage).filter(Boolean);
    if(pictures.length){const gal=elem('div','ms-cms-gallery');pictures.forEach(src=>{const pic=elem('img');pic.src=src;pic.alt=p.title+' additional project screenshot';pic.loading='lazy';gal.append(pic);});body.append(gal);}
    const link=safeUrl(p.url);
    if(link){const a=elem('a','ms-cms-visit','Visit website ↗');a.href=link;a.target='_blank';a.rel='noopener noreferrer';body.append(a);}
    modal.append(body);if(typeof modal.showModal==='function')modal.showModal();
  }
  function card(p,i){
    const article=elem('article','ms-cms-card');
    const cover=elem('button','ms-cms-cover');cover.type='button';cover.setAttribute('aria-label','View '+p.title+' project details');
    const src=safeImage(p.image);
    if(src){const img=elem('img');img.src=src;img.alt='';img.loading=i<2?'eager':'lazy';img.decoding='async';
      img.addEventListener('error',()=>{img.remove();cover.classList.add('ms-cms-cover--plain');cover.prepend(elem('span','ms-cms-monogram',p.title));},{once:true});cover.append(img);
    }else {cover.classList.add('ms-cms-cover--plain');cover.append(elem('span','ms-cms-monogram',p.title));}
    cover.append(elem('span','ms-cms-open','View project details ↗'));cover.addEventListener('click',()=>openDetails(p));article.append(cover);
    const info=elem('div','ms-cms-info');
    const badge=p.verification==='platform-unconfirmed'?'Platform unconfirmed':p.kind==='personal'?'Personal project':labels[p.category];
    info.append(elem('span','ms-cms-cat',badge));
    const title=elem('button','ms-cms-title',p.title);title.type='button';title.addEventListener('click',()=>openDetails(p));info.append(title);
    if(p.summary)info.append(elem('p','ms-cms-description',p.summary));
    const link=safeUrl(p.url);
    if(link){const a=elem('a','ms-cms-inline-link','View website ↗');a.href=link;a.target='_blank';a.rel='noopener noreferrer';info.append(a);}
    article.append(info);return article;
  }
  function listComponents(){
    if(isHome||selected==='unverified'){components.hidden=true;return;}
    const list=records.filter(p=>p.category===selected&&['component','workflow'].includes(p.kind));
    components.hidden=!list.length;
    if(!list.length)return;
    components.replaceChildren();
    const heading=elem('h3','', 'Components & workflows');heading.id='componentsTitle';components.append(heading);
    components.append(elem('p','ms-cms-components-desc','Technical features and workflow examples — shown separately from completed website projects.'));
    const ul=elem('div','ms-cms-component-grid');
    list.forEach(p=>{const row=elem('article','ms-cms-component');row.append(elem('span','',p.kind==='workflow'?'WORKFLOW':'COMPONENT'),elem('h4','',p.title),elem('p','',p.summary||p.description));ul.append(row);});
    components.append(ul);
  }
  const websites=()=>records.filter(p=>['website','personal'].includes(p.kind)&&(selected?p.category===selected:p.category!=='unverified'));
  function matches(p){return (active==='all'||p.category===active)&&[p.title,p.summary,p.tags].join(' ').toLowerCase().includes(search.value.trim().toLowerCase());}
  function render(){
    const results=websites().filter(matches);
    count.textContent=results.length+' website'+(results.length===1?'':'s')+(active!=='all'?' in '+labels[active]:'');
    grid.replaceChildren();
    if(!results.length){grid.append(elem('p','ms-cms-empty','No matching websites. Try another category or keyword.'));}
    else {const fragment=document.createDocumentFragment();results.slice(0,shown).forEach((p,i)=>fragment.append(card(p,i)));grid.append(fragment);}
    more.hidden=results.length<=shown;more.textContent='Show more projects ('+(results.length-shown)+' remaining) ↓';
    listComponents();
  }
  function setupFilters(){
    filters.replaceChildren();
    if(selected){filters.hidden=true;return;}
    filters.hidden=false;
    [['all','All websites'],...Object.entries(labels).filter(([slug])=>slug!=='unverified')].forEach(([key,label])=>{
      const btn=elem('button','',label);btn.type='button';btn.setAttribute('aria-pressed',String(active===key));if(active===key)btn.classList.add('active');
      btn.addEventListener('click',()=>{
        active=key;shown=9;filters.querySelectorAll('button').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false');});
        btn.classList.add('active');btn.setAttribute('aria-pressed','true');render();
      });filters.append(btn);
    });
  }
  search.addEventListener('input',()=>{shown=9;render();});
  more.addEventListener('click',()=>{shown+=9;render();});
  // Before moving to the deep interactive sections, visitors see their projects in a conventional, accessible grid.
  if(isHome){const after=document.getElementById('expertise');
    if(after)after.after(gallery);else document.querySelector('main')?.append(gallery);
  }else{const intro=document.querySelector('main .intro');
    if(intro)intro.after(gallery);else document.querySelector('main')?.append(gallery);
  }
  const endpoints=[new URL('api/projects',root),new URL('content/projects.json',root)];
  (async()=>{
    let data=null;
    for(const url of endpoints){try{const response=await fetch(url,{headers:{Accept:'application/json'}});if(response.ok){data=await response.json();break;}}catch(_e){/* Static local server uses the JSON fallback. */}}
    if(!data||!Array.isArray(data.projects))throw Error('No project data');
    records=data.projects.filter(p=>p&&p.published===true&&labels[p.category])
      .sort((a,b)=>Number(b.featured===true)-Number(a.featured===true)||a.title.localeCompare(b.title));
    gallery.hidden=false;setupFilters();render();
    // The homepage project section is injected after fetch, so a direct #projects
    // link from a service page needs to scroll *after* the section exists.
    if(isHome && typeof window!=='undefined' && window.__portfolioRequestedSection){
      const target=window.__portfolioRequestedSection;
      const scrollToEntry=()=>{
        const el=document.getElementById(target);
        if(el&&typeof el.scrollIntoView==='function')el.scrollIntoView({block:'start',behavior:'auto'});
      };
      if(document.body.classList.contains('ready'))requestAnimationFrame(scrollToEntry);
      else window.addEventListener('intro:ready',()=>requestAnimationFrame(scrollToEntry),{once:true});
    }
  })().catch(()=>{
    gallery.hidden=false;
    count.textContent='Portfolio data is unavailable.';
    grid.append(elem('p','ms-cms-empty','The project catalog could not be loaded. Please refresh the page.'));
  });
})();
