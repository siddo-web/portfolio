/** Optional one-time SEO metadata finalization after a custom domain is known.
 * SITE_URL=https://portfolio.example.com node scripts/set-site-url.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
const input=process.env.SITE_URL||'';
let base;try{base=new URL(input);}catch{console.error('Set SITE_URL to an absolute HTTPS URL.');process.exit(1);}
if(base.protocol!=='https:'||base.pathname!=='/'||base.search||base.hash){console.error('SITE_URL must be an HTTPS origin, e.g. https://portfolio.example.com');process.exit(1);}
const pages={
 'index.html':'/',
 'webdev_portfolio/index.html':'/webdev_portfolio/',
 'UIUX_portfolio/index.html':'/UIUX_portfolio/',
 'graphic/index.html':'/graphic/',
 'appdev_portfolio/index.html':'/appdev_portfolio/',
 'digital-marketing/index.html':'/digital-marketing/',
 'services/wordpress-development/index.html':'/services/wordpress-development/',
 'services/shopify-development/index.html':'/services/shopify-development/',
 'services/webflow-wix-development/index.html':'/services/webflow-wix-development/',
 'services/cms-migration-integration/index.html':'/services/cms-migration-integration/',
 'services/cms-support-optimization/index.html':'/services/cms-support-optimization/',
 'explorer.html':'/explorer.html',
 'privacy.html':'/privacy.html'
};
const root=path.resolve(import.meta.dirname,'..');
for(const [file,route] of Object.entries(pages)){
 const p=path.join(root,file),origin=base.origin,full=origin+route;
 let s=fs.readFileSync(p,'utf8');
 s=s.replace(/<link rel="canonical" href="[^"]*">/,'<link rel="canonical" href="'+full+'">');
 if(s.includes('property="og:url"'))s=s.replace(/<meta property="og:url" content="[^"]*">/,'<meta property="og:url" content="'+full+'">');
 else s=s.replace('</title>','</title>\n<meta property="og:url" content="'+full+'">');
 s=s.replace(/(<meta property="og:image" content=")(?!https?:\/\/)([^"<>]+)("\s*\/?>)/g,(_,a,img,c)=>a+new URL(img,full).href+c);
 if(!s.includes('property="og:image"')){
  s=s.replace('</title>','</title>\n<meta property="og:image" content="'+origin+'/assets/images/muhammad-siddique-og.jpg">');
 }
 fs.writeFileSync(p,s);
}
console.log('Updated canonical and Open Graph URLs for',base.origin);
