const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const store=new Map();
const ctx={console,structuredClone,Intl,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))}};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js','extensions/auto-insight.js','extensions/annotation-layout.js','extensions/accessibility.js','extensions/emphasis.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const E=ctx.VCEmphasis;assert(E&&E.VERSION==='1.0','Emphasis engine exposed');

store.set('visual-canvas-work-mode-v1','business');
let d={type:'line',title:'多系列',series:[
{name:'平穩',x:['Q1','Q2','Q3','Q4'],y:[10,11,12,13]},
{name:'成長',x:['Q1','Q2','Q3','Q4'],y:[5,12,24,40]},
{name:'小幅',x:['Q1','Q2','Q3','Q4'],y:[20,19,21,20]},
{name:'波動',x:['Q1','Q2','Q3','Q4'],y:[30,24,34,28]}
]};
let c=ctx.chartConfig(d);
assert(c.emphasis.focus.some(x=>x.kind==='series'&&x.name==='成長'),'largest-change line becomes focus');
const focused=c.traces.find(t=>t.name==='成長'),background=c.traces.find(t=>t.name==='平穩');
assert(focused.line.width>background.line.width,'focused line is thicker');
assert(focused.opacity>background.opacity,'focused line has higher opacity');

store.set('visual-canvas-work-mode-v1','research');
c=ctx.chartConfig(d);
const researchBg=c.traces.find(t=>t.name==='平穩');
assert(researchBg.opacity>=.7,'research mode keeps secondary series visible');

store.set('visual-canvas-work-mode-v1','business');
d={...d,focus_series:'平穩'};
c=ctx.chartConfig(d);
assert(c.emphasis.focus.some(x=>x.kind==='series'&&x.name==='平穩'),'focus_series overrides automatic focus');

d={type:'bar',title:'營收',x:['A','B','C','D'],y:[10,28,17,12]};
c=ctx.chartConfig(d);
assert(c.emphasis.focus.some(x=>x.kind==='category'&&x.index===1),'bar highlights maximum');
assert(Array.isArray(c.traces[0].marker.color),'single bar gets per-category colors');
assert.notEqual(c.traces[0].marker.color[1],c.traces[0].marker.color[0],'highlight color differs from background category');

d={type:'bar',title:'人工焦點',x:['A','B','C'],y:[10,28,17],focus_category:'C'};
c=ctx.chartConfig(d);
assert(c.emphasis.focus.some(x=>x.kind==='category'&&x.label==='C'),'focus_category is honored');

d={type:'pie',title:'占比',labels:['甲','乙','丙'],values:[20,65,15]};
c=ctx.chartConfig(d);
const pie=c.traces.find(t=>t.type==='pie');
assert(pie.pull[1]>0&&pie.pull[0]===0,'largest pie slice is pulled');
assert(c.emphasis.focus.some(x=>x.kind==='slice'&&x.index===1),'pie focus metadata');

ctx.VCStyle.set({theme:'mono'});
d={type:'line',title:'黑白多系列',series:[
{name:'A',x:['1','2','3'],y:[1,2,3]},
{name:'B',x:['1','2','3'],y:[2,8,4]},
{name:'C',x:['1','2','3'],y:[4,4,5]}
]};
c=ctx.chartConfig(d);
assert(c.traces.filter(t=>t.type==='scatter').every(t=>t.opacity>=.58),'mono secondary lines retain readable opacity');
assert(new Set(c.traces.map(t=>t.line.dash)).size>=3,'mono dash redundancy remains after emphasis');

ctx.VCStyle.set({theme:'executive'});
assert(E.seriesScore({y:[1,10,2]})>E.seriesScore({y:[1,2,3]}),'series score responds to stronger movement');
assert.equal(E.maxIndex([1,9,3]),1);assert.equal(E.minIndex([1,-4,3]),1);
console.log('PASS: presentation emphasis hierarchy, focus overrides, research restraint and mono readability.');
