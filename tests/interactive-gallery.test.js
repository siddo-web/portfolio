'use strict';
// Dependency-free DOM exercise of the actual frontend filtering/search/pagination code.
// This is not a pixel-perfect browser test; native browser QA is still needed after deployment.
const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../cms/public.js'),'utf8');
const records=require('../content/projects.json');
function makeDom(category=''){
 class E {
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.value='';this.children=[];this.parentNode=null;this.attrs={};this.listeners={};this.className='';this.hidden=false;this._text='';this.style={};this.classList={add:(...v)=>this.className+=' '+v.join(' '),remove:()=>{}};}
  append(...nodes){for(let node of nodes){if(!node)continue;if(node.tagName==='#FRAGMENT'){for(const c of [...node.children])this.append(c);continue;}this.children.push(node);node.parentNode=this;}return this;}
  prepend(node){this.children.unshift(node);node.parentNode=this;}
  replaceChildren(...ns){this.children=[];this._text='';this.append(...ns);}
  after(node){if(!this.parentNode)throw Error('No parent');const i=this.parentNode.children.indexOf(this);this.parentNode.children.splice(i+1,0,node);node.parentNode=this.parentNode;}
  setAttribute(k,v){this.attrs[k]=v;}getAttribute(k){return this.attrs[k];}
  addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
  click(){for(const f of this.listeners.click||[])f({target:this});}
  querySelectorAll(selector){if(selector==='button'){const out=[];const walk=e=>{for(const c of e.children){if(c.tagName==='BUTTON')out.push(c);walk(c);}};walk(this);return out;}return [];}
  focus(){}close(){}showModal(){}
  get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
  set textContent(v){this._text=String(v);this.children=[];}
  all(cls){const result=[];const walk=node=>{for(const c of node.children){if(cls.startsWith('.')&&c.className.split(' ').includes(cls.slice(1)))result.push(c);if(cls.startsWith('#')&&c.id===cls.slice(1))result.push(c);walk(c);}};walk(this);return result;}
 }
 const body=new E('body'),head=new E('head'),main=new E('main'),expertise=new E('section'),intro=new E('section');
 expertise.id='expertise';main.append(expertise,intro);body.append(main);
 const document={currentScript:{dataset:{category},src:'https://portfolio.test/cms/public.js'},head,body,
  createElement:tag=>new E(tag),createTextNode:text=>{const el=new E('#text');el.textContent=text;return el;},
  createDocumentFragment:()=>new E('#fragment'),getElementById:id=>id==='expertise'?expertise:null,
  querySelector:q=>q==='main .intro'?intro:q==='main'?main:null};
 const calls=[];
 const context={document,URL,matchMedia:()=>({matches:true}),fetch:async u=>{calls.push(String(u));return {ok:true,json:async()=>records}}};
 vm.runInNewContext(source,context,{filename:'cms/public.js',timeout:1500});
 return {body,main,calls};
}
const tick=()=>new Promise(r=>setImmediate(r));
test('homepage platform tabs, project search, and limited initial render function',async()=>{
 const {body,calls}=makeDom();await tick();await tick();
 assert(calls[0].endsWith('/api/projects'));
 let cards=()=>body.all('.ms-cms-card');let filters=body.all('.ms-cms-filters')[0];
 assert.equal(cards().length,9);
 assert.equal(filters.children.length,6);
 const count=body.all('.ms-cms-count')[0];assert.equal(count.textContent,'17 websites');
 filters.children.find(x=>x.textContent==='Shopify Development').click();
 assert.equal(count.textContent,'1 website in Shopify Development');assert.equal(cards().length,1);
 assert.equal(cards()[0].all('.ms-cms-cat')[0].textContent,'Shopify Development');
 filters.children.find(x=>x.textContent==='All websites').click();
 const input=body.all('.ms-cms-search')[0].children.find(x=>x.tagName==='INPUT');
 input.value='SXS Parts USA';for(const f of input.listeners.input||[])f();
 assert.equal(cards().length,1);assert.equal(cards()[0].all('.ms-cms-title')[0].textContent,'SXS Parts USA');
});
test('each service page displays only its own websites; components are labelled distinctly',async()=>{
 const counts={wordpress:[8,6],shopify:[1,6],webflow:[3,0],wix:[1,0],'other-cms':[4,4]};
 for(const [cat,[sites,components]] of Object.entries(counts)){
  const {body}=makeDom(cat);await tick();await tick();
  assert.equal(body.all('.ms-cms-card').length,sites,cat+' websites');
  assert.equal(body.all('.ms-cms-component').length,components,cat+' components');
  assert.equal(body.all('.ms-cms-filters')[0].hidden,true);
  assert(body.all('.ms-cms-cat').every(x=>[({wordpress:'WordPress Development',shopify:'Shopify Development',webflow:'Webflow Development',wix:'Wix Development','other-cms':'Other CMS & Integrations'})[cat],'Personal project'].includes(x.textContent)));
 }
});
test('platform-unconfirmed archive is isolated and paginates rather than loading 35 screenshots immediately',async()=>{
 const {body}=makeDom('unverified');await tick();await tick();
 assert.equal(body.all('.ms-cms-count')[0].textContent,'35 websites in Platform to verify');
 assert.equal(body.all('.ms-cms-card').length,9);
 assert(body.all('.ms-cms-cat').every(x=>x.textContent==='Platform unconfirmed'));
 body.all('.ms-cms-more')[0].click();assert.equal(body.all('.ms-cms-card').length,18);
});
