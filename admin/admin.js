'use strict';
const $=s=>document.querySelector(s);
const api=(action,method='GET',data)=>fetch('/api/admin?action='+encodeURIComponent(action),{method,credentials:'same-origin',headers:{...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})}).then(async r=>{const d=await r.json().catch(()=>({message:'Unexpected server response.'}));if(!r.ok)throw Error(d.message||`Request failed (${r.status})`);return d;});
const githubFallback='https://raw.githubusercontent.com/siddo-web/portfolio/main/';
const catLabels={"wordpress-development": "WordPress Development", "shopify-development": "Shopify Development", "webflow-wix-development": "Webflow & Wix Development", "cms-migration-integration": "CMS Migration & Integrations", "cms-support-optimization": "CMS Support & Optimization", "web-development": "Web Development", "web-design": "Web Design", "design-brand": "Design & Brand", "app-development": "App Development", "digital-marketing": "Digital Marketing"};
let projects=[],activeId='',gallery=[],lastFocus=null,toastTimer;
function showToast(msg,error=false){const el=$('#toast');el.textContent=msg;el.className='toast'+(error?' error':'');el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,6500);}
function authView(logged){$('#authView').hidden=logged;$('#appView').hidden=!logged;if(!logged)$('#password').focus();}
function text(el,v){el.textContent=v;return el;}
function elt(tag,cls='',value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!=null)e.textContent=String(value);return e;}
function safeImage(path){return /^assets\/uploads\/[a-zA-Z0-9_.-]+\.(png|jpg|webp)$/.test(path||'')?'/'+path:null;}
async function load(){try{const d=await api('projects');projects=d.projects||[];render();}catch(e){showToast(e.message,true);}}
function render(){const list=$('#projectList'),filter=$('#filterCategory').value;list.replaceChildren();$('#countAll').textContent=projects.length;$('#countLive').textContent=projects.filter(x=>x.published).length;$('#countDraft').textContent=projects.filter(x=>!x.published).length;const items=projects.filter(p=>!filter||p.category===filter);$('#emptyHint').hidden=items.length>0;
 for(const p of items){const row=elt('article','project-row');const img=safeImage(p.image);if(img){const pic=elt('img','thumb');pic.src=img;pic.onerror=()=>{pic.onerror=null;pic.src=githubFallback+p.image;};pic.alt='';pic.loading='lazy';row.append(pic)}else row.append(elt('div','thumb thumb-fallback','MS'));
 const middle=elt('div');middle.append(elt('div','project-name',p.title));middle.append(elt('div','project-meta',(catLabels[p.category]||'Portfolio')+' · '+(p.year||'No year')));middle.append(elt('span','status'+(p.published?' live':''),p.published?'Published':'Draft'));if(p.featured)middle.append(elt('span','status featured','Featured'));if(p.replaceLegacy)middle.append(elt('span','status','Replaces sample cards'));row.append(middle);
 const actions=elt('div','row-actions');const edit=elt('button','','Edit');edit.type='button';edit.addEventListener('click',()=>openEditor(p));const del=elt('button','danger','Delete');del.type='button';del.addEventListener('click',()=>removeProject(p));actions.append(edit,del);row.append(actions);list.append(row);
 }
}
function fields(){return {title:$('#pTitle').value,category:$('#pCategory').value,summary:$('#pSummary').value,description:$('#pDescription').value,year:$('#pYear').value,tags:$('#pTags').value,url:$('#pUrl').value,image:$('#pImage').value,gallery:[...gallery],featured:$('#pFeatured').checked,replaceLegacy:$('#pReplaceLegacy').checked,published:$('#pPublished').checked};}
function preview(){const cover=$('#pCoverPreview');cover.replaceChildren();const src=safeImage($('#pImage').value);if(src){const img=elt('img');img.src=src;img.onerror=()=>{img.onerror=null;img.src=githubFallback+$('#pImage').value;};img.alt='Cover image';cover.append(img)}const gal=$('#pGalleryPreview');gal.replaceChildren();gallery.forEach((g,i)=>{const url=safeImage(g);if(!url)return;const box=elt('div');const img=elt('img');img.src=url;img.onerror=()=>{img.onerror=null;img.src=githubFallback+g;};img.alt='Gallery image';const btn=elt('button','','×');btn.type='button';btn.setAttribute('aria-label','Remove gallery image');btn.addEventListener('click',()=>{gallery.splice(i,1);preview()});box.append(img,btn);gal.append(box)});}
function openEditor(p){lastFocus=document.activeElement;$('#projectForm').reset();activeId=p?.id||'';gallery=[...(p?.gallery||[])];$('#editorTitle').textContent=p?'Edit project':'New project';$('#pTitle').value=p?.title||'';$('#pCategory').value=p?.category||'wordpress-development';$('#pSummary').value=p?.summary||'';$('#pDescription').value=p?.description||'';$('#pYear').value=p?.year||'';$('#pTags').value=p?.tags||'';$('#pUrl').value=p?.url||'';$('#pImage').value=p?.image||'';$('#pPublished').checked=p?p.published===true:true;$('#pFeatured').checked=p?.featured===true;$('#pReplaceLegacy').checked=p?p.replaceLegacy===true:true;$('#pCoverFile').value='';$('#pGalleryFiles').value='';preview();$('#editor').showModal();setTimeout(()=>$('#pTitle').focus(),70);}
function closeEditor(){$('#editor').close();lastFocus?.focus?.();}
async function removeProject(p){if(!confirm(`Delete "${p.title}"? This removes it from your portfolio after Vercel redeploys.`))return;try{await api('delete','POST',{id:p.id});showToast('Project removed. Deployment will update the website.');await load();}catch(e){showToast(e.message,true);}}
async function shrink(file){if(!file.type.startsWith('image/'))throw Error('Please choose an image.');const bitmap=await createImageBitmap(file);const max=1600;const k=Math.min(1,max/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*k));canvas.height=Math.max(1,Math.round(bitmap.height*k));const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.8));if(!blob||blob.size>1_900_000)throw Error('Image is too large. Choose or resize a smaller image.');return blob;}
async function upload(file){const blob=await shrink(file);const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=reject;r.readAsDataURL(blob);});const d=await api('upload','POST',{mime:'image/webp',data:base64});return d.path;}
async function save(e){e.preventDefault();if(!$('#pTitle').value.trim()){$('#pTitle').focus();return showToast('Project title is required.',true)}const btn=$('#saveBtn');btn.disabled=true;try{const cover=$('#pCoverFile').files[0];if(cover){btn.textContent='Uploading cover…';$('#pImage').value=await upload(cover);}const newGallery=[...$('#pGalleryFiles').files];if(gallery.length+newGallery.length>10)throw Error('Maximum 10 gallery images.');for(let i=0;i<newGallery.length;i++){btn.textContent=`Uploading gallery ${i+1}/${newGallery.length}…`;gallery.push(await upload(newGallery[i]));}btn.textContent='Saving to GitHub…';await api('save','POST',{id:activeId,project:fields()});closeEditor();showToast('Saved in GitHub. Your public site updates after Vercel redeploys.');await load();}catch(err){showToast(err.message,true);}finally{btn.disabled=false;btn.textContent='Save project ↗';}}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const b=$('#loginBtn');b.disabled=true;$('#loginStatus').textContent='Signing in…';try{await api('login','POST',{password:$('#password').value});$('#password').value='';$('#loginStatus').textContent='';authView(true);await load();}catch(err){text($('#loginStatus'),err.message);}finally{b.disabled=false;}});
$('#logoutBtn').addEventListener('click',async()=>{try{await api('logout','POST',{})}catch{}projects=[];authView(false)});
$('#addBtn').addEventListener('click',()=>openEditor());$('#reloadBtn').addEventListener('click',load);$('#filterCategory').addEventListener('change',render);$('#editorClose').addEventListener('click',closeEditor);$('#cancelBtn').addEventListener('click',closeEditor);$('#editor').addEventListener('click',e=>{if(e.target===$('#editor'))closeEditor()});$('#projectForm').addEventListener('submit',save);
(async()=>{try{await api('status');authView(true);await load();}catch(err){authView(false);if(!/sign in|password|Please sign in/i.test(err.message))$('#loginStatus').textContent=err.message;}})();


/* CMS service editor: edits the public five-service collection without changing route slugs. */
let cmsServices=[],serviceSlug='';
function showPanel(which){
 const showServices=which==='services';
 $('#projectsView').hidden=showServices;$('#servicesView').hidden=!showServices;
 $('#tabProjects').classList.toggle('active',!showServices);$('#tabServices').classList.toggle('active',showServices);
 $('#dashboardTitle').innerHTML=showServices?'CMS <em>services.</em>':'Portfolio <em>projects.</em>';
 $('#dashboardDescription').textContent=showServices?'Manage all five service pages from one place.':'Add your work, organize it by service, and publish to your website.';
 $('#addBtn').hidden=showServices;
 if(showServices)loadServices();
}
async function loadServices(){
 try{const d=await api('services');cmsServices=Array.isArray(d.services)?d.services:[];renderServices();}
 catch(err){showToast(err.message,true);}
}
function renderServices(){
 const list=$('#serviceList');list.replaceChildren();
 cmsServices.forEach((s,i)=>{
  const row=elt('article','service-admin-row');const desc=elt('div');
  desc.append(elt('h3','',`0${i+1}  ${s.title}`),elt('p','',s.summary));
  const a=elt('a','','View service page ↗');a.href='/services/'+s.slug+'/';a.target='_blank';a.rel='noopener';desc.append(a);
  const b=elt('button','','Edit content ↗');b.type='button';b.addEventListener('click',()=>openServiceEditor(s));
  row.append(desc,b);list.append(row);
 });
}
function openServiceEditor(s){
 serviceSlug=s.slug;$('#serviceEditorTitle').textContent=s.title;
 const fields={sTitle:s.title,sShortTitle:s.shortTitle,sTagline:s.tagline,sSummary:s.summary,sIntro:s.intro};
 Object.entries(fields).forEach(([k,v])=>$('#'+k).value=v||'');
 Object.entries({sBenefits:s.benefits,sDeliverables:s.deliverables,sSteps:s.steps,sTools:s.tools}).forEach(([k,v])=>$('#'+k).value=(v||[]).join('\n'));
 $('#sFaq').value=(s.faq||[]).map(x=>(x.question||'')+' | '+(x.answer||'')).join('\n');
 $('#serviceEditor').showModal();
}
function closeServiceEditor(){$('#serviceEditor').close();}
function lines(id){return $('#'+id).value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);}
async function saveService(e){
 e.preventDefault();const faqs=lines('sFaq').map(line=>{const i=line.indexOf('|');if(i<0)throw Error('Each FAQ needs a question | answer.');return {question:line.slice(0,i).trim(),answer:line.slice(i+1).trim()};});
 const service={title:$('#sTitle').value,shortTitle:$('#sShortTitle').value,tagline:$('#sTagline').value,summary:$('#sSummary').value,intro:$('#sIntro').value,
   benefits:lines('sBenefits'),deliverables:lines('sDeliverables'),steps:lines('sSteps'),tools:lines('sTools'),faq:faqs};
 const btn=$('#saveServiceBtn');btn.disabled=true;btn.textContent='Saving to GitHub…';
 try{await api('saveService','POST',{slug:serviceSlug,service});closeServiceEditor();showToast('Service saved. Your website will update after Vercel deploys.');await loadServices();}
 catch(err){showToast(err.message,true);}
 finally{btn.disabled=false;btn.textContent='Save service ↗';}
}
$('#tabProjects').addEventListener('click',()=>showPanel('projects'));
$('#tabServices').addEventListener('click',()=>showPanel('services'));
$('#reloadServicesBtn').addEventListener('click',loadServices);
$('#serviceEditorClose').addEventListener('click',closeServiceEditor);
$('#cancelServiceBtn').addEventListener('click',closeServiceEditor);
$('#serviceForm').addEventListener('submit',e=>{try{saveService(e).catch(err=>showToast(err.message,true))}catch(err){e.preventDefault();showToast(err.message,true)}});
$('#serviceEditor').addEventListener('click',e=>{if(e.target===$('#serviceEditor'))closeServiceEditor()});
