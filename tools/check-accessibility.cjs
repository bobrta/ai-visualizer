const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console,structuredClone,Intl};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js','extensions/auto-insight.js','extensions/annotation-layout.js','extensions/accessibility.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const A=ctx.VCAccessibility;assert(A&&A.VERSION==='1.0','Accessibility engine exposed');

assert(A.contrast('#111827','#FFFFFF')>14,'dark text has strong contrast');
assert(A.contrast(A.ensureContrast('#BBBBBB','#FFFFFF',4.5),'#FFFFFF')>=4.5,'low contrast foreground is corrected');
assert(A.contrast(A.ensureContrast('#333333','#0B0F14',4.5),'#0B0F14')>=4.5,'dark background contrast is corrected');

let d={type:'line',title:'多系列',series:Array.from({length:4},(_,i)=>({name:'S'+i,x:['A','B','C'],y:[1+i,2+i,3+i]}))};
let c=ctx.chartConfig(d);
const lines=c.traces.filter(t=>t.type==='scatter');
assert(new Set(lines.map(t=>t.line.dash)).size>=4,'line series use different dash patterns');
assert(lines.every(t=>String(t.mode).includes('markers')),'line series gain marker redundancy');
assert(new Set(lines.map(t=>t.marker.symbol)).size>=4,'line series use distinct symbols');

ctx.VCStyle.set({theme:'mono'});
d={type:'grouped_bar',title:'黑白列印',series:[
{name:'A',x:['Q1','Q2'],y:[1,2]},{name:'B',x:['Q1','Q2'],y:[2,3]},{name:'C',x:['Q1','Q2'],y:[3,4]},{name:'D',x:['Q1','Q2'],y:[4,5]}
]};
c=ctx.chartConfig(d);
const bars=c.traces.filter(t=>t.type==='bar');
assert(bars.every(t=>t.marker?.pattern),'mono bars have patterns');
assert(new Set(bars.map(t=>t.marker.pattern.shape)).size>=3,'mono bar patterns differ');
assert(c.accessibility.mono===true,'mono report flagged');

ctx.VCStyle.set({theme:'executive'});
d={type:'parallel',title:'高維',dimensions:Array.from({length:12},(_,i)=>({label:'D'+i,values:[i,i+1,i+2,i+3]}))};
c=ctx.chartConfig(d);
let p=c.traces.find(t=>t.type==='parcoords');
assert(p.labelfont.size>=10,'parallel label font stays readable');
assert(p.tickfont.size>=8,'parallel tick font has readability floor');

d={type:'table',title:'密集表格',headers:Array.from({length:14},(_,i)=>'H'+i),rows:Array.from({length:40},(_,r)=>Array.from({length:14},(_,i)=>r+i))};
c=ctx.chartConfig(d);
let t=c.traces.find(x=>x.type==='table');
assert(t.header.font.size>=10,'table header font minimum');
assert(t.cells.font.size>=9,'table body font minimum');

d={type:'pie',title:'占比',labels:['甲','乙','丙'],values:[50,30,20]};
c=ctx.chartConfig(d);
p=c.traces.find(x=>x.type==='pie');
assert(String(p.textinfo).includes('label')&&String(p.textinfo).includes('percent'),'pie retains text and percent');
assert(p.marker.line.width>=2,'pie slices separated by border');

const report=c.accessibility;
assert(report&&report.version==='1.0','accessibility report attached');
assert(report.contrast.foreground>=4.5,'foreground report meets contrast');
assert(report.contrast.muted>=3.4,'muted report meets contrast');

console.log('PASS: accessibility contrast, non-color redundancy, font floors, mono patterns and report.');
