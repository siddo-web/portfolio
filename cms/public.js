/* Muhammad Siddique: publicly published projects only; Edit published JSON directly in the repository. */
(()=>{
  'use strict';
  const script=document.currentScript;
  if(!script)return;
  const cmsBase=new URL('./',script.src),siteBase=new URL('../',cmsBase);
  const chosen=script.dataset.category||'';
  const categories={"wordpress":"WordPress Development","shopify":"Shopify Development","webflow":"Webflow Development","wix":"Wix Development","other-cms":"Other CMS & Integrations","wordpress-development": "WordPress Development", "shopify-development": "Shopify Development", "webflow-wix-development": "Webflow Development", "cms-migration-integration": "Wix Development", "cms-support-optimization": "Other CMS & Integrations", "web-development": "Web Development", "web-design": "Web Design", "design-brand": "Design & Brand", "app-development": "App Development", "digital-marketing": "Digital Marketing"};
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('public.css',cmsBase);document.head.append(css);
  const section=document.createElement('section');section.className='ms-cms-section';section.id='selected-projects';
  section.setAttribute('aria-label','Selected portfolio projects');section.hidden=true;
  const create=(tag,cls,text)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=String(text);return el;};
  const linkSafe=url=>{try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}};
  // Public project media live in two known, local folders (including named placeholders).
  // Do not accept absolute URLs, traversal or arbitrary uploads from project data.
  const validImage=/^(?:assets\/uploads\/[a-zA-Z0-9_.-]+|assets\/images\/project-screenshots\/(?:placeholders\/)?[a-zA-Z0-9_.-]+)\.(?:jpe?g|png|webp)$/i;
  const imgSafe=s=>typeof s==='string'&&validImage.test(s)?new URL(s,siteBase).href:null;
  function placeholderImage(title){
    const name=String(title||'Project preview').slice(0,58);
    const escapeXml=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000"><rect width="1600" height="1000" fill="#e7dfd4"/><rect x="56" y="56" width="1488" height="888" rx="28" fill="#f8f5ef" stroke="#c9b7a3" stroke-width="3"/><text x="800" y="452" font-family="Arial,sans-serif" font-size="27" font-weight="600" fill="#a28b72" text-anchor="middle" letter-spacing="6">PROJECT PREVIEW</text><text x="800" y="535" font-family="Arial,sans-serif" font-size="49" font-weight="700" fill="#292522" text-anchor="middle">${escapeXml(name)}</text><text x="800" y="605" font-family="Arial,sans-serif" font-size="23" fill="#807268" text-anchor="middle">Replace with your website screenshot</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  }
  function assignImage(el,path,title){
    const src=imgSafe(path);
    el.onerror=()=>{el.onerror=null;el.src=placeholderImage(title);};
    el.src=src||placeholderImage(title);
    return Boolean(src);
  }
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
    if(imgSafe(p.image)){const hero=create('img','ms-cms-large');hero.alt=p.title;assignImage(hero,p.image,p.title);detail.append(hero);}
    const body=create('div','ms-cms-dialogbody');body.append(create('span','ms-cms-eyebrow',categories[p.category]||'Portfolio'));
    body.append(create('h2','',p.title));
    const meta=create('p','ms-cms-meta',p.year||'');if(p.tags)meta.textContent+=(meta.textContent?'  ·  ':'')+p.tags;body.append(meta);
    if(p.summary)body.append(create('p','ms-cms-summary',p.summary));
    if(p.description){const desc=create('div','ms-cms-desc',p.description);desc.style.whiteSpace='pre-line';body.append(desc);}
    if(Array.isArray(p.gallery)&&p.gallery.length){const gal=create('div','ms-cms-gallery');p.gallery.forEach(f=>{
      if(imgSafe(f)){const img=create('img');img.alt=p.title+' gallery image';img.loading='lazy';assignImage(img,f,p.title);gal.append(img);}
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
      if(imgSafe(p.image)){const image=create('img');image.alt='';image.loading='lazy';assignImage(image,p.image,p.title);cover.append(image);}
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
  fetch(new URL('api/projects',siteBase),{headers:{'Accept':'application/json'},cache:'no-cache'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('CMS endpoint unavailable')))
    .then(d=>{all=(Array.isArray(d.projects)?d.projects:[]).filter(p=>p&&p.published===true&&categories[p.category])
      .sort((a,b)=>Number(b.featured===true)-Number(a.featured===true)||String(b.updatedAt||'').localeCompare(String(b.updatedAt||'')));
      filters();render();})
    .catch(()=>{section.hidden=true;});
})();
