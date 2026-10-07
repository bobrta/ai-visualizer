const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const store=new Map([['visual-canvas-work-mode-v1','business']]);
const ctx={console,structuredClone,Intl,localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v))}};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js','extensions/smart-layout.js','extensions/auto-insight.js','extensions/annotation-layout.js','extensions/accessibility.js','extensions/emphasis.js','extensions/legend-intelligence.js','extensions/executive-summary-v2.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);

const X=ctx.VCExecutiveSummary;
assert(X&&X.VERSION==='2.0','Executive Summary exposed');

// Business mode defaults to executive composition.
let d={type:'bar',title:'各區營收比較',x:['北區','中區','南區'],y:[120,180,90],report:{source:'ERP 月報'}};
let c=ctx.chartConfig(d);
assert.equal(c.executiveSummary.enabled,true,'business mode enables executive page by default');
assert.equal(c.executiveSummary.kpis.length,3,'bar creates three KPI cards');
assert(c.executiveSummary.kpis.some(x=>x.label==='最高值'&&x.value==='180'),'highest KPI correct');
assert(c.executiveSummary.kpis.some(x=>x.label==='最低值'&&x.value==='90'),'lowest KPI correct');
assert(c.executiveSummary.kpis.some(x=>x.label==='差距'&&x.value==='90'),'range KPI correct');
assert.equal(c.executiveSummary.source,'ERP 月報','source carried into composition');
assert(c.executiveSummary.headline.includes('最高'),'auto insight becomes conclusion headline');
assert.equal(c.layout.title.text,'','native chart title is suppressed in executive page');
assert(c.layout.margin.t>=235&&c.layout.margin.b>=92,'composition reserves header/footer space');
assert((c.layout.annotations||[]).some(a=>a.xref==='paper'&&Number(a.y)>1.2),'headline annotation is in paper space');
assert((c.layout.shapes||[]).filter(s=>s.type==='rect'&&s.y0>1).length===3,'three KPI card shapes are composed');
assert((c.layout.annotations||[]).some(a=>String(a.text).includes('資料來源：ERP 月報')),'source footer included');

// Explicit headline overrides auto insight.
d={type:'line',title:'月營收',headline:'營收連續回升，最新一期再增 20',x:['1月','2月','3月'],y:[100,120,140]};
c=ctx.chartConfig(d);
assert.equal(c.executiveSummary.headline,'營收連續回升，最新一期再增 20','explicit headline wins');

// Presentation headline also supported.
d={type:'pie',title:'產品組合',labels:['A','B','C'],values:[60,25,15],presentation:{headline:'A 產品貢獻六成營收'}};
c=ctx.chartConfig(d);
assert.equal(c.executiveSummary.headline,'A 產品貢獻六成營收','presentation headline wins');

// Disable should restore chart-only behavior.
X.setEnabled(false);
d={type:'bar',title:'純圖表',x:['A','B'],y:[1,2]};
c=ctx.chartConfig(d);
assert.equal(c.executiveSummary.enabled,false,'chart-only mode disables composition');
assert.notEqual(c.layout.title?.text,'','normal chart title is retained');

// Re-enable, then verify research mode still stays neutral.
X.setEnabled(true);
store.set('visual-canvas-work-mode-v1','research');
d={type:'bar',title:'研究比較',x:['A','B'],y:[1,2]};
c=ctx.chartConfig(d);
assert.equal(c.executiveSummary.enabled,false,'research mode does not force executive composition');

// KPI helpers for other chart families.
store.set('visual-canvas-work-mode-v1','business');
X.setEnabled(true);
let ks=X.kpis({type:'pie',labels:['甲','乙','丙'],values:[50,30,20]},{});
assert(ks.some(x=>x.label==='最大占比'&&x.value==='50.0%'),'pie KPI share');
ks=X.kpis({type:'scatter',x:[1,2,3,4],y:[2,4,6,8]},{});
assert(ks.some(x=>x.label==='相關係數 r'&&x.value==='1.00'),'scatter KPI correlation');
ks=X.kpis({type:'waterfall',labels:['A','B','C'],values:[100,-40,20]},{});
assert(ks.some(x=>x.label==='淨變化'&&x.value==='+80'),'waterfall KPI net change');

assert.equal(X.escapeHtml('<b>&"'), '&lt;b&gt;&amp;&quot;','composition escapes user text');
console.log('PASS: Executive Summary KPI, headline, source, composition, toggle and work-mode behavior.');


// v2 layout-selection behavior.
X.setLayoutMode('auto');
let q={type:'bar',title:'Bar',x:['A','B','C'],y:[1,3,2]};
c=ctx.chartConfig(q);
assert.equal(c.executiveSummary.layout,'left_kpi','bar auto-selects left KPI layout');
assert(c.layout.xaxis.domain[0]>=.34,'left KPI layout moves chart domain right');
assert((c.layout.shapes||[]).filter(s=>s.type==='rect'&&s.x1<=.26).length>=2,'left KPI cards occupy left rail');

q={type:'line',title:'Trend',x:['1','2','3'],y:[10,15,22]};
c=ctx.chartConfig(q);
assert.equal(c.executiveSummary.layout,'trend_focus','line auto-selects trend focus');
assert(c.layout.xaxis.domain[0]>=.30,'trend layout reserves metric rail');
assert((c.layout.annotations||[]).some(a=>Number(a.x)<.1&&Number(a.y)>.6),'trend layout includes large metric block');

q={type:'grouped_bar',title:'Compare',series:[
{name:'A',x:['Q1','Q2'],y:[10,20]},{name:'B',x:['Q1','Q2'],y:[15,18]}
]};
c=ctx.chartConfig(q);
assert.equal(c.executiveSummary.layout,'split_compare','grouped bar auto-selects split compare');
assert(c.layout.xaxis.domain[1]<=.64,'split compare reserves right takeaway rail');
assert((c.layout.shapes||[]).filter(s=>s.type==='rect'&&s.x0>=.72).length>=2,'split compare places KPI cards on right');

q={type:'scatter',title:'Scatter',x:[1,2,3],y:[2,3,5]};
c=ctx.chartConfig(q);
assert.equal(c.executiveSummary.layout,'top_kpi','other charts use top KPI default');
assert((c.layout.shapes||[]).filter(s=>s.type==='rect'&&s.y0>1).length>=2,'top KPI places cards above plot');

X.setLayoutMode('top_kpi');
q={type:'line',title:'Manual layout',x:['1','2','3'],y:[2,4,8]};
c=ctx.chartConfig(q);
assert.equal(c.executiveSummary.layout,'top_kpi','saved manual layout overrides auto');

q={type:'line',title:'Explicit layout',presentation:{executive_layout:'split_compare'},x:['1','2','3'],y:[2,4,8]};
c=ctx.chartConfig(q);
assert.equal(c.executiveSummary.layout,'split_compare','presentation executive_layout overrides saved preference');

X.setLayoutMode('auto');
assert.equal(X.autoLayout({type:'bar'}),'left_kpi');
assert.equal(X.autoLayout({type:'line'}),'trend_focus');
assert.equal(X.autoLayout({type:'pie'}),'split_compare');
assert.equal(X.autoLayout({type:'scatter'}),'top_kpi');
assert.equal(X.resolveLayout({type:'line'}),'trend_focus');

console.log('PASS: Executive Layout v2 auto selection, manual override, domains and composition rails.');
