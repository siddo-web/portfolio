'use strict';
/** Public CMS endpoint. Never returns drafts even when project JSON contains them. */
const data = require('../content/projects.json');
const categories = new Set(["wordpress", "shopify", "webflow", "wix", "other-cms", "wordpress-development", "shopify-development", "webflow-wix-development", "cms-migration-integration", "cms-support-optimization", "web-development", "web-design", "design-brand", "app-development", "digital-marketing", "unverified"]);
function visibleProjects(source) {
  const list = Array.isArray(source?.projects) ? source.projects : [];
  return list.filter(p => p && p.published === true && categories.has(p.category))
    .map(({id,title,category,year,tags,summary,description,url,image,gallery,featured,replaceLegacy,updatedAt,kind,verification}) => ({
      id,title,category,year,tags,summary,description,url,image,kind,verification,published:true,
      gallery:Array.isArray(gallery)?gallery:[],featured:featured===true,
      replaceLegacy:replaceLegacy===true,updatedAt
    }))
    .sort((a,b) => Number(b.featured)-Number(a.featured) || String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
}
module.exports = function handler(req,res) {
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=3600');
  if(req.method!=='GET') {res.setHeader('Allow','GET');return res.status(405).json({ok:false,message:'Method not allowed'});}
  return res.status(200).json({ok:true,projects:visibleProjects(data)});
};
module.exports.visibleProjects=visibleProjects;
