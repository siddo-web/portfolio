'use strict';
(()=>{
 const fragment=new URLSearchParams(location.hash.slice(1));
 const accessToken=fragment.get('access_token')||'';
 const type=fragment.get('type')||'';
 // Clear one-time recovery credentials immediately from browser navigation/history.
 history.replaceState(null,'',location.pathname);
 const status=document.querySelector('#message');
 if(!accessToken||type!=='recovery')status.textContent='Recovery link missing or invalid. Request a new link from the admin login page.';
 document.querySelector('#resetForm').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.currentTarget,first=document.querySelector('#newPassword').value,second=document.querySelector('#confirmPassword').value;
  if(!accessToken||type!=='recovery'){status.textContent='Recovery link missing or invalid.';return;}
  if(first!==second){status.textContent='Passwords do not match.';return;}
  if(first.length<12){status.textContent='Password must be at least 12 characters.';return;}
  const button=form.querySelector('button[type="submit"]');button.disabled=true;
  try{const r=await fetch('/api/admin?action=reset-password',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({access_token:accessToken,password:first})});
   const d=await r.json();if(!r.ok)throw Error(d.message||'Could not reset password.');status.textContent=d.message;form.reset();
  }catch(err){status.textContent=err.message;}finally{button.disabled=false;}
 });
})();
