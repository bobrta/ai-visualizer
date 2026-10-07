const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console,structuredClone,Intl};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js','extensions/auto-insight.js','extensions/annotation-layout.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const A=ctx.VCAnnotationLayout;assert(A&&A.VERSION==='1.0','Annotation Layout exposed');

let d={type:'bar',title:'營收',x:['A','B','C'],y:[10,25,15]};
let c=ctx.chartConfig(d);
assert(c.annotationLayout.placed>=1,'bar insight annotation placed');
assert.equal(c.annotationLayout.fallbacks.length,0,'bar annotation should fit');
const ann=(c.layout.annotations||[]).find(x=>String(x.text).includes('最高'));
assert(ann&&Number.isFinite(ann.ax)&&Number.isFinite(ann.ay),'bar annotation has computed offset');
assert(!(ann.ax===0&&ann.ay===-42),'bar annotation is no longer hard-coded default');

const topPoint={x:'B',y:25,text:'top',font:{size:11},__data:d};
const topNorm=A.pointNorm(d,topPoint);
assert(topNorm.y>.9,'top point normalization');
const topCandidates=A.candidates(topNorm);
assert(topCandidates[0].ay>0,'top point prefers downward annotation');

const rightLayout={legend:{orientation:'v',x:1.02}};
const zones=A.reserved(rightLayout);
assert(zones.some(z=>z.name==='legend'),'right legend creates reserved zone');

const a={left:10,right:60,top:10,bottom:40},b={left:50,right:100,top:20,bottom:50},far={left:200,right:250,top:200,bottom:230};
assert(A.overlap(a,b),'overlap detects collision');
assert(!A.overlap(a,far),'overlap rejects distant boxes');

const synthetic=[
 {x:'B',y:25,text:'first',font:{size:11}},
 {x:'B',y:25,text:'second',font:{size:11}}
];
const placed=A.place(d,{},synthetic);
assert(placed.annotations.length===2,'two annotations can both be placed');
assert(!(placed.annotations[0].ax===placed.annotations[1].ax&&placed.annotations[0].ay===placed.annotations[1].ay),'colliding annotations choose different positions');

d={type:'waterfall',title:'損益',labels:['營收','成本','效率'],values:[120,-55,20],measure:['relative','relative','relative']};
c=ctx.chartConfig(d);
assert(c.annotationLayout.placed===2,'waterfall places two annotations');
assert.equal((c.layout.annotations||[]).length,2,'waterfall keeps two annotations');

const impossible={type:'bar',x:['A'],y:[1]};
const blockedLayout={legend:{orientation:'v',x:1.02}};
const many=Array.from({length:12},(_,i)=>({x:'A',y:1,text:'very long annotation '+i,font:{size:22}}));
const p=A.place(impossible,blockedLayout,many);
assert(p.fallbacks.length>0,'overcrowded annotation set falls back instead of forcing all labels');

console.log('PASS: annotation placement avoids title/legend/collisions and supports fallback.');