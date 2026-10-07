const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const store=new Map([['visual-canvas-work-mode-v1','business']]);
const ctx={console,structuredClone,Intl,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))}};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js','extensions/auto-insight.js','extensions/annotation-layout.js','extensions/accessibility.js','extensions/emphasis.js','extensions/legend-intelligence.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const L=ctx.VCLegendIntelligence;assert(L&&L.VERSION==='1.0','Legend Intelligence exposed');

let d={type:'line',title:'多系列',series:[
{name:'A',x:['Q1','Q2','Q3','Q4'],y:[10,11,12,13]},
{name:'B',x:['Q1','Q2','Q3','Q4'],y:[5,12,24,40]},
{name:'C',x:['Q1','Q2','Q3','Q4'],y:[20,19,21,20]},
{name:'D',x:['Q1','Q2','Q3','Q4'],y:[30,24,34,28]},
{name:'E',x:['Q1','Q2','Q3','Q4'],y:[7,8,9,10]},
{name:'F',x:['Q1','Q2','Q3','Q4'],y:[9,10,8,11]}
]};
let c=ctx.chartConfig(d);
const direct=c.traces.filter(t=>Array.isArray(t.text)&&t.text.some(Boolean));
assert(direct.length>=1&&direct.length<=2,'business mode directly labels only primary line series');
assert(direct.every(t=>t.text.at(-1)===t.name),'line direct label appears at final point');
assert(direct.every(t=>String(t.mode).includes('text')),'directly labeled line includes text mode');
assert(c.layout.margin.r>=105,'direct line labels reserve right margin');
assert(c.legendIntelligence.adjustments.some(x=>x.code==='direct-line-labels'),'direct-line metadata recorded');

d={type:'bar',title:'Top N',x:['A','B','C','D','E','F'],y:[10,60,40,30,20,50]};
c=ctx.chartConfig(d);
const bar=c.traces[0],labels=bar.text.filter(Boolean);
assert(labels.length===3,'business single bar labels Top 3');
assert(labels.includes('60')&&labels.includes('50')&&labels.includes('40'),'bar labels highest values');
assert.equal(bar.textposition,'outside','bar priority labels sit outside');
assert.equal(c.layout.uniformtext.mode,'hide','bar labels use uniformtext guard');

d={type:'bar',title:'焦點',x:['A','B','C','D'],y:[10,40,30,20],focus_category:'D'};
c=ctx.chartConfig(d);
assert(c.traces[0].text[3]==='20','explicit focus category remains labeled even outside auto Top set');

d={type:'pie',title:'少分類',labels:['甲','乙','丙'],values:[50,30,20]};
c=ctx.chartConfig(d);
let p=c.traces.find(t=>t.type==='pie');
assert.equal(p.showlegend,false,'small pie hides redundant legend');
assert(String(p.textinfo).includes('label')&&String(p.textinfo).includes('percent'),'small pie directly labels name and percent');

d={type:'pie',title:'多分類',labels:Array.from({length:10},(_,i)=>'類'+i),values:[30,20,12,10,8,6,5,4,3,2]};
c=ctx.chartConfig(d);p=c.traces.find(t=>t.type==='pie');
assert.equal(p.showlegend,true,'dense pie keeps legend');
assert.equal(p.textposition,'inside','dense pie moves labels inside');
assert(c.legendIntelligence.adjustments.some(x=>x.code==='pie-legend-balance'));

d={type:'scatter',title:'散佈',x:[1,2,3,4,5],y:[2,8,3,4,5]};
c=ctx.chartConfig(d);
let sc=c.traces.find(t=>t.type==='scatter');
assert(Array.isArray(sc.text)&&sc.text.filter(Boolean).length===1,'scatter labels only emphasis focus point');
assert(String(sc.mode).includes('text'),'scatter gains text mode');

d={type:'line',title:'很多系列',series:Array.from({length:11},(_,i)=>({name:'S'+i,x:['1','2','3'],y:[i,i+1,i+2+(i===7?10:0)]}))};
c=ctx.chartConfig(d);
assert.equal(c.layout.legend.orientation,'v','legend overflow moves legend right');
assert(c.layout.margin.r>=175,'legend overflow reserves right margin');
assert(c.layout.legend.font.size<=9,'legend overflow shrinks legend font');

ctx.VCStyle.set({theme:'mono'});
d={type:'line',title:'黑白',series:[
{name:'A',x:['1','2','3'],y:[1,2,3]},
{name:'B',x:['1','2','3'],y:[2,7,4]},
{name:'C',x:['1','2','3'],y:[4,3,5]}
]};
c=ctx.chartConfig(d);
assert(new Set(c.traces.map(t=>t.line.dash)).size>=3,'mono dash styles survive legend intelligence');
assert(c.traces.every(t=>String(t.mode).includes('markers')),'mono marker redundancy survives legend intelligence');

assert.deepEqual(L.topIndices([3,9,1,7],2),[1,3],'topIndices deterministic');
console.log('PASS: legend intelligence direct labels, Top N labels, pie strategy, focus labels and overflow handling.');
