'use strict';
const {ROUTES,siteUrl}=require('./seo-utils');
module.exports=function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).send('Method not allowed');}
 const origin=siteUrl(req);
 res.setHeader('Content-Type','application/xml; charset=utf-8');
 res.setHeader('Cache-Control','public, max-age=300, s-maxage=3600');
 const urls=ROUTES.map(path=>`  <url><loc>${(origin+path).replace(/&/g,'&amp;')}</loc></url>`).join('\n');
 return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`);
};
