const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('original layered interactive card and independent bounded loader are restored',()=>{
 for(const x of ['hc__bg','hc__sub','hc__plate','hc__foil','hc__sheen','hc__glare','hc__back-panel','startCardLoader(cycle)','updateProgress(100)','setTimeout(resolve, 4200)','muhammad-siddique-card.webp'])assert(html.includes(x),x);
 assert(!html.includes('class="hc__reference"'));
 assert(!html.includes("const SRC = 'ability-card/'"));
});
test('all original 3D layered artwork loads from local files',()=>{
 for(const f of ['muhammad-siddique-card.webp','4c7752569d-win_bg.webp','970419499e-win_sub.webp'])assert(fs.existsSync(path.join(root,'assets/images',f)),f);
});
test('tilt, flip, Escape, close and scroll unlock remain functional code paths',()=>{
 for(const token of ["hc.classList.toggle('flip')", "hc.style.setProperty('--ry'",'holoClose',"e.key === 'Escape'",'startScroll();','FOCUSABLE'])assert(html.includes(token),token);
});
