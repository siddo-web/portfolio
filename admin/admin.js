'use strict';
const $=s=>document.querySelector(s);
const api=(action,method='GET',data)=>fetch('/api/admin?action='+encodeURIComponent(action),{method,credentials:'same-origin',headers:{...(data?{'Content-Type':'application/json'}:{})},...(data?{body:JSON.stringify(data)}:{})}).then(async r=>{const d=await r.json().catch(()=>({message:'Unexpected server response.'}));if(!r.ok)throw Error(d.message||`Request failed (${r.status})`);return d;});
const catLabels={'web-development':'Web Development','web-design':'Web Design','design-brand':'Design & Brand','app-development':'App Development','digital-marketing':'Digital Marketing'};
let projects=[],activeId='',gallery=[],lastFocus=null,toastTimer,saveBusy=false,backend='github';
function showToast(msg,error=false){const el=$('#toast');el.textContent=msg;el.className='toast'+(error?' error':'');el.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.hidden=true,6500);}
function authView(logged){$('#authView').hidden=logged;$('#appView').hidden=!logged;if(!logged)$('#password').focus();}
function configureUi(data){
 backend=data?.backend==='supabase'?'supabase':'github';const sb=backend==='supabase';
 $('#emailGroup').hidden=!sb;$('#email').required=sb;$('#forgotLink').hidden=!sb;$('#importBtn').hidden=!sb;
 $('#backendLabel').textContent=sb?'SUPABASE + VERCEL':'GITHUB + VERCEL';
 $('#cmsNotice').textContent=sb?'Projects and images are saved to Supabase and appear publicly without a GitHub deployment. Legacy projects can be imported once. Enquiries remain in Jotform.':'Changes are saved to GitHub and trigger a Vercel deployment. Enquiries remain in Jotform.';
}
function text(el,v){el.textContent=v;return el;}
function elt(tag,cls='',value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!=null)e.textContent=String(value);return e;}
function safeImage(path){
 if(/^assets\/uploads\/[a-zA-Z0-9_.-]+\.(png|jpg|webp)$/.test(path||''))return '/'+path;
 try{const u=new URL(path);if(u.protocol==='https:'&&/^[a-z0-9-]+\.supabase\.co$/i.test(u.hostname)&&/^\/storage\/v1\/object\/public\/portfolio-media\/uploads\/[0-9a-f-]+\.(?:webp|png|jpg)$/i.test(u.pathname)&&!u.search&&!u.hash)return u.href;}catch{}
 return null;
}
async function load(){try{const d=await api('projects');projects=d.projects||[];render();}catch(e){
 if(/sign in|unauthoriz/i.test(e.message))authView(false);
 showToast(e.message,true);
}}
function render(){const list=$('#projectList'),filter=$('#filterCategory').value;list.replaceChildren();$('#countAll').textContent=projects.length;$('#countLive').textContent=projects.filter(x=>x.published).length;$('#countDraft').textContent=projects.filter(x=>!x.published).length;const items=projects.filter(p=>!filter||p.category===filter);$('#emptyHint').hidden=items.length>0;
 for(const p of items){const row=elt('article','project-row');const img=safeImage(p.image);if(img){const pic=elt('img','thumb');pic.src=img;pic.alt='';pic.loading='lazy';row.append(pic)}else row.append(elt('div','thumb thumb-fallback','MS'));
 const middle=elt('div');middle.append(elt('div','project-name',p.title));middle.append(elt('div','project-meta',(catLabels[p.category]||'Portfolio')+' · '+(p.year||'No year')));middle.append(elt('span','status'+(p.published?' live':''),p.published?'Published':'Draft'));
 if(p.featured)middle.append(elt('span','status featured','Featured'));
 row.append(middle);
 const actions=elt('div','row-actions');const edit=elt('button','','Edit');edit.type='button';edit.addEventListener('click',()=>openEditor(p));const del=elt('button','danger','Delete');del.type='button';del.addEventListener('click',()=>removeProject(p));actions.append(edit,del);row.append(actions);list.append(row);
 }
}
function fields(){return {title:$('#pTitle').value,category:$('#pCategory').value,summary:$('#pSummary').value,description:$('#pDescription').value,year:$('#pYear').value,tags:$('#pTags').value,url:$('#pUrl').value,image:$('#pImage').value,gallery:[...gallery],featured:$('#pFeatured').checked,published:$('#pPublished').checked};}
function preview(){const cover=$('#pCoverPreview');cover.replaceChildren();const src=safeImage($('#pImage').value);if(src){const img=elt('img');img.src=src;img.alt='Cover image';cover.append(img)}const gal=$('#pGalleryPreview');gal.replaceChildren();gallery.forEach((g,i)=>{const url=safeImage(g);if(!url)return;const box=elt('div');const img=elt('img');img.src=url;img.alt='Gallery image';const btn=elt('button','','×');btn.type='button';btn.setAttribute('aria-label','Remove gallery image');btn.addEventListener('click',()=>{gallery.splice(i,1);preview()});box.append(img,btn);gal.append(box)});}
function openEditor(p){lastFocus=document.activeElement;$('#projectForm').reset();activeId=p?.id||'';gallery=[...(p?.gallery||[])];$('#editorTitle').textContent=p?'Edit project':'New project';$('#pTitle').value=p?.title||'';$('#pCategory').value=p?.category||'web-development';$('#pSummary').value=p?.summary||'';$('#pDescription').value=p?.description||'';$('#pYear').value=p?.year||'';$('#pTags').value=p?.tags||'';$('#pUrl').value=p?.url||'';$('#pImage').value=p?.image||'';$('#pPublished').checked=p?p.published===true:true;$('#pFeatured').checked=p?.featured===true;$('#pCoverFile').value='';$('#pGalleryFiles').value='';preview();$('#editor').showModal();setTimeout(()=>$('#pTitle').focus(),70);}
function closeEditor(){if(saveBusy)return showToast('Saving in progress. Please let it finish.',true);$('#editor').close();lastFocus?.focus?.();}
async function removeProject(p){if(!confirm(`Delete "${p.title}"? This removes it from your portfolio after Vercel redeploys.`))return;try{await api('delete','POST',{id:p.id});showToast(backend==='supabase'?'Project removed from Supabase.':'Project removed. Deployment will update the website.');await load();}catch(e){showToast(e.message,true);}}
async function shrink(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Please choose a JPG, PNG or WebP image.');
 if(file.size>20_000_000)throw Error('Image is too large to process. Choose a file under 20 MB.');const bitmap=await createImageBitmap(file);const max=1600;const k=Math.min(1,max/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*k));canvas.height=Math.max(1,Math.round(bitmap.height*k));const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close?.();const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.8));if(!blob||blob.size>1_900_000)throw Error('Image is too large. Choose or resize a smaller image.');return blob;}
async function upload(file){const blob=await shrink(file);const base64=await new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=reject;r.readAsDataURL(blob);});const d=await api('upload','POST',{mime:'image/webp',data:base64});return d.path;}
async function save(e){e.preventDefault();
 if(saveBusy)return;
 if(!$('#pTitle').value.trim()){$('#pTitle').focus();return showToast('Project title is required.',true)}
 const btn=$('#saveBtn');saveBusy=true;btn.disabled=true;
 $('#cancelBtn').disabled=true;$('#editorClose').disabled=true;
 try{const cover=$('#pCoverFile').files[0];if(cover){btn.textContent='Uploading cover…';$('#pImage').value=await upload(cover);}const newGallery=[...$('#pGalleryFiles').files];if(gallery.length+newGallery.length>10)throw Error('Maximum 10 gallery images.');for(let i=0;i<newGallery.length;i++){btn.textContent=`Uploading gallery ${i+1}/${newGallery.length}…`;gallery.push(await upload(newGallery[i]));}btn.textContent=backend==='supabase'?'Saving to Supabase…':'Saving to GitHub…';await api('save','POST',{id:activeId,project:fields()});saveBusy=false;closeEditor();showToast(backend==='supabase'?'Saved in Supabase. Live site updates shortly.':'Saved in GitHub. Your public site updates after Vercel redeploys.');await load();}catch(err){showToast(err.message,true);}finally{saveBusy=false;btn.disabled=false;$('#cancelBtn').disabled=false;$('#editorClose').disabled=false;btn.textContent='Save project ↗';}}
$('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const b=$('#loginBtn');b.disabled=true;$('#loginStatus').textContent='Signing in…';try{const d=await api('login','POST',{password:$('#password').value,...(backend==='supabase'?{email:$('#email').value.trim()}: {})});$('#currentEmail').textContent=d.email||'';$('#password').value='';$('#loginStatus').textContent='';authView(true);await load();}catch(err){text($('#loginStatus'),err.message);}finally{b.disabled=false;}});
$('#logoutBtn').addEventListener('click',async()=>{
 try{await api('logout','POST',{});projects=[];authView(false);}
 catch(e){showToast('Sign out failed. Check your connection and retry.',true);}
});
$('#importBtn').addEventListener('click',async()=>{
 if(backend!=='supabase'||!confirm('Import projects from the legacy GitHub content/projects.json file? Existing Supabase records will not be overwritten.'))return;
 const btn=$('#importBtn');btn.disabled=true;
 try{
  const r=await fetch('/content/projects.json',{cache:'no-store'});if(!r.ok)throw Error('Legacy JSON file was not found.');
  const d=await r.json();if(!Array.isArray(d.projects))throw Error('Legacy projects file is invalid.');
  const result=await api('import','POST',{projects:d.projects});showToast(result.message);await load();
 }catch(e){showToast(e.message,true);}finally{btn.disabled=false;}
});
$('#forgotLink').addEventListener('click',async e=>{
 e.preventDefault();const email=$('#email').value.trim();if(!email){$('#email').focus();return showToast('Enter your admin email first.',true);}
 try{const r=await api('request-reset','POST',{email});showToast(r.message);}catch(err){showToast(err.message,true);}
});
$('#addBtn').addEventListener('click',()=>openEditor());$('#reloadBtn').addEventListener('click',load);$('#filterCategory').addEventListener('change',render);$('#editorClose').addEventListener('click',closeEditor);$('#cancelBtn').addEventListener('click',closeEditor);$('#editor').addEventListener('click',e=>{if(e.target===$('#editor'))closeEditor()});$('#projectForm').addEventListener('submit',save);
(async()=>{
 try{configureUi(await api('config'));}catch(err){$('#loginStatus').textContent=err.message;}
 try{const status=await api('status');$('#currentEmail').textContent=status.email||'';authView(true);await load();}
 catch(err){authView(false);if(!/sign in|password|Please sign in|Session expired/i.test(err.message))$('#loginStatus').textContent=err.message;}
})();
