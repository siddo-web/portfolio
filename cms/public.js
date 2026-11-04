/* Muhammad Siddique: publicly published projects only; GitHub CMS remains the default editor. */
(()=>{
  'use strict';
  const script=document.currentScript;
  if(!script)return;
  const cmsBase=new URL('./',script.src),siteBase=new URL('../',cmsBase);
  const chosen=script.dataset.category||'';
  const categories={"wordpress-development": "WordPress Development", "shopify-development": "Shopify Development", "webflow-wix-development": "Webflow & Wix Development", "cms-migration-integration": "CMS Migration & Integrations", "cms-support-optimization": "CMS Support & Optimization", "web-development": "Web Development", "web-design": "Web Design", "design-brand": "Design & Brand", "app-development": "App Development", "digital-marketing": "Digital Marketing"};
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('public.css',cmsBase);document.head.append(css);
  const section=document.createElement('section');section.className='ms-cms-section';section.id='selected-projects';
  section.setAttribute('aria-label','Selected portfolio projects');section.hidden=true;
  const create=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};
  const linkSafe=url=>{try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}};
  const imgSafe=s=>/^assets\/uploads\/[a-zA-Z0-9_.-]+\.(?:jpg|png|webp)$/.test(s||'')?new URL(s,siteBase).href:null;
  // The uploaded ZIP predates two images already committed to the public GitHub repo.
  // Use the original existing GitHub assets as an on-error fallback, without exposing any credentials.
  const fallbackBase='https://raw.githubusercontent.com/siddo-web/portfolio/main/';
  function assignImage(el,path){const src=imgSafe(path);if(!src)return false;el.src=src;el.onerror=()=>{
    el.onerror=null;el.src=fallbackBase+path;
  };return true;}
  let all=[],active=chosen;
  const shell=create('div','ms-cms-shell');section.append(shell);
  const top=create('div','ms-cms-top');shell.append(top);
  const intro=create('div','');intro.append(create('span','ms-cms-eyebrow','PROJECT ARCHIVE / CURATED WORK'));
  const title=create('h2','','Selected ');title.append(create('em','','work.'));intro.append(title);
  intro.append(create('p','','Selected projects and related work from across CMS development and digital experiences.'));top.append(intro);
  const filter=create('div','ms-cms-filters');top.append(filter);
  const grid=create('div','ms-cms-grid');shell.append(grid);
  const detail=create('dialog','ms-cms-dialog');detail.setAttribute('aria-label','Project details');document.body.append(detail);
  detail.addEventListener('click',ev=>{if(ev.target===detail)detail.close();});
  detail.addEventListener('close',()=>detail.replaceChildren());
  function openProject(p){
    detail.replaceChildren();
    const close=create('button','ms-cms-close','×');close.type='button';close.setAttribute('aria-label','Close project');close.addEventListener('click',()=>detail.close());detail.append(close);
    if(imgSafe(p.image)){const hero=create('img','ms-cms-large');hero.alt=p.title;assignImage(hero,p.image);detail.append(hero);}
    const body=create('div','ms-cms-dialogbody');body.append(create('span','ms-cms-eyebrow',categories[p.category]||'Portfolio'));
    body.append(create('h2','',p.title));
    const meta=create('p','ms-cms-meta',p.year||'');if(p.tags)meta.textContent+=(meta.textContent?'  ·  ':'')+p.tags;body.append(meta);
    if(p.summary)body.append(create('p','ms-cms-summary',p.summary));
    if(p.description){const desc=create('div','ms-cms-desc',p.description);desc.style.whiteSpace='pre-line';body.append(desc);}
    if(Array.isArray(p.gallery)&&p.gallery.length){const gal=create('div','ms-cms-gallery');p.gallery.forEach(f=>{
      if(imgSafe(f)){const img=create('img');img.alt=p.title+' gallery image';img.loading='lazy';assignImage(img,f);gal.append(img);}
    });body.append(gal);}
    const url=linkSafe(p.url);if(url){const a=create('a','ms-cms-visit','Visit project ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';body.append(a);}
    detail.append(body);detail.showModal?.();
  }
  function syncLegacy(){
    if(!chosen)return;
    const hide=all.some(p=>p.category===chosen&&p.replaceLegacy===true);
    const legacy=document.querySelector(chosen==='design-brand'?'#worlds':'#stack');
    if(legacy){legacy.hidden=hide;legacy.classList.toggle('ms-cms-replaced',hide);}
  }
  function render(){
    grid.replaceChildren();const filtered=all.filter(p=>!active||p.category===active);
    section.hidden=!filtered.length;syncLegacy();if(!filtered.length)return;
    filtered.forEach((p,i)=>{
      const card=create('article','ms-cms-card'+(p.featured?' ms-cms-featured':''));
      const cover=create('button','ms-cms-cover');cover.type='button';cover.setAttribute('aria-label','Open '+p.title+' project details');
      if(imgSafe(p.image)){const image=create('img');image.alt='';image.loading='lazy';assignImage(image,p.image);cover.append(image);}
      else cover.append(create('span','ms-cms-placeholder','MS / '+String(i+1).padStart(2,'0')));
      if(p.featured){const featured=create('span','ms-cms-feature-label','Featured');cover.append(featured);}
      cover.append(create('span','ms-cms-open','View case study ↗'));cover.addEventListener('click',()=>openProject(p));card.append(cover);
      const info=create('div','ms-cms-info');info.append(create('span','ms-cms-cat',categories[p.category]||'Portfolio'));
      const name=create('button','ms-cms-title',p.title);name.type='button';name.addEventListener('click',()=>openProject(p));info.append(name);
      if(p.summary)info.append(create('p','ms-cms-description',p.summary));card.append(info);grid.append(card);
    });
  }
  function filters(){
    if(chosen){filter.hidden=true;return;}
    filter.replaceChildren();[['','All'],...Object.entries(categories).filter(([key])=>all.some(p=>p.category===key))].forEach(([key,label])=>{
      const b=create('button',active===key?'active':'',label);b.type='button';b.setAttribute('aria-pressed',String(active===key));
      b.addEventListener('click',()=>{active=key;filter.querySelectorAll('button').forEach(x=>{
        x.classList.remove('active');x.setAttribute('aria-pressed','false');
      });b.classList.add('active');b.setAttribute('aria-pressed','true');render();});filter.append(b);
    });
  }
  function mount(){
    const target=document.querySelector('.ms-faq');
    if(target)target.before(section);
    else if(document.querySelector('main'))document.querySelector('main').append(section);
    else if(document.querySelector('#root'))document.querySelector('#root').append(section);
    else document.body.append(section);
  }
  mount();
  const backup=()=>fetch(new URL('content/projects.json',siteBase),{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject(new Error('CMS content unavailable')));
  fetch(new URL('api/projects',siteBase),{headers:{'Accept':'application/json'},cache:'no-cache'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('CMS endpoint unavailable')))
    .catch(backup)
    .then(d=>{all=(Array.isArray(d.projects)?d.projects:[]).filter(p=>p&&p.published===true&&categories[p.category])
      .sort((a,b)=>Number(b.featured===true)-Number(a.featured===true)||String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
      filters();render();})
    .catch(()=>{section.hidden=true;});
})();
