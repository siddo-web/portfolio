'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const projects=require('../content/projects.json').projects.filter(p=>p.published===true);
const publicJs=fs.readFileSync(path.join(root,'cms/public.js'),'utf8');
const allowed=/^(?:assets\/uploads\/[a-zA-Z0-9_.-]+|assets\/images\/project-screenshots\/(?:placeholders\/)?[a-zA-Z0-9_.-]+)\.(?:jpe?g|png|webp)$/i;
test('all Selected Work projects have a safe local screenshot path',()=>{
  assert.equal(projects.length,30);
  for(const p of projects){
    assert.match(p.image,allowed,`Invalid image path for ${p.title}`);
    const file=path.join(root,p.image);
    assert(fs.existsSync(file),`Missing image for ${p.title}: ${p.image}`);
    const buf=fs.readFileSync(file);
    assert(buf.length>500,`Empty image for ${p.title}`);
    if(file.endsWith('.webp')) {
      assert.equal(buf.toString('ascii',0,4),'RIFF',`Broken WEBP header: ${file}`);
      assert.equal(buf.toString('ascii',8,12),'WEBP',`Broken WEBP header: ${file}`);
    }
  }
});
test('CMS renderer allows local project media and falls back to named preview if an image fails',()=>{
  assert(publicJs.includes('assets\\/images\\/project-screenshots'));
  assert(publicJs.includes('placeholderImage(title)'));
  assert(publicJs.includes("assignImage(image,p.image,p.title)"));
  assert(publicJs.includes("assignImage(hero,p.image,p.title)"));
  assert(publicJs.includes('api/projects'));
  assert(!publicJs.includes("'content/projects.json'"));
});
