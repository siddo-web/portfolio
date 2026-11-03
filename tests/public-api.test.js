'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {visibleProjects}=require('../api/projects');
const publicApi=require('../api/projects');
const {ROUTES,siteUrl}=require('../api/seo-utils');
const sitemap=require('../api/sitemap');
const robots=require('../api/robots');
function res(){return {code:200,headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},status(n){this.code=n;return this;},json(v){this.data=v;return this;},send(v){this.data=v;return this;}};}
test('drafts are excluded from the public CMS API',()=>{
 const list=visibleProjects({projects:[{title:'Draft',published:false,category:'web-development'},{title:'Live',published:true,category:'web-development',featured:false},{title:'Featured',published:true,category:'web-development',featured:true},{title:'Invalid',published:true,category:'other'}]});
 assert.deepEqual(list.map(x=>x.title),['Featured','Live']);
 assert.equal(list[0].featured,true);
});
test('shipped demo project is kept as an unpublished draft',()=>{
 const list=require('../content/projects.json').projects;
 assert.equal(list.length,1);assert.equal(list[0].published,false);assert.equal(visibleProjects({projects:list}).length,0);
});
test('public GET responds without drafts; other methods rejected',()=>{
 const out=res();publicApi({method:'GET'},out);assert.equal(out.code,200);assert.equal(out.data.ok,true);assert.equal(out.data.projects.length,0);
 const denied=res();publicApi({method:'POST'},denied);assert.equal(denied.code,405);
});
test('sitemap and robots routes only expose real public pages',()=>{
 assert.equal(ROUTES.length,8);assert(!ROUTES.some(x=>x.includes('admin')));
 const req={method:'GET',headers:{host:'portfolio.example.com'}};const map=res();sitemap(req,map);
 assert.equal(map.code,200);assert.match(map.data,/https:\/\/portfolio\.example\.com\/graphic\//);
 const bot=res();robots(req,bot);assert.match(bot.data,/Disallow: \/admin\//);assert.match(bot.data,/sitemap\.xml/);
 assert.equal(siteUrl({headers:{host:'bad<script>'}}),'https://example.invalid');
});
