'use strict';
const s=require('../lib/supabase');
module.exports=async function handler(req,res){
 res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({ok:false,message:'GET only'});}
 try{
  if(process.env.CMS_BACKEND==='supabase'){
   if(!s.configured()){res.setHeader('Cache-Control','no-store');return res.status(503).json({ok:false,message:'Portfolio temporarily unavailable.'});}
   const projects=await s.rows(false,'published=eq.true&order=featured.desc,created_at.desc');
   res.setHeader('Cache-Control','public, max-age=0, s-maxage=15, stale-while-revalidate=30');
   return res.json({ok:true,projects});
  }
  // Phase 1 fallback: preserve existing GitHub-backed content and public homepage.
  const legacy=require('../content/projects.json');
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=30');
  return res.json({ok:true,projects:(Array.isArray(legacy.projects)?legacy.projects:[]).filter(p=>p.published===true)});
 }catch(e){console.error('Public projects error:',e.message);res.setHeader('Cache-Control','no-store');return res.status(502).json({ok:false,message:'Portfolio projects temporarily unavailable.'});}
};
