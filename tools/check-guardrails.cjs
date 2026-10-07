const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console};ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'extensions/chart-guardrails.js'),'utf8'),ctx);
const G=ctx.VCChartGuardrails;
assert(G&&G.VERSION==='1.0','guardrail engine exposed');

let r=G.analyze({type:'bar',title:'季度營收',x:['Q1','Q2','Q3','Q4'],y:[10,12,15,18]},{mode:'business'});
assert.equal(r.blocking,false);assert.equal(r.score,100);

r=G.analyze({type:'bar',title:'很多分類',x:Array.from({length:15},(_,i)=>'分類'+i),y:Array(15).fill(1)},{mode:'business'});
assert(r.issues.some(x=>x.code==='many-categories'),'business bar warns at 15 categories');
const research=G.analyze({type:'bar',title:'很多分類',x:Array.from({length:15},(_,i)=>'分類'+i),y:Array(15).fill(1)},{mode:'research'});
assert(!research.issues.some(x=>x.code==='many-categories'),'research threshold is looser');

r=G.analyze({type:'pie',title:'分類',labels:Array.from({length:10},(_,i)=>'L'+i),values:Array(10).fill(1)},{mode:'business'});
assert(r.issues.some(x=>x.code==='pie-many-slices'));assert(r.alternatives.includes('bar'));

r=G.analyze({type:'parallel',title:'二維',dimensions:[{label:'A',values:[1,2,3,4]},{label:'B',values:[4,3,2,1]}]},{mode:'business'});
assert.equal(r.blocking,false);assert(r.issues.some(x=>x.code==='parallel-two-dimensions'));assert(r.alternatives.includes('scatter'));

r=G.analyze({type:'radar',title:'不足',theta:['A','B'],r:[1,2]},{mode:'business'});
assert.equal(r.blocking,true);assert(r.issues.some(x=>x.code==='radar-too-few-axes'));

r=G.analyze({type:'scatter3d',title:'少量3D',x:[1,2,3,4],y:[2,4,3,5],z:[3,1,4,2]},{mode:'business'});
assert.equal(r.blocking,false);assert(r.issues.some(x=>x.code==='3d-few-points'));assert(r.alternatives.includes('scatter'));

r=G.analyze({type:'sankey',title:'過大流程',labels:Array.from({length:60},(_,i)=>'N'+i),source:[0],target:[1],values:[1]},{mode:'business'});
assert.equal(r.blocking,true);assert(r.issues.some(x=>x.code==='sankey-overload'));

r=G.analyze({type:'table',title:'大表',headers:Array.from({length:21},(_,i)=>'H'+i),rows:[Array(21).fill('x')]},{mode:'business'});
assert.equal(r.blocking,true);assert(r.issues.some(x=>x.code==='table-overload'));

console.log('PASS: chart guardrails score, mode thresholds, warnings, blockers and alternatives.');