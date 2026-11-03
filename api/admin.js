/* GitHub-backed portfolio CMS for Vercel Node.js Functions.
 * Required Vercel env: GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN,
 * ADMIN_PASSWORD, SESSION_SECRET; optional GITHUB_BRANCH (main).
 * Password and GitHub token never enter public HTML/JS.
 */
const crypto = require('node:crypto');
const COOKIE = 'ms_portfolio_session';
const EXPIRES_MS = 8 * 60 * 60 * 1000;
const LOGIN_MAX = 6;
const attempts = new Map(); // Per-instance best effort only; use Vercel Firewall for durable rate limits.
const cat = new Set(['web-development','web-design','design-brand','app-development','digital-marketing']);
function envReady(){ return ['GITHUB_OWNER','GITHUB_REPO','GITHUB_TOKEN','ADMIN_PASSWORD','SESSION_SECRET'].every(k => (process.env[k] || '').trim()) && process.env.ADMIN_PASSWORD.length >= 12 && process.env.SESSION_SECRET.length >= 32; }
function reject(res,status,message){return res.status(status).json({ok:false,message});}
function b64url(b){return Buffer.from(b).toString('base64url');}
function sign(value){return crypto.createHmac('sha256',process.env.SESSION_SECRET).update(value).digest('base64url');}
function cookieHeaders(req,value,maxAge){const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(req.headers.host||'');return `${COOKIE}=${value}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; ${isLocal?'':'Secure; '}Priority=High`;}
function validSession(req){const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!raw)return false;const parts=raw.split('.');if(parts.length!==2)return false;const payload=parts[0], mac=parts[1];if(!/^[\w-]+$/.test(payload)||!/^[\w-]+$/.test(mac))return false;const sig=sign(payload);if(mac.length!==sig.length||!crypto.timingSafeEqual(Buffer.from(mac),Buffer.from(sig)))return false;try{const obj=JSON.parse(Buffer.from(payload,'base64url').toString());return obj.role==='admin' && obj.exp>Date.now() && obj.exp<Date.now()+EXPIRES_MS+60000;}catch{return false;}}
function setSession(req,res){const payload=b64url(JSON.stringify({role:'admin',exp:Date.now()+EXPIRES_MS}));res.setHeader('Set-Cookie',cookieHeaders(req,payload+'.'+sign(payload),Math.round(EXPIRES_MS/1000)));}
function sameOrigin(req){const origin=req.headers.origin;const host=req.headers['x-forwarded-host']||req.headers.host;if(!origin||!host)return false;try{return new URL(origin).host.toLowerCase()===host.toLowerCase() && ['https:','http:'].includes(new URL(origin).protocol);}catch{return false;}}
function input(req){let o=req.body;if(typeof o==='string'){try{o=JSON.parse(o)}catch{return {}}}return o&&typeof o==='object'&&!Array.isArray(o)?o:{};}
function gUrl(file,includeRef=true){const owner=encodeURIComponent(process.env.GITHUB_OWNER),repo=encodeURIComponent(process.env.GITHUB_REPO);return `https://api.github.com/repos/${owner}/${repo}/contents/${file.split('/').map(encodeURIComponent).join('/')}${includeRef?'?ref='+encodeURIComponent(process.env.GITHUB_BRANCH||'main'):''}`;}
async function github(file,options={}){
 const opts={method:options.method||'GET',headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${process.env.GITHUB_TOKEN}`,'X-GitHub-Api-Version':'2022-11-28','User-Agent':'Muhammad-Siddique-CMS'},signal:AbortSignal.timeout(12500)};
 if(options.json){opts.headers['Content-Type']='application/json';opts.body=JSON.stringify(options.json)}
 const r=await fetch(gUrl(file,opts.method==='GET'),opts);let o={};try{o=await r.json()}catch{}
 if(!r.ok){const e=new Error(r.status===404?'Repository file not found (check GitHub env settings and branch).':(o.message||'GitHub API returned '+r.status));e.status=r.status;throw e;}return o;
}
async function readProjects(){try{const r=await github('content/projects.json');const content=Buffer.from((r.content||'').replace(/\s/g,''),'base64').toString('utf8');const d=JSON.parse(content);return {projects:Array.isArray(d.projects)?d.projects:[],sha:r.sha};}catch(e){if(e.status===404)return{projects:[],sha:null};throw e;}}
async function writeProjects(projects,sha){const body={message:'CMS: update portfolio projects',branch:process.env.GITHUB_BRANCH||'main',content:Buffer.from(JSON.stringify({projects},null,2)+'\n').toString('base64')};if(sha)body.sha=sha;await github('content/projects.json',{method:'PUT',json:body});}
function valStr(x,max=240){return typeof x==='string'?x.trim().slice(0,max):'';}
function imgPath(s){return /^assets\/uploads\/[a-zA-Z0-9_.-]+\.(webp|png|jpg)$/.test(s||'')?s:'';}
function sanitize(p,prev){if(!p||typeof p!=='object')throw new Error('Project details missing.');const title=valStr(p.title,130),category=valStr(p.category,50);if(!title||!cat.has(category))throw new Error('Project title and a valid category are required.');const u=valStr(p.url,500);if(u){let parsed;try{parsed=new URL(u)}catch{throw new Error('Enter a complete https:// project URL.')}if(!['https:','http:'].includes(parsed.protocol))throw new Error('Only http and https project URLs are supported.')}
 return {id:prev?.id||crypto.randomUUID(),title,category,year:valStr(p.year,25),tags:valStr(p.tags,220),summary:valStr(p.summary,600),description:valStr(p.description,8000),url:u,image:imgPath(p.image),gallery:Array.isArray(p.gallery)?p.gallery.slice(0,10).map(imgPath).filter(Boolean):[],featured:p.featured===true,published:p.published===true,createdAt:prev?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};}
module.exports=async function handler(req,res){
 res.setHeader('Cache-Control','private, no-store, max-age=0');res.setHeader('X-Content-Type-Options','nosniff');
 if(!envReady())return reject(res,503,'CMS is not configured. Set the required Vercel environment variables.');
 const method=req.method;const action=String(req.query?.action||'status');
 if(!['GET','POST'].includes(method))return reject(res,405,'Method not allowed.');
 if(method==='POST'&&!sameOrigin(req))return reject(res,403,'Same-origin request required.');
 try{
   if(method==='POST'&&action==='login'){
    const ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].trim().slice(0,90);
    const now=Date.now();const a=attempts.get(ip)||{n:0,until:now+600000};if(now>a.until){a.n=0;a.until=now+600000;}if(a.n>=LOGIN_MAX)return reject(res,429,'Too many attempts. Please try again later.');
    const candidate=String(input(req).password||'');const correct=process.env.ADMIN_PASSWORD;
    // Comparing hashed values with constant-time primitives avoids timing leaks.
    const x=crypto.createHash('sha256').update(candidate).digest(),y=crypto.createHash('sha256').update(correct).digest();
    if(!crypto.timingSafeEqual(x,y)){a.n++;attempts.set(ip,a);return reject(res,401,'Incorrect password.');}
    attempts.delete(ip);setSession(req,res);return res.json({ok:true});
   }
   if(method==='POST'&&action==='logout'){res.setHeader('Set-Cookie',cookieHeaders(req,'',0));return res.json({ok:true});}
   if(!validSession(req))return reject(res,401,'Please sign in to the CMS.');
   if(method==='GET'&&action==='status')return res.json({ok:true,authenticated:true});
   if(method==='GET'&&action==='projects'){const d=await readProjects();return res.json({ok:true,projects:d.projects});}
   if(method==='POST'&&action==='save'){
    const d=input(req);const rec=await readProjects();const id=valStr(d.id,80);let i=id?rec.projects.findIndex(p=>p.id===id):-1;
    if(id&&i<0)return reject(res,404,'Project not found.');if(i<0&&rec.projects.length>=150)return reject(res,400,'Maximum 150 projects reached.');
    const p=sanitize(d.project,i>=0?rec.projects[i]:null);
    if(i>=0)rec.projects[i]=p;else rec.projects.unshift(p);
    await writeProjects(rec.projects,rec.sha);return res.json({ok:true,project:p,message:'Saved to GitHub. Vercel will deploy the new version automatically.'});
   }
   if(method==='POST'&&action==='delete'){
    const id=valStr(input(req).id,80);const rec=await readProjects();const filtered=rec.projects.filter(p=>p.id!==id);
    if(rec.projects.length===filtered.length)return reject(res,404,'Project not found.');await writeProjects(filtered,rec.sha);return res.json({ok:true});
   }
   if(method==='POST'&&action==='upload'){
    const b=input(req);const mime=valStr(b.mime,40),content=typeof b.data==='string'?b.data:'';
    if(content.length>2_800_000)return reject(res,413,'Image too large. Compress to under 2 MB.');
    if(!['image/webp','image/png','image/jpeg'].includes(mime)||!content||!/^[A-Za-z0-9+/]+={0,2}$/.test(content))return reject(res,400,'Invalid image.');
    const bytes=Buffer.from(content,'base64');if(bytes.length>2_000_000||bytes.length<150)return reject(res,400,'Image must be smaller than 2 MB.');
    const valid=mime==='image/png'?bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==='image/jpeg'?(bytes[0]===255&&bytes[1]===216&&bytes[2]===255):bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';
    if(!valid)return reject(res,400,'File content does not match its image type.');
    const ext={'image/webp':'webp','image/jpeg':'jpg','image/png':'png'}[mime];
    const path=`assets/uploads/${Date.now()}-${crypto.randomBytes(8).toString('hex')}.${ext}`;
    await github(path,{method:'PUT',json:{message:'CMS: upload portfolio image',branch:process.env.GITHUB_BRANCH||'main',content:bytes.toString('base64')}});
    return res.json({ok:true,path,message:'Image committed to GitHub. It will be visible after Vercel deploys.'});
   }
   return reject(res,404,'Unknown CMS action.');
 }catch(e){console.error('Portfolio CMS:',e.message);if(e.status===409)return reject(res,409,'GitHub content changed; reload and retry.');return reject(res,500,e.message||'Unexpected CMS error.');}
};
