/* Data-quality and chart-fit guardrails. Presentation heuristics only; they do not alter source data. */
(()=>{'use strict';
const VERSION='1.0';
const LABELS={business:'商業簡報',research:'研究專題',learning:'學習整理',all:'全功能'};
const CHART_LABELS={bar:'長條圖',table:'資料表',treemap:'矩形樹圖',scatter:'散佈圖',heatmap:'熱力圖',histogram:'直方圖',line:'折線圖',parallel:'平行座標圖'};
function mode(){try{const m=localStorage.getItem('visual-canvas-work-mode-v1')||'business';return LABELS[m]?m:'business';}catch{return 'business';}}
function len(v){return Array.from(String(v??'')).length;}
function uniq(a){return [...new Set(a)];}
function numeric(a){return Array.isArray(a)?a.filter(Number.isFinite):[];}
function variance(a){const v=numeric(a);if(v.length<2)return 0;const min=Math.min(...v),max=Math.max(...v);return max-min;}
function issue(level,code,title,detail,suggestion='',alternatives=[]){return {level,code,title,detail,suggestion,alternatives};}
function analyze(d,opt={}){
 const m=opt.mode||mode(),items=[],business=m==='business';
 const add=(level,code,title,detail,suggestion='',alternatives=[])=>items.push(issue(level,code,title,detail,suggestion,alternatives));
 if(!d||typeof d!=='object')return {version:VERSION,mode:m,score:0,blocking:true,issues:[issue('block','invalid','資料格式無效','需要一個圖表 JSON 物件。')],alternatives:[]};
 const t=d.type||'';
 if(len(d.title)>48)add('warning','long-title','標題偏長',`目前標題約 ${len(d.title)} 字，簡報頁面容易失去視覺焦點。`,'把標題改成一句結論，細節放副標或圖說。');
 const series=Array.isArray(d.series)?d.series:[d];
 const first=series[0]||d;
 const xCount=Array.isArray(first.x)?first.x.length:0;
 const longLabels=a=>Array.isArray(a)?a.filter(x=>len(x)>16).length:0;
 const categoryWarn=business?12:18;
 const seriesWarn=business?5:8;
 if(['bar','grouped_bar','stacked_bar'].includes(t)){
   if(xCount>50)add('block','too-many-categories','分類過多',`${xCount} 個分類會讓長條圖難以閱讀。`,'先篩選 Top N、分頁或改用表格。',['table']);
   else if(xCount>categoryWarn)add('warning','many-categories','分類偏多',`${xCount} 個分類在目前模式下偏密。`,'商業簡報建議保留重點分類，其他合併為「其他」。',['table','treemap']);
   if(series.length>15)add('block','too-many-series','系列過多',`${series.length} 組系列會造成圖例與辨識負荷過高。`,'拆成小 multiples 或分頁。',['table']);
   else if(series.length>seriesWarn)add('warning','many-series','系列偏多',`${series.length} 組系列容易讓顏色與圖例失去辨識度。`,'保留最重要的 3–5 組，或拆圖。');
   if(longLabels(first.x)>0)add('warning','long-category-labels','分類文字偏長',`${longLabels(first.x)} 個分類名稱超過 16 字。`,'縮短標籤或改橫向呈現。');
 }
 if(['line','area','stacked_area'].includes(t)){
   if(xCount>3000)add('block','too-many-points','資料點過多',`${xCount} 個點不適合直接做簡報圖。`,'先聚合、抽樣或縮小時間區間。');
   else if(xCount>(business?120:300))add('warning','dense-time-series','時間序列偏密',`${xCount} 個點可能使趨勢線與標籤過密。`,'簡報可聚合到週、月或關鍵時間點。');
   if(xCount>0&&xCount<3)add('warning','few-points','資料點太少',`只有 ${xCount} 個點，趨勢判讀容易被過度解讀。`,'補更多時間點，或改用長條圖。',['bar']);
   if(series.length>15)add('block','too-many-series','系列過多',`${series.length} 條線會形成視覺雜訊。`,'拆圖或只保留關鍵系列。');
   else if(series.length>seriesWarn)add('warning','many-series','折線系列偏多',`${series.length} 條線不利於快速比較。`,'突出 1–3 條主線，其餘淡化或拆圖。');
 }
 if(['scatter','bubble'].includes(t)){
   const n=Array.isArray(d.x)?d.x.length:0;
   if(n>20000)add('block','too-many-points','散點過多',`${n} 個點可能拖慢瀏覽器並遮蔽模式。`,'先抽樣、分群或改用密度圖。',['heatmap']);
   else if(n>5000)add('warning','dense-scatter','散點非常密集',`${n} 個點容易互相遮蔽。`,'降低透明度、抽樣或分群。',['heatmap']);
   if(n>0&&n<5)add('warning','few-points','樣本太少',`只有 ${n} 個點，關係圖不容易形成可靠視覺模式。`,'補資料或改用直接比較圖。',['bar']);
   if(variance(d.x)===0||variance(d.y)===0)add('warning','zero-variance','其中一軸沒有變化','散點圖會退化成一條直線。','確認欄位是否選錯，或改用單變量圖。',['histogram']);
 }
 if(['pie','donut'].includes(t)){
   const n=Array.isArray(d.labels)?d.labels.length:0,vals=numeric(d.values),sum=vals.reduce((a,b)=>a+b,0);
   if(n>30)add('block','pie-overload','圓餅分類過多',`${n} 個扇區幾乎無法有效辨識。`,'改用排序長條圖或矩形樹圖。',['bar','treemap']);
   else if(n>(business?6:8))add('warning','pie-many-slices','圓餅分類偏多',`${n} 個扇區會降低比較精度。`,'商業簡報通常保留主要幾類，其餘合併。',['bar','treemap']);
   if(sum>0){const tiny=vals.filter(v=>v/sum<.03&&v>0).length;if(tiny>=3)add('warning','pie-tiny-slices','小比例扇區太多',`${tiny} 個分類低於總量 3%。`,'合併為「其他」或改用長條圖。',['bar']);}
   if(longLabels(d.labels)>0)add('warning','pie-long-labels','圓餅標籤偏長',`${longLabels(d.labels)} 個名稱超過 16 字。`,'縮短名稱或改用長條圖。',['bar']);
 }
 if(t==='funnel'){
   const n=Array.isArray(d.labels)?d.labels.length:0;
   if(n>15)add('block','funnel-overload','漏斗階段過多',`${n} 個階段不適合單一漏斗。`,'拆成流程段落或改用表格。',['bar','table']);
   else if(n>7)add('warning','funnel-many-steps','漏斗階段偏多',`${n} 個階段會讓漏斗過長。`,'保留主要轉換節點。');
   const v=numeric(d.values);if(v.some((x,i)=>i>0&&x>v[i-1]))add('warning','funnel-not-monotonic','漏斗數值有回升','部分後續階段高於前一階段，讀者可能誤解為資料錯誤。','確認漏斗是否真的是逐階段轉換；若不是，改用長條圖。',['bar']);
 }
 if(t==='waterfall'){
   const n=Array.isArray(d.values)?d.values.length:0;
   if(n>40)add('block','waterfall-overload','瀑布步驟過多',`${n} 個步驟難以在一頁閱讀。`,'拆成群組或改用表格。',['table']);
   else if(n>(business?12:18))add('warning','waterfall-many-steps','瀑布步驟偏多',`${n} 個變動項目容易失去重點。`,'只保留主要貢獻項。');
 }
 if(['histogram','box','violin'].includes(t)){
   const groups=Array.isArray(d.series)?d.series:[d],counts=groups.map(s=>Array.isArray(s.values)?s.values.length:0),n=Math.min(...counts.filter(Number.isFinite));
   if(counts.some(x=>x>50000))add('block','distribution-overload','樣本量過大','單次在瀏覽器直接繪製超過 50,000 筆不利於互動。','先做分箱、抽樣或彙總。');
   if(Number.isFinite(n)&&n<(t==='histogram'?15:5))add('warning','small-distribution-sample','樣本偏少',`目前最小群組只有 ${n} 筆。`,'分布形狀可能不穩定，報告中應標示樣本數。');
 }
 if(['heatmap','contour','surface'].includes(t)){
   const rows=Array.isArray(d.z)?d.z.length:0,cols=rows&&Array.isArray(d.z[0])?d.z[0].length:0,cells=rows*cols;
   if(cells>100000)add('block','matrix-overload','矩陣過大',`${rows} × ${cols} = ${cells.toLocaleString()} 格，瀏覽器與閱讀負荷都很高。`,'先聚合或切片。');
   else if(cells>(business?1600:10000))add('warning','dense-matrix','矩陣偏密',`${rows} × ${cols} 的矩陣在目前模式下偏密。`,'簡報只保留重要區塊或做聚合。');
   if(rows===1||cols===1)add('warning','one-dimensional-matrix','矩陣只有單一列或欄','熱力／等高／曲面圖的二維結構不足。','改用長條圖或折線圖。',['bar','line']);
 }
 if(['scatter3d','line3d','bar3d'].includes(t)){
   const n=Array.isArray(d.x)?d.x.length:0,vary=[variance(d.x)>0,variance(d.y)>0,variance(d.z)>0].filter(Boolean).length;
   if(n>10000)add('block','3d-overload','3D 資料點過多',`${n} 個 3D 元素可能造成顯著效能與遮蔽問題。`,'先抽樣或改用 2D 分面。',['scatter']);
   else if(n>1000)add('warning','3d-dense','3D 圖偏密',`${n} 個元素會增加旋轉與辨識成本。`,'簡報優先使用 2D；3D 留給確實需要第三維的情況。',['scatter']);
   if(n>0&&n<6)add('warning','3d-few-points','3D 資料點偏少',`只有 ${n} 個點，第三維帶來的資訊增益有限。`,'若第三維不是核心訊息，改用 2D 散佈圖。',['scatter']);
   if(vary<3)add('warning','3d-flat-dimension','至少一個維度沒有變化','3D 空間實際上退化成平面或直線。','改用 2D 圖會更清楚。',['scatter']);
 }
 if(['radar','polar'].includes(t)){
   const ss=Array.isArray(d.series)?d.series:[d],axes=Array.isArray(ss[0]?.theta)?ss[0].theta.length:0;
   if(t==='radar'&&axes<3)add('block','radar-too-few-axes','雷達圖至少需要三個維度',`目前只有 ${axes} 個維度。`,'改用長條圖。',['bar']);
   if(axes>15)add('block','radar-overload','雷達維度過多',`${axes} 個軸無法有效閱讀。`,'拆圖或改用平行座標。',['parallel']);
   else if(axes>(business?8:10))add('warning','radar-many-axes','雷達維度偏多',`${axes} 個軸會讓形狀比較困難。`,'保留最重要的 5–8 個指標。',['parallel']);
   if(ss.length>8)add('block','radar-too-many-series','雷達系列過多',`${ss.length} 組多邊形會嚴重重疊。`,'拆圖或改用表格。',['table']);
   else if(ss.length>4)add('warning','radar-many-series','雷達系列偏多',`${ss.length} 組資料重疊後難以辨識。`,'一次比較 2–4 組較清楚。');
 }
 if(['treemap','sunburst'].includes(t)){
   const n=Array.isArray(d.ids)?d.ids.length:0;
   if(n>150)add('block','hierarchy-overload','階層節點過多',`${n} 個節點不適合單頁互動圖。`,'先聚合上層分類或切成多張圖。');
   else if(n>(business?35:60))add('warning','hierarchy-dense','階層節點偏多',`${n} 個節點會讓文字與色塊變得很小。`,'聚合細項或只顯示主要層級。');
   if(longLabels(d.labels)>0)add('warning','hierarchy-long-labels','階層標籤偏長',`${longLabels(d.labels)} 個標籤超過 16 字。`,'縮短節點名稱，把說明放 tooltip 或圖說。');
 }
 if(t==='sankey'){
   const nodes=Array.isArray(d.labels)?d.labels.length:0,links=Array.isArray(d.values)?d.values.length:0;
   if(nodes>50||links>120)add('block','sankey-overload','桑基圖規模過大',`${nodes} 個節點、${links} 條流向會造成大量交叉。`,'先聚合流程或拆成多張圖。',['table']);
   else if(nodes>(business?15:25)||links>(business?25:50))add('warning','sankey-dense','桑基圖偏密',`${nodes} 個節點、${links} 條流向可能形成線條雜訊。`,'聚合次要節點，只保留主要流向。');
   if(longLabels(d.labels)>0)add('warning','sankey-long-labels','桑基節點文字偏長',`${longLabels(d.labels)} 個節點名稱超過 16 字。`,'縮短節點名稱。');
 }
 if(t==='parallel'){
   const dims=Array.isArray(d.dimensions)?d.dimensions:[],n=dims.length,rows=Array.isArray(dims[0]?.values)?dims[0].values.length:0,constant=dims.filter(x=>variance(x.values)===0).length;
   if(n>16)add('block','parallel-overload','平行座標維度過多',`${n} 個維度會使圖面極度密集。`,'先做特徵選擇，保留核心變數。',['heatmap','table']);
   else if(n>8)add('warning','parallel-many-dimensions','平行座標維度偏多',`${n} 個維度會增加線條交叉與閱讀負荷。`,'商業簡報建議保留 4–7 個關鍵維度。');
   if(n===2)add('warning','parallel-two-dimensions','只有兩個維度','平行座標的優勢尚未發揮，畫面也會顯得空。','若目的是看兩變量關係，改用散佈圖。',['scatter']);
   if(rows>5000)add('block','parallel-too-many-rows','平行座標資料列過多',`${rows} 條線會形成實心色帶。`,'先抽樣、分群或改用熱力圖。',['heatmap']);
   else if(rows>500)add('warning','parallel-many-rows','平行座標線條偏多',`${rows} 條線容易互相遮蔽。`,'抽樣或只突出關鍵群組。');
   if(rows>0&&rows<4)add('warning','parallel-few-rows','資料列太少',`只有 ${rows} 筆資料，使用平行座標的必要性不高。`,'可改用表格或散佈圖。',['table','scatter']);
   if(constant)add('warning','parallel-constant-dimension','存在沒有變化的維度',`${constant} 個維度所有值都相同。`,'移除沒有資訊量的維度。');
 }
 if(t==='candlestick'){
   const n=Array.isArray(d.x)?d.x.length:0;
   if(n>10000)add('block','candlestick-overload','K 線資料過多',`${n} 根 K 線不適合一次在簡報畫布呈現。`,'縮短期間或做區間切換。');
   else if(n>1000)add('warning','candlestick-dense','K 線偏密',`${n} 根 K 線會讓單根資訊難以辨識。`,'縮短期間或聚合週期。');
   if(n>0&&n<5)add('warning','candlestick-few-bars','K 線數量偏少',`只有 ${n} 根 K 線，趨勢資訊有限。`,'補更多期間。');
 }
 if(t==='table'){
   const cols=Array.isArray(d.headers)?d.headers.length:0,rows=Array.isArray(d.rows)?d.rows.length:0;
   if(cols>20||rows>1000)add('block','table-overload','表格規模過大',`${rows} 列 × ${cols} 欄不適合直接放在單一畫布。`,'分頁、篩選或匯出試算表。');
   else if(cols>(business?8:12)||rows>(business?30:80))add('warning','table-dense','表格偏密',`${rows} 列 × ${cols} 欄會降低投影片可讀性。`,'簡報只保留關鍵列欄，其餘放附錄。');
   let long=0;for(const r of d.rows||[])for(const v of r)if(typeof v==='string'&&len(v)>40)long++;
   if(long)add('warning','table-long-cells','表格內有長文字',`${long} 個儲存格超過 40 字。`,'長敘述改放附註或附錄。');
 }
 const weights={block:32,warning:9,note:3};
 let score=100;for(const x of items)score-=weights[x.level]||0;score=Math.max(0,Math.min(100,score));
 const alternatives=uniq(items.flatMap(x=>x.alternatives||[]));
 return {version:VERSION,mode:m,modeLabel:LABELS[m],score,blocking:items.some(x=>x.level==='block'),issues:items,alternatives};
}
function verdict(score){return score>=90?'適合目前用途':score>=75?'可用，建議微調':score>=60?'資訊偏密':'建議換圖或簡化';}
function render(host,report,opt={}){
 if(!host)return;host.replaceChildren();host.hidden=false;host.dataset.score=String(report.score);host.dataset.blocking=String(report.blocking);
 const top=document.createElement('div');top.className='guardrail-head';
 const left=document.createElement('div');const eye=document.createElement('span');eye.className='guardrail-eyebrow';eye.textContent='DATA QUALITY / '+(report.modeLabel||'圖表健檢');const title=document.createElement('strong');title.textContent='圖表健檢 · '+report.score+'/100';left.append(eye,title);
 const badge=document.createElement('span');badge.className='guardrail-score '+(report.blocking?'block':report.score<90?'warn':'good');badge.textContent=verdict(report.score);top.append(left,badge);host.append(top);
 if(!report.issues.length){const ok=document.createElement('p');ok.className='guardrail-ok';ok.textContent='目前沒有偵測到明顯的資料密度或圖型適配問題。';host.append(ok);return;}
 const list=document.createElement('div');list.className='guardrail-list';
 for(const x of report.issues){const row=document.createElement('article');row.className='guardrail-item '+x.level;const mark=document.createElement('span');mark.className='guardrail-mark';mark.textContent=x.level==='block'?'!':'△';const body=document.createElement('div');const h=document.createElement('strong');h.textContent=x.title;const p=document.createElement('p');p.textContent=x.detail+(x.suggestion?' '+x.suggestion:'');body.append(h,p);row.append(mark,body);list.append(row);}host.append(list);
 if(report.alternatives.length&&opt.onAlternative){const alt=document.createElement('div');alt.className='guardrail-actions';const label=document.createElement('span');label.textContent='可考慮：';alt.append(label);for(const type of report.alternatives.slice(0,3)){const b=document.createElement('button');b.type='button';b.textContent=(CHART_LABELS[type]||type);b.onclick=()=>opt.onAlternative(type);alt.append(b);}host.append(alt);}
 if(report.blocking&&opt.onOverride){const row=document.createElement('div');row.className='guardrail-override';const p=document.createElement('span');p.textContent='這份資料已達阻擋門檻；你仍可強制產生一次。';const b=document.createElement('button');b.type='button';b.textContent='仍要產生一次';b.onclick=opt.onOverride;row.append(p,b);host.append(row);}
}
window.VCChartGuardrails={VERSION,analyze,render,verdict};
})();