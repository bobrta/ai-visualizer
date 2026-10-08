'use strict';
const fs=require('fs');

function read(path){return fs.readFileSync(path,'utf8');}
function assert(ok,msg){if(!ok){console.error('SECURITY CHECK FAILED:',msg);process.exit(1);}}

const firstParty=[
  'index.html','builder.js','charts.js','gate.js',
  'extensions/editor-state.js','extensions/research-studio/studio.js'
];
for(const file of firstParty){
  const s=read(file);
  assert(!/\beval\s*\(/.test(s),file+' contains eval()');
  assert(!/new\s+Function\s*\(/.test(s),file+' contains new Function()');
  assert(!/document\.write\s*\(/.test(s),file+' contains document.write()');
}

const server=read('tools/local_server.py');
for(const required of [
  '127.0.0.1',
  'Content-Security-Policy',
  'X-Content-Type-Options',
  'X-Frame-Options',
  'Referrer-Policy',
  'Permissions-Policy'
]) assert(server.includes(required),'local server missing '+required);

const offline=read('tools/offline_setup.py');
assert((offline.match(/^\s*"sha256_prefix"\s*:/gm)||[]).length===3,'all three offline assets need integrity pins');
for(const version of ['plotly-4.1.1.min.js','echarts-5.6.0.min.js','mermaid-11.4.1.min.js']){
  assert(offline.includes(version),'offline setup missing fixed version '+version);
}

assert(read('index.html').includes("value.length>2e6"),'main JSON size limit missing');
assert(read('extensions/research-studio/studio.js').includes("value.length>1e6"),'research JSON size limit missing');
const projects=read('legacy/ui-experiments/project-manager.js');
assert(projects.includes('MAX_IMPORT_BYTES=2*1024*1024'),'project import byte limit missing');
assert(projects.includes('MAX_PROJECT_ITEMS=500'),'project item limit missing');

const gate=read('gate.js');
assert(/not server-side authentication/i.test(gate),'gate must state it is not real authentication');

console.log('PASS: local security invariants.');
