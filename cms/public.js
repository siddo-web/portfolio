/* Muhammad Siddique — public portfolio powered by the private CMS. */
(()=>{
  'use strict';
  const script=document.currentScript;
  if(!script)return;
  const cmsBase=new URL('./',script.src),siteBase=new URL('../',cmsBase);
  const category=script.dataset.category||'';
  const chosen=category||'';
  const categories={'web-development':'Web Development','web-design':'Web Design','design-brand':'Design & Brand','app-development':'App Development','digital-marketing':'Digital Marketing'};
  const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('public.css',cmsBase);document.head.appendChild(css);
  const section=document.createElement('section');section.className='ms-cms-section';section.id='selected-projects';section.setAttribute('aria-label','Selected portfolio projects');
  section.hidden=true;
  const create=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;};
  const linkSafe=(url)=>{try{const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:null;}catch{return null;}};
  const imgSafe=(s)=>{
    if(/^assets\/uploads\/[a-zA-Z0-9_.-]+\.(?:jpg|png|webp)$/.test(s||''))return new URL(s,siteBase).href;
    try{const u=new URL(s);if(u.protocol==='https:'&&/^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)&&/^\/storage\/v1\/object\/public\/portfolio-media\/uploads\/[0-9a-f-]+\.(?:jpg|png|webp)$/i.test(u.pathname)&&!u.search&&!u.hash)return u.href;}catch{}
    return null;
  };
  let all=[];let filtered=[];let active=chosen;
  const shell=create('div','ms-cms-shell');section.append(shell);
  const top=create('div','ms-cms-top');shell.append(top);
  const intro=create('div','');intro.append(create('span','ms-cms-eyebrow','PROJECT ARCHIVE / CURATED WORK'));
  const title=create('h2','','Selected ');const italic=create('em','','work.');title.append(italic);intro.append(title);
  intro.append(create('p','','A collection of ideas brought to life across design, development and marketing.'));
  top.append(intro);
  const filter=create('div','ms-cms-filters');top.append(filter);
  const grid=create('div','ms-cms-grid');shell.append(grid);
  const detail=create('dialog','ms-cms-dialog');detail.setAttribute('aria-label','Project details');document.body.append(detail);
  detail.addEventListener('click',(ev)=>{if(ev.target===detail)detail.close();});
  detail.addEventListener('close',()=>{detail.replaceChildren();});
  function openProject(p){
    detail.replaceChildren();
    const close=create('button','ms-cms-close','×');close.setAttribute('aria-label','Close project');close.addEventListener('click',()=>detail.close());detail.append(close);
    const src=imgSafe(p.image);if(src){const hero=create('img','ms-cms-large');hero.src=src;hero.alt=p.title;detail.append(hero);}
    const body=create('div','ms-cms-dialogbody');body.append(create('span','ms-cms-eyebrow',categories[p.category]||'Portfolio'));
    body.append(create('h2','',p.title));
    const meta=create('p','ms-cms-meta',p.year||'');if(p.tags)meta.textContent+=(meta.textContent?'  ·  ':'')+p.tags;body.append(meta);
    if(p.summary)body.append(create('p','ms-cms-summary',p.summary));
    if(p.description){const desc=create('div','ms-cms-desc',p.description);desc.style.whiteSpace='pre-line';body.append(desc);}
    if(Array.isArray(p.gallery)&&p.gallery.length){const gal=create('div','ms-cms-gallery');p.gallery.forEach(f=>{const img=imgSafe(f);if(img){const image=create('img');image.src=img;image.alt=p.title+' gallery image';image.loading='lazy';gal.append(image);}});body.append(gal);}
    const url=linkSafe(p.url);if(url){const a=create('a','ms-cms-visit','Visit project ↗');a.href=url;a.target='_blank';a.rel='noopener noreferrer';body.append(a);}
    detail.append(body);
    if(typeof detail.showModal==='function')detail.showModal();
  }
  function render(){
    grid.replaceChildren();filtered=all.filter(p=>!active||p.category===active);
    if(!filtered.length){section.hidden=true;return;}section.hidden=false;
    filtered.forEach((p,i)=>{
      const card=create('article','ms-cms-card');
      const cover=create('button','ms-cms-cover');cover.type='button';cover.setAttribute('aria-label','Open '+p.title+' project details');
      const pic=imgSafe(p.image);if(pic){const img=create('img');img.src=pic;img.alt='';img.loading='lazy';cover.append(img);}else {cover.append(create('span','ms-cms-placeholder','MS / '+String(i+1).padStart(2,'0')));}
      cover.append(create('span','ms-cms-open','View case study ↗'));cover.addEventListener('click',()=>openProject(p));card.append(cover);
      const info=create('div','ms-cms-info');info.append(create('span','ms-cms-cat',categories[p.category]||'Portfolio'));
      const name=create('button','ms-cms-title',p.title);name.type='button';name.addEventListener('click',()=>openProject(p));info.append(name);
      if(p.summary)info.append(create('p','ms-cms-description',p.summary));
      card.append(info);grid.append(card);
    });
  }
  function filters(){
    if(chosen){filter.hidden=true;return;}
    filter.replaceChildren();const vals=[['','All'],...Object.entries(categories)];
    vals.forEach(([key,label])=>{const b=create('button',active===key?'active':'',label);b.type='button';b.setAttribute('aria-pressed',active===key?'true':'false');b.addEventListener('click',()=>{active=key;filter.querySelectorAll('button').forEach(x=>{x.classList.remove('active');x.setAttribute('aria-pressed','false');});b.classList.add('active');b.setAttribute('aria-pressed','true');render();});filter.append(b);});
  }
  function mount(){
    if(document.querySelector('.ms-faq'))document.querySelector('.ms-faq').before(section);
    else if(document.querySelector('main'))document.querySelector('main').append(section);
    else if(document.querySelector('#root'))document.querySelector('#root').append(section);
    else document.body.append(section);
  }
  mount();filters();
  fetch(new URL('api/projects',siteBase),{headers:{'Accept':'application/json'},cache:'no-cache'})
    .then(r=>r.ok?r.json():Promise.reject(new Error('CMS unavailable')))
    .then(d=>{
      // Feature priority, preserving the original editorial order within each group.
      all=(Array.isArray(d.projects)?d.projects:[])
        .filter(p=>p&&p.published===true)
        .sort((a,b)=>Number(b.featured===true)-Number(a.featured===true));
      render();
    })
    .catch(()=>{section.hidden=true;});
})();
