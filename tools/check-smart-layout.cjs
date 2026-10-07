const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console,structuredClone};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
assert(ctx.VCSmartLayout&&ctx.VCSmartLayout.VERSION==='1.0','Smart Layout exposed');

let d={type:'bar',title:'分類很多',x:Array.from({length:16},(_,i)=>'這是很長的分類名稱'+(i+1)),y:Array.from({length:16},(_,i)=>i+1)};
let c=ctx.chartConfig(d);
assert(c.layout.xaxis.tickangle<=-30,'dense bar rotates labels');
assert(c.layout.margin.b>=112,'dense bar increases bottom margin');
assert(c.layout.xaxis.ticktext.some(x=>String(x).includes('<br>')),'dense bar wraps labels');
assert(c.smartLayout.adjustments.some(x=>x.code==='dense-category-axis'));

d={type:'grouped_bar',title:'多系列',series:Array.from({length:11},(_,j)=>({name:'系列'+j,x:['A','B','C'],y:[j+1,j+2,j+3]}))};
c=ctx.chartConfig(d);
assert.equal(c.layout.legend.orientation,'v','many series legend moves to side');
assert(c.layout.margin.r>=170,'many series reserves right margin');

d={type:'parallel',title:'平行座標',dimensions:Array.from({length:10},(_,j)=>({label:'維度'+j,values:[1+j,2+j,3+j,4+j]}))};
c=ctx.chartConfig(d);
const p=c.traces.find(t=>t.type==='parcoords');
assert.deepEqual(p.domain.x,[.02,.98],'many dimensions use wider domain');
assert(p.labelfont.size<=10,'parallel labels shrink with density');
assert(c.smartLayout.adjustments.some(x=>x.code==='parallel-domain'));

d={type:'sankey',title:'流程',labels:Array.from({length:20},(_,i)=>'N'+i),source:[0,1,2,3,4,5,6,7,8,9],target:[10,11,12,13,14,15,16,17,18,19],values:Array(10).fill(1)};
c=ctx.chartConfig(d);let s=c.traces.find(t=>t.type==='sankey');
assert(s.node.pad<=14,'dense Sankey reduces pad');
assert(s.node.thickness<=14,'dense Sankey reduces thickness');

d={type:'scatter3d',title:'跨度差很大',x:[0,1,2,3,4,5],y:[0,1,0,1,0,1],z:[0,100,200,300,400,500]};
c=ctx.chartConfig(d);
assert.equal(c.layout.scene.aspectmode,'cube','large 3D span ratio uses cube');
assert(c.smartLayout.adjustments.some(x=>x.code==='3d-aspect'));

d={type:'table',title:'密集表格',headers:Array.from({length:10},(_,i)=>'欄'+i),rows:Array.from({length:30},(_,r)=>Array.from({length:10},(_,i)=>r+i))};
c=ctx.chartConfig(d);let t=c.traces.find(x=>x.type==='table');
assert(t.header.font.size<=11,'dense table header font shrinks');
assert(t.cells.font.size<=10,'dense table cell font shrinks');
assert(t.cells.height<=28,'dense table row height reduces');

assert.equal(ctx.VCSmartLayout.wrapLabel('這是一個很長很長的分類名稱',6,2).split('<br>').length,2,'wrapLabel respects line count');
console.log('PASS: Smart Layout density rules for axes, legends, parallel, Sankey, 3D and tables.');
