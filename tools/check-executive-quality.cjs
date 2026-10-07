const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const store=new Map([
 ['visual-canvas-work-mode-v1','business'],
 ['visual-canvas-executive-summary-v1','1'],
 ['visual-canvas-executive-layout-v2','auto'],
 ['visual-canvas-output-format-v1','slide_16_9']
]);
const ctx={console,structuredClone,Intl,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))}};ctx.window=ctx;
vm.createContext(ctx);
for(const f of [
 'extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js',
 'extensions/auto-insight.js','extensions/annotation-layout.js','extensions/accessibility.js',
 'extensions/emphasis.js','extensions/legend-intelligence.js','extensions/executive-summary-v2.js',
 'extensions/executive-quality-v3.js'
]) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);

const Q=ctx.VCExecutiveQuality;
assert(Q&&Q.VERSION==='3.0','Executive Quality v3 exposed');

// Long headline should fit, wrap, and score.
let d={type:'bar',title:'區域營收',
 headline:'這是一個非常非常長的商業結論標題用來模擬真實簡報裡可能超過正常寬度而造成版面爆掉的極端情況因此系統必須自動分行並縮小字級',
 x:['北','中','南'],y:[100,180,90],
 report:{source:'來源：'.repeat(70)}
};
let c=ctx.chartConfig(d);
assert(c.executiveQuality.enabled===true,'quality layer enabled');
assert(c.executiveQuality.score<=100&&c.executiveQuality.score>=60,'quality score bounded');
assert(c.executiveQuality.fixes.some(x=>x.code==='headline-fit'),'long headline gets fit fix');
assert(c.executiveQuality.fixes.some(x=>x.code==='source-fit'),'long source gets shortened');
const head=c.layout.annotations.find(a=>a.xref==='paper'&&Number(a.y)>=1.27&&String(a.text).includes('<b>'));
assert(head&&String(head.text).includes('<br>'),'headline actually wraps');
assert(head.font.size<=21,'long headline font reduced');
const src=c.layout.annotations.find(a=>String(a.text||'').startsWith('資料來源：'));
assert(src&&Array.from(String(src.text)).length<140,'source display is shortened');

// Dense grouped bar should downgrade split compare to safer top KPI.
d={type:'grouped_bar',title:'高密度比較',series:Array.from({length:9},(_,i)=>({name:'系列'+(i+1),x:['Q1','Q2','Q3'],y:[i+1,i+3,i+2]}))};
c=ctx.chartConfig(d);
assert.equal(c.executiveQuality.requestedLayout,'split_compare','grouped bar initially requests split compare');
assert.equal(c.executiveQuality.finalLayout,'top_kpi','dense grouped bar downgrades safely');
assert(c.executiveQuality.degraded===true,'downgrade is reported');
assert(c.executiveQuality.fixes.some(x=>x.code==='safe-layout'),'safe-layout fix recorded');
assert.equal(c.executiveSummary.layout,'top_kpi','summary metadata reflects final safe layout');
assert(c.layout.margin.r>=165,'dense legend reserves right margin');

// Portrait output should avoid side rails.
store.set('visual-canvas-output-format-v1','a4_portrait');
d={type:'line',title:'直式趨勢',x:['1','2','3'],y:[10,20,25]};
c=ctx.chartConfig(d);
assert.equal(c.executiveQuality.requestedLayout,'trend_focus');
assert.equal(c.executiveQuality.finalLayout,'top_kpi','portrait trend layout downgrades to top KPI');
assert(c.executiveQuality.fixes.some(x=>x.code==='portrait-layout'),'portrait fallback recorded');

// Manual split compare with too many series still protected.
store.set('visual-canvas-output-format-v1','slide_16_9');
ctx.VCExecutiveSummary.setLayoutMode('split_compare');
d={type:'line',title:'很多折線',series:Array.from({length:13},(_,i)=>({name:'線'+i,x:['A','B','C'],y:[i,i+1,i+2]}))};
c=ctx.chartConfig(d);
assert.equal(c.executiveQuality.finalLayout,'top_kpi','unsafe manual split layout is protected');
assert(c.executiveQuality.warnings.some(x=>x.code==='many-series'),'many-series warning exposed');
assert(c.executiveQuality.fixes.some(x=>x.code==='legend-fit'),'dense legend gets layout fit');
assert(c.layout.legend.font.size>=10&&c.layout.legend.font.size<=10,'very dense legend keeps accessible 10px floor');
assert(c.executiveQuality.score<100,'pressure reduces quality score');

// Chart-only mode should not mutate with executive quality.
ctx.VCExecutiveSummary.setEnabled(false);
d={type:'bar',title:'純圖表',x:['A','B'],y:[1,2]};
c=ctx.chartConfig(d);
assert.equal(c.executiveSummary.enabled,false);
assert.equal(c.executiveQuality.enabled,false,'quality layer inactive in chart-only mode');
assert.equal(c.executiveQuality.score,100,'chart-only quality score neutral');

ctx.VCExecutiveSummary.setEnabled(true);
ctx.VCExecutiveSummary.setLayoutMode('auto');
store.set('visual-canvas-work-mode-v1','research');
d={type:'bar',title:'研究模式',x:['A','B'],y:[1,2]};
c=ctx.chartConfig(d);
assert.equal(c.executiveQuality.enabled,false,'research mode not forced through business quality layer');

// Helpers.
assert.equal(Q.wrap('ABCDEFGHIJK',5,2).join('|'),'ABCDE|FGHI…','wrap truncates deterministically');
assert(Q.fontForHeadline(70,'slide_16_9')<=18,'headline font helper reduces long titles');
assert(Q.fontForValue('12345678901234567890',true)<=17,'long KPI value font is reduced');

console.log('PASS: Executive Layout v3 pressure, safe fallback, text fitting, legend fitting and quality score.');
