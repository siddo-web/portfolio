'use strict';
const ROUTES=['/','/webdev_portfolio/','/UIUX_portfolio/','/graphic/','/appdev_portfolio/','/digital-marketing/','/explorer.html','/privacy.html'];
function siteUrl(req){
  const configured=String(process.env.SITE_URL||'').trim();
  if(configured){try{const u=new URL(configured);if(u.protocol==='https:'||u.hostname==='localhost')return u.origin;}catch{}}
  // Canonical domain should be set using SITE_URL; fallback is useful in previews.
  const host=String(req.headers?.host||'').toLowerCase();
  if(!/^[a-z0-9.-]+(?::\d{1,5})?$/.test(host))return 'https://example.invalid';
  const proto=/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)?'http:':'https:';
  return proto+'//'+host;
}
module.exports={ROUTES,siteUrl};
