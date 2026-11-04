'use strict';
const ROUTES=["/", "/wordpress/", "/shopify/", "/webflow/", "/wix/", "/other-cms/", "/selected-sites/", "/explorer.html", "/privacy.html"];
function siteUrl(req){
  const configured=String(process.env.SITE_URL||'').trim();
  if(configured){try{const u=new URL(configured);if(u.protocol==='https:'||u.hostname==='localhost')return u.origin;}catch{}}
  // Never trust a caller-controlled Host header when generating canonical links.
  return 'https://siddique-profile.vercel.app';
}
module.exports={ROUTES,siteUrl};
