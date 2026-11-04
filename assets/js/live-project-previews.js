/* Portfolio homepage previews: live screenshots for project URLs not yet supplied by the owner.
   If the screenshot provider is unreachable, the labelled local placeholder stays visible. */
(()=>{
  function activate(img){
    const remote=img.getAttribute('data-live-shot');
    const fallback=img.getAttribute('data-fallback')||img.getAttribute('src');
    if(!remote || !/^https:\/\/image\.thum\.io\//.test(remote))return;
    const probe=new Image();
    probe.onload=()=>{if(probe.naturalWidth>10 && probe.naturalHeight>10){img.src=remote;img.dataset.previewState='live';}};
    probe.onerror=()=>{img.src=fallback;img.dataset.previewState='fallback';};
    probe.src=remote;
  }
  function run(){
    const imgs=[...document.querySelectorAll('img[data-live-shot]')].filter(img=>img.getAttribute('data-live-shot'));
    if(!('IntersectionObserver' in window)){imgs.forEach(activate);return;}
    const obs=new IntersectionObserver((entries,observer)=>{for(const e of entries){if(!e.isIntersecting)continue;observer.unobserve(e.target);activate(e.target);}}, {rootMargin:'480px 0px'});
    imgs.forEach(img=>obs.observe(img));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
