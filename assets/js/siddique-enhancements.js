/* Additional homepage sections only. The original site's UI systems are untouched. */
(() => {
  document.documentElement.classList.add('ms-js');
  const blocks = document.querySelectorAll('.ms-about__copy,.ms-about__note,.ms-service,.ms-faq__wrap>*');
  if (!('IntersectionObserver' in window)) {blocks.forEach(x=>x.classList.add('ms-visible'));return;}
  const observer = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('ms-visible'); observer.unobserve(e.target);
  }), {threshold:.07,rootMargin:'0px 0px -25px 0px'});
  blocks.forEach(x=>observer.observe(x));
  // Source clock is device-local; force the display to represent the stated city.
  const tickKarachi = () => {
    const now = new Date();
    const time = new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Karachi',hour:'numeric',minute:'2-digit',hour12:true}).format(now).replace(' ','').toLowerCase();
    const date = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',day:'numeric',month:'long',year:'numeric'}).format(now);
    const short = new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Karachi',day:'numeric',month:'short'}).format(now);
    document.querySelectorAll('[data-time],[data-ftime]').forEach(x=>x.textContent=time);
    document.querySelectorAll('[data-date]').forEach(x=>x.textContent=date);
    document.querySelectorAll('[data-dshort]').forEach(x=>x.textContent=short);
  };
  tickKarachi();setInterval(tickKarachi,20000);
})();
