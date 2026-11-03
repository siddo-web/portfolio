'use strict';
const {siteUrl}=require('./seo-utils');
module.exports=function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed');}
 res.setHeader('Content-Type','text/plain; charset=utf-8');
 res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600');
 return res.status(200).send('User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /content/\nSitemap: '+siteUrl(req)+'/sitemap.xml\n');
};
