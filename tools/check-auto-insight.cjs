const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console,structuredClone,Intl};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js','extensions/auto-insight.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const I=ctx.VCAutoInsight;assert(I&&I.VERSION==='1.0','Auto Insight exposed');

let d={type:'bar',title:'營收',x:['A','B','C'],y:[10,25,15]};
let c=ctx.chartConfig(d);
assert(c.autoInsight.items.some(x=>x.kind==='max'),'bar finds max');
assert(c.autoInsight.summary.includes('B'),'bar summary names max category');
assert((c.layout.annotations||[]).some(a=>String(a.text).includes('最高')),'bar adds presentation annotation');

d={type:'line',title:'趨勢',x:['Q1','Q2','Q3','Q4'],y:[100,120,80,95]};
c=ctx.chartConfig(d);
const move=c.autoInsight.items.find(x=>x.kind==='fall');
assert(move&&move.text.includes('40'),'line finds largest absolute move');
assert((c.layout.annotations||[]).length>=1,'line adds annotation');

assert(Math.abs(I.pearson([1,2,3,4],[2,4,6,8])-1)<1e-9,'Pearson perfect positive');
assert(Math.abs(I.pearson([1,2,3,4],[8,6,4,2])+1)<1e-9,'Pearson perfect negative');
d={type:'scatter',title:'關係',x:[1,2,3,4,5],y:[2,4,6,8,10]};
c=ctx.chartConfig(d);
assert(c.autoInsight.summary.includes('高度正相關'),'scatter describes correlation');
assert(c.autoInsight.summary.includes('1.00'),'scatter includes r');

d={type:'pie',title:'占比',labels:['甲','乙','丙'],values:[60,25,15]};
c=ctx.chartConfig(d);
assert(c.autoInsight.summary.includes('甲'),'pie identifies largest share');
assert(c.autoInsight.summary.includes('60.0%'),'pie calculates share');

d={type:'waterfall',title:'損益橋接',labels:['營收','成本','效率'],values:[120,-55,20],measure:['relative','relative','relative']};
c=ctx.chartConfig(d);
assert(c.autoInsight.items.some(x=>x.kind==='positive'),'waterfall finds positive contribution');
assert(c.autoInsight.items.some(x=>x.kind==='negative'),'waterfall finds negative contribution');
assert((c.layout.annotations||[]).length===2,'waterfall uses two restrained annotations');

d={type:'sankey',title:'流量',labels:['A','B','C'],source:[0,0],target:[1,2],values:[80,20]};
c=ctx.chartConfig(d);
assert(c.autoInsight.summary.includes('A → B'),'Sankey identifies largest flow');
assert(c.autoInsight.summary.includes('80'),'Sankey includes value');

d={type:'scatter3d',title:'3D',x:[1,2,3,4,5,6],y:[3,2,4,1,5,6],z:[4,9,2,5,7,3]};
c=ctx.chartConfig(d);
assert(c.autoInsight.summary.includes('9'),'3D identifies highest Z');
assert.equal((c.layout.annotations||[]).length,0,'3D insight does not inject incompatible 2D annotation');

assert.equal(I.argmax([1,9,4]).k,1);assert.equal(I.argmin([1,-3,4]).k,1);
console.log('PASS: Auto Insight maxima, trend moves, correlation, shares, flows and restrained annotations.');