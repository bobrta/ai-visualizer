'use strict';
const fs=require('fs');
const path=require('path');

function assert(ok,msg){if(!ok){console.error('ARCHITECTURE CHECK FAILED:',msg);process.exit(1);}}
function read(p){return fs.readFileSync(p,'utf8');}
function refs(htmlPath){
  const html=read(htmlPath),dir=path.dirname(htmlPath);
  return [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
    .map(m=>m[1].split('?')[0])
    .filter(x=>!/^https?:/.test(x))
    .map(x=>path.normalize(path.join(dir,x)));
}

for(const entry of ['index.html','guides/chart-handbook/index.html','extensions/research-studio/index.html']){
  assert(fs.existsSync(entry),entry+' missing');
  for(const ref of refs(entry)){
    assert(fs.existsSync(ref),entry+' references missing script '+ref);
    assert(!ref.startsWith('legacy'+path.sep),entry+' must not import legacy code: '+ref);
  }
}

const main=read('index.html');
for(const stale of ['simple-workbench','quick-chart-switcher','workflow-advanced','workflow-sidebar']){
  assert(!main.includes(stale),'dormant UI selector remains in active workbench: '+stale);
}

const mainRefs=new Set(refs('index.html'));
assert(mainRefs.has('extensions/executive-summary-v2.js'),'Workbench must use executive-summary-v2.js');
assert(!mainRefs.has('extensions/executive-summary.js'),'legacy executive-summary.js must remain inactive');

const researchRefs=new Set(refs('extensions/research-studio/index.html'));
for(const required of [
  'extensions/appearance.js',
  'extensions/diagram-engine.js',
  'extensions/research-studio/studio.js'
]) assert(researchRefs.has(required),'Research Studio missing '+required);

assert(fs.existsSync('legacy/ui-experiments/README.md'),'legacy archive README missing');
console.log('PASS: entry-point dependencies, legacy isolation and active UI architecture are consistent.');
