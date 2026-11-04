'use strict';
// Retired login/CMS endpoint. No authentication, password or GitHub write functionality.
// Keeping this tiny tombstone overwrites any previously deployed admin API during an in-place upgrade.
module.exports = function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('X-Robots-Tag','noindex, nofollow');
  res.setHeader('Allow','GET, POST');
  return res.status(410).json({ok:false,message:'The admin dashboard and editing API have been permanently disabled.'});
};
