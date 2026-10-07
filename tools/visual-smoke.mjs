import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const BASE=process.env.VC_BASE_URL||'http://127.0.0.1:4173';
const OUT=path.join(ROOT,'artifacts','visual');
fs.mkdirSync(OUT,{recursive:true});
const LOCAL_PLOTLY=fs.readFileSync(path.join(ROOT,'node_modules','plotly.js-dist-min','plotly.min.js'));
const gateSource=fs.readFileSync(path.join(ROOT,'gate-config.js'),'utf8');
const gateHash=gateSource.match(/"hash"\s*:\s*"([^"]+)"/)?.[1];
if(!gateHash)throw new Error('Unable to read frontend gate hash for browser tests.');

function assert(value,message){if(!value)throw new Error(message);}
async function attachDiagnostics(page,name){
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('console.error: '+m.text());});
  page.on('requestfailed',r=>errors.push('requestfailed: '+r.url()+' :: '+(r.failure()?.errorText||'')));
  return ()=>{if(errors.length)throw new Error(name+' browser errors:\n'+errors.join('\n'));};
}
async function assertNoBodyOverflow(page,label,slack=6){
  const m=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(m.scroll<=m.client+slack,`${label}: horizontal page overflow ${m.scroll} > ${m.client}`);
}
async function screenshot(locator,file){
  await locator.screenshot({path:path.join(OUT,file),animations:'disabled'});
}
async function mainChart(page,type,file){
  await page.selectOption('#chartType',type);
  await page.click('#sample');
  await page.click('#generate');
  await page.waitForTimeout(1200);
  const diagnostic=await page.evaluate(()=>({
    type:document.querySelector('#chartType')?.value,
    status:document.querySelector('#status')?.textContent,
    plotDisplay:getComputedStyle(document.querySelector('#plot')).display,
    plotHTML:(document.querySelector('#plot')?.innerHTML||'').length,
    hasPlotly:Boolean(window.Plotly),
    hasNewPlot:Boolean(window.Plotly?.newPlot),
    plotlyVersion:window.Plotly?.version||'',
    chartDataType:window.chartData?.type||null,
    inputType:(()=>{try{return JSON.parse(document.querySelector('#input')?.value||'{}').type||null}catch{return 'invalid-json'}})(),
    chartConfigType:typeof window.chartConfig,
    loadPlotlyType:typeof window.loadPlotly
  }));
  console.log('VISUAL-DIAG',type,JSON.stringify(diagnostic));
  try{await page.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});}
  catch(e){await page.screenshot({path:path.join(OUT,`debug-main-${type}.png`),fullPage:true,animations:'disabled'});throw new Error(`${type}: Plotly container did not appear. ${JSON.stringify(diagnostic)}`);}
  await page.waitForTimeout(500);
  const status=await page.locator('#status').textContent();
  assert(!status?.includes('無法產生'),`${type}: render failed: ${status}`);
  const guard=await page.evaluate(()=>({hidden:document.querySelector('#guardrailPanel')?.hidden,score:Number(document.querySelector('#guardrailPanel')?.dataset.score),blocking:document.querySelector('#guardrailPanel')?.dataset.blocking}));
  assert(guard.hidden===false&&Number.isFinite(guard.score),`${type}: guardrail panel missing`);
  assert(guard.blocking==='false',`${type}: sample unexpectedly blocked by guardrails`);
  const smart=await page.evaluate(()=>({status:document.querySelector('#status')?.textContent||'',hasEngine:Boolean(window.VCSmartLayout)}));
  assert(smart.hasEngine,`${type}: Smart Layout engine missing`);
  assert(smart.status.includes('自動調整'),`${type}: Smart Layout did not report adjustments`);
  assert(await page.evaluate(()=>Boolean(window.VCAutoInsight)),`${type}: Auto Insight engine missing`);
  assert(await page.evaluate(()=>Boolean(window.VCAccessibility)),`${type}: Accessibility engine missing`);
  assert(await page.evaluate(()=>Boolean(window.VCEmphasis)),`${type}: Emphasis engine missing`);
  assert(await page.evaluate(()=>Boolean(window.VCLegendIntelligence)),`${type}: Legend Intelligence engine missing`);
  assert(await page.evaluate(()=>Boolean(window.VCExecutiveSummary)),`${type}: Executive Summary engine missing`);
  assert(await page.evaluate(()=>Boolean(window.VCExecutiveQuality)),`${type}: Executive Quality v3 engine missing`);
  assert(await page.evaluate(()=>Array.isArray(document.querySelector('#plot')?.data)&&document.querySelector('#plot').data.length>0),`${type}: Plotly graph data missing`);
  const m=await page.evaluate(()=>{
    const plot=document.querySelector('#plot')?.getBoundingClientRect();
    const texts=[...document.querySelectorAll('#plot text')].map(n=>parseFloat(getComputedStyle(n).fontSize)).filter(Number.isFinite);
    const canvases=[...document.querySelectorAll('#plot canvas')].map(n=>{const r=n.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};});
    const html=document.querySelector('#plot')?.innerHTML||'';
    return {plot:plot&&{left:plot.left,top:plot.top,right:plot.right,bottom:plot.bottom,width:plot.width,height:plot.height},maxFont:texts.length?Math.max(...texts):0,canvases,bad:/NaN|Infinity/.test(html)};
  });
  assert(m.plot&&m.plot.width>500&&m.plot.height>350,`${type}: Plotly viewport too small`);
  assert(!m.bad,`${type}: rendered markup contains NaN/Infinity`);
  assert(m.maxFont<=40,`${type}: runaway Plotly font size ${m.maxFont}px`);
  for(const cv of m.canvases){
    assert(cv.left>=m.plot.left-4&&cv.right<=m.plot.right+4&&cv.top>=m.plot.top-4&&cv.bottom<=m.plot.bottom+4,`${type}: WebGL canvas escapes plot bounds`);
  }
  await screenshot(page.locator('#plot'),file);
}
async function researchDiagram(context,id,engine,file){
  const page=await context.newPage(),check=await attachDiagnostics(page,'research:'+id);
  await page.goto(`${BASE}/extensions/research-studio/index.html?template=${encodeURIComponent(id)}`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>!document.body.classList.contains('locked'),null,{timeout:10000});
  await page.click('#render');
  await page.waitForFunction(()=>{const s=document.querySelector('#status')?.textContent||'';return s.includes('已完成')||s.includes('無法產生');},null,{timeout:12000});
  const researchStatus=await page.locator('#status').textContent();
  const researchDiag=await page.evaluate(()=>({status:document.querySelector('#status')?.textContent,kind:document.querySelector('#kindName')?.textContent,selected:[...document.querySelectorAll('.catalog-item.active')].map(n=>n.dataset.id),svgEngine:document.querySelector('#stage svg')?.dataset.engine||'',svgCount:document.querySelectorAll('#stage svg').length}));
  console.log('RESEARCH-DIAG',id,JSON.stringify(researchDiag));
  if(!researchStatus?.includes('已完成')){await page.screenshot({path:path.join(OUT,`debug-research-${id}.png`),fullPage:true,animations:'disabled'});throw new Error(`${id}: Research Studio render failed: ${researchStatus}`);}
  const m=await page.evaluate(()=>{
    const stage=document.querySelector('#stage'),svg=stage?.querySelector('svg'),sr=svg?.getBoundingClientRect();
    const texts=svg?[...svg.querySelectorAll('text')].map(n=>{const r=n.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom};}):[];
    return {
      engine:svg?.dataset.engine||'',
      stage:stage&&{w:stage.clientWidth,h:stage.clientHeight},
      svg:sr&&{left:sr.left,top:sr.top,right:sr.right,bottom:sr.bottom,w:sr.width,h:sr.height},
      bad:svg?/NaN|Infinity|undefined/.test(svg.outerHTML):true,
      texts
    };
  });
  assert(m.engine===engine,`${id}: expected ${engine}, got ${m.engine||'none'}`);
  assert(m.stage?.w>300&&m.stage?.h>200,`${id}: invalid preview size`);
  assert(m.svg?.w>300&&m.svg?.h>200,`${id}: missing/undersized SVG`);
  assert(!m.bad,`${id}: SVG contains invalid numeric output`);
  for(const t of m.texts){
    assert(t.left>=m.svg.left-3&&t.right<=m.svg.right+3&&t.top>=m.svg.top-3&&t.bottom<=m.svg.bottom+3,`${id}: text clipped outside SVG`);
  }
  await assertNoBodyOverflow(page,'research:'+id,10);
  await screenshot(page.locator('#paper'),file);
  check();
  await page.close();
}

const browser=await chromium.launch({headless:false,args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
try{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await context.route(/https:\/\/cdn\.plot\.ly\/plotly-[^/]+\.min\.js/,route=>route.fulfill({status:200,contentType:'application/javascript',body:LOCAL_PLOTLY}));
  await context.addInitScript(hash=>{try{sessionStorage.setItem('visual-gate-session',hash);}catch{}},gateHash);

  const main=await context.newPage(),mainCheck=await attachDiagnostics(main,'main');
  await main.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await main.waitForFunction(()=>!document.body.classList.contains('locked'),null,{timeout:10000});
  await main.addScriptTag({content:LOCAL_PLOTLY.toString('utf8')});
  assert(await main.evaluate(()=>Boolean(window.Plotly?.newPlot)),'main: local Plotly injection failed');
  await assertNoBodyOverflow(main,'main',8);
  await mainChart(main,'parallel','main-parallel.png');
  await mainChart(main,'scatter3d','main-scatter3d.png');
  await main.selectOption('#chartType','bar');
  await main.click('#sample');
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(500);
  const insightUI=await main.evaluate(()=>({
    hidden:document.querySelector('#insightPanel')?.hidden,
    items:document.querySelectorAll('#insightPanel .insight-item').length,
    annotations:(document.querySelector('#plot')?.layout?.annotations||[]).map(a=>({text:a.text,ax:a.ax,ay:a.ay})),
    status:document.querySelector('#status')?.textContent||'',
    placement:Boolean(window.VCAnnotationLayout)
  }));
  assert(insightUI.hidden===false&&insightUI.items>=1,'bar: Auto Insight panel missing');
  assert(insightUI.annotations.length>=1,'bar: Plotly annotation missing');
  assert(insightUI.placement,'bar: Annotation Layout engine missing');
  assert(insightUI.annotations.some(a=>Number.isFinite(a.ax)&&Number.isFinite(a.ay)),'bar: annotation placement offsets missing');
  assert(insightUI.status.includes('洞察'),'bar: insight count missing from status');
  assert(insightUI.status.includes('標註配置'),'bar: annotation placement count missing from status');
  await screenshot(main.locator('#plot'),'main-bar-insight.png');
  const executiveUI=await main.evaluate(()=>({
    status:document.querySelector('#status')?.textContent||'',
    mode:document.querySelector('#executiveSummaryMode')?.value,
    disabled:document.querySelector('#executiveSummaryMode')?.disabled,
    kpiCards:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect').length,
    paperHeadings:(document.querySelector('#plot')?.layout?.annotations||[]).filter(a=>a.xref==='paper'&&Number(a.y)>1.2).length,
    sourceEngine:Boolean(window.VCExecutiveSummary)
  }));
  assert(executiveUI.sourceEngine,'bar: Executive Summary engine missing');
  assert(executiveUI.mode==='executive'&&!executiveUI.disabled,'bar: business mode should default to executive page');
  assert(executiveUI.status.includes('簡報頁'),'bar: executive-page status missing');
  assert(executiveUI.kpiCards>=2,'bar: KPI cards missing from Plotly layout');
  assert(executiveUI.paperHeadings>=1,'bar: executive headline missing');
  await screenshot(main.locator('#plot'),'main-executive-summary.png');

  const autoBarLayout=await main.evaluate(()=>({
    selected:document.querySelector('#executiveLayoutMode')?.value,
    xdomain:document.querySelector('#plot')?.layout?.xaxis?.domain||null,
    leftCards:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect'&&Number(s.x1)<=.26).length,
    status:document.querySelector('#status')?.textContent||''
  }));
  assert(autoBarLayout.selected==='auto','bar: executive layout selector should remain Auto');
  assert(autoBarLayout.xdomain&&autoBarLayout.xdomain[0]>=.34,'bar: Auto did not choose left-KPI domain');
  assert(autoBarLayout.leftCards>=2,'bar: left KPI cards missing');
  assert(autoBarLayout.status.includes('左 KPI + 右主圖'),'bar: resolved layout missing from status');
  await screenshot(main.locator('#plot'),'main-executive-left-kpi.png');

  await main.selectOption('#chartType','line');
  await main.click('#sample');
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(500);
  const autoTrend=await main.evaluate(()=>({
    xdomain:document.querySelector('#plot')?.layout?.xaxis?.domain||null,
    status:document.querySelector('#status')?.textContent||'',
    metricBlocks:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect'&&Number(s.x1)<=.23).length
  }));
  assert(autoTrend.xdomain&&autoTrend.xdomain[0]>=.30,'line: Auto did not choose trend-focus domain');
  assert(autoTrend.metricBlocks>=1,'line: large metric block missing');
  assert(autoTrend.status.includes('大數字 + 趨勢圖'),'line: trend-focus layout missing from status');
  await screenshot(main.locator('#plot'),'main-executive-trend-focus.png');

  await main.selectOption('#chartType','grouped_bar');
  await main.click('#sample');
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(500);
  const autoCompare=await main.evaluate(()=>({
    xdomain:document.querySelector('#plot')?.layout?.xaxis?.domain||null,
    status:document.querySelector('#status')?.textContent||'',
    rightCards:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect'&&Number(s.x0)>=.72).length
  }));
  assert(autoCompare.xdomain&&autoCompare.xdomain[1]<=.64,'grouped_bar: Auto did not choose split-compare domain');
  assert(autoCompare.rightCards>=2,'grouped_bar: right KPI cards missing');
  assert(autoCompare.status.includes('雙欄比較'),'grouped_bar: split-compare layout missing from status');
  await screenshot(main.locator('#plot'),'main-executive-split-compare.png');

  const stressData={
    type:'grouped_bar',
    title:'九大區域年度營運績效與跨區比較分析',
    headline:'這是一個刻意設計得非常長的商業結論標題用來驗證簡報版型在極端文字長度與多系列條件下仍然可以安全分行縮字並保留主圖閱讀空間',
    report:{source:'企業內部 ERP、CRM、營運週報與各區域彙整資料；'.repeat(12)},
    series:Array.from({length:9},(_,i)=>({name:'區域系列 '+(i+1),x:['Q1','Q2','Q3','Q4'],y:[10+i,18+i*2,15+i,22+i*2]}))
  };
  await main.selectOption('#chartType','grouped_bar');
  await main.fill('#input',JSON.stringify(stressData,null,2));
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(700);
  const qualityUI=await main.evaluate(()=>({
    status:document.querySelector('#status')?.textContent||'',
    engine:Boolean(window.VCExecutiveQuality),
    xdomain:document.querySelector('#plot')?.layout?.xaxis?.domain||null,
    topCards:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect'&&Number(s.y0)>1).length,
    headline:(document.querySelector('#plot')?.layout?.annotations||[]).find(a=>a.xref==='paper'&&Number(a.y)>=1.27&&String(a.text||'').includes('<b>'))?.text||'',
    source:(document.querySelector('#plot')?.layout?.annotations||[]).find(a=>String(a.text||'').startsWith('資料來源：'))?.text||'',
    legend:document.querySelector('#plot')?.layout?.legend||{},
    bad:/NaN|Infinity/.test(document.querySelector('#plot')?.innerHTML||'')
  }));
  assert(qualityUI.engine,'stress: Executive Quality v3 engine missing');
  assert(qualityUI.status.includes('版面品質'),'stress: quality score missing from status');
  assert(qualityUI.status.includes('修正'),'stress: quality fix count missing from status');
  assert(qualityUI.status.includes('KPI 上排 + 主圖'),'stress: unsafe split layout did not downgrade');
  assert(qualityUI.topCards>=2,'stress: safe top-KPI cards missing');
  assert(qualityUI.headline.includes('<br>'),'stress: long headline did not wrap');
  assert(qualityUI.source.length<160,'stress: long source was not shortened for presentation');
  assert(Number(qualityUI.legend?.font?.size)<=9,'stress: dense legend was not compacted');
  assert(!qualityUI.bad,'stress: rendered output contains invalid numeric content');
  await screenshot(main.locator('#plot'),'main-executive-quality-stress.png');

  await main.click('#sample');
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(500);

  await main.selectOption('#executiveLayoutMode','top_kpi');
  await main.waitForTimeout(900);
  const manualTop=await main.evaluate(()=>({
    selected:document.querySelector('#executiveLayoutMode')?.value,
    status:document.querySelector('#status')?.textContent||'',
    topCards:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect'&&Number(s.y0)>1).length,
    xdomain:document.querySelector('#plot')?.layout?.xaxis?.domain||null
  }));
  assert(manualTop.selected==='top_kpi','manual layout selector did not persist');
  assert(manualTop.topCards>=2,'manual top-KPI layout missing KPI cards');
  assert(manualTop.status.includes('KPI 上排 + 主圖'),'manual top-KPI layout missing from status');
  await screenshot(main.locator('#plot'),'main-executive-top-kpi.png');

  await main.selectOption('#executiveLayoutMode','auto');
  await main.waitForTimeout(700);

  await main.selectOption('#executiveSummaryMode','chart');
  await main.waitForTimeout(900);
  const chartOnly=await main.evaluate(()=>({
    status:document.querySelector('#status')?.textContent||'',
    mode:document.querySelector('#executiveSummaryMode')?.value,
    kpiCards:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect'&&Number(s.y0)>1).length
  }));
  assert(chartOnly.mode==='chart','bar: chart-only selector did not switch');
  assert(!chartOnly.status.includes('簡報頁'),'bar: chart-only mode still reports executive page');
  assert(chartOnly.kpiCards===0,'bar: KPI cards remained in chart-only mode');

  await main.selectOption('#executiveSummaryMode','executive');
  await main.waitForTimeout(900);
  const executiveBack=await main.evaluate(()=>({
    status:document.querySelector('#status')?.textContent||'',
    cards:(document.querySelector('#plot')?.layout?.shapes||[]).filter(s=>s.type==='rect').length,
    selected:document.querySelector('#executiveLayoutMode')?.value,
    xdomain:document.querySelector('#plot')?.layout?.xaxis?.domain||null
  }));
  assert(executiveBack.status.includes('簡報頁')&&executiveBack.cards>=2,'executive page did not restore after toggle');
  assert(executiveBack.selected==='auto','executive layout should remain Auto after mode toggle');
  assert(executiveBack.xdomain&&executiveBack.xdomain[1]<=.64,'grouped_bar should restore split-compare domain after toggle');
  await main.selectOption('#chartType','grouped_bar');
  await main.click('#sample');
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(500);
  const emphasisUI=await main.evaluate(()=>({
    status:document.querySelector('#status')?.textContent||'',
    opacities:(document.querySelector('#plot')?.data||[]).filter(t=>t.type==='bar').map(t=>t.opacity??1),
    engine:Boolean(window.VCEmphasis)
  }));
  assert(emphasisUI.engine,'grouped_bar: Emphasis engine missing');
  assert(emphasisUI.status.includes('主次層級'),'grouped_bar: hierarchy count missing from status');
  assert(new Set(emphasisUI.opacities).size>=2,'grouped_bar: series hierarchy not visible in Plotly data');
  await screenshot(main.locator('#plot'),'main-emphasis-grouped-bar.png');
  await main.selectOption('#chartType','line');
  await main.click('#sample');
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(500);
  const legendUI=await main.evaluate(()=>({
    status:document.querySelector('#status')?.textContent||'',
    direct:(document.querySelector('#plot')?.data||[]).filter(t=>t.type==='scatter'&&Array.isArray(t.text)&&t.text.some(Boolean)).map(t=>({name:t.name,last:t.text.at(-1),mode:t.mode})),
    marginRight:document.querySelector('#plot')?.layout?.margin?.r||0,
    engine:Boolean(window.VCLegendIntelligence)
  }));
  assert(legendUI.engine,'line: Legend Intelligence engine missing');
  assert(legendUI.status.includes('標籤策略'),'line: label strategy count missing from status');
  assert(legendUI.direct.length>=1,'line: direct end label missing');
  assert(legendUI.direct.every(x=>x.last===x.name),'line: direct end label mismatch');
  assert(legendUI.marginRight>=105,'line: no right margin for direct labels');
  await screenshot(main.locator('#plot'),'main-line-direct-labels.png');
  await main.evaluate(()=>VCStyle.set({theme:'mono'}));
  await main.selectOption('#chartType','grouped_bar');
  await main.click('#sample');
  await main.click('#generate');
  await main.waitForSelector('#plot .plot-container',{state:'visible',timeout:8000});
  await main.waitForTimeout(500);
  const a11yUI=await main.evaluate(()=>({
    status:document.querySelector('#status')?.textContent||'',
    patterns:(document.querySelector('#plot')?.data||[]).filter(t=>t.type==='bar').map(t=>t.marker?.pattern?.shape),
    engine:Boolean(window.VCAccessibility)
  }));
  assert(a11yUI.engine,'mono: Accessibility engine missing');
  assert(a11yUI.status.includes('可讀性'),'mono: accessibility adjustment count missing from status');
  assert(a11yUI.patterns.filter(Boolean).length>=2,'mono: bar patterns missing');
  await screenshot(main.locator('#plot'),'main-mono-accessibility.png');
  await main.evaluate(()=>VCStyle.set({theme:'executive'}));
  mainCheck();
  await main.close();

  await researchDiagram(context,'why','vc-diagram-v1','research-why.png');
  await researchDiagram(context,'concept','vc-diagram-network-v1','research-concept.png');
  await researchDiagram(context,'flowchart','vc-diagram-flow-v1','research-flowchart.png');
  await researchDiagram(context,'stakeholder_system_map','vc-diagram-stakeholder-v1','research-stakeholder.png');

  const handbook=await context.newPage(),handbookCheck=await attachDiagnostics(handbook,'handbook');
  await handbook.goto(BASE+'/guides/chart-handbook/index.html',{waitUntil:'domcontentloaded'});
  await handbook.waitForFunction(()=>document.querySelector('#count')?.textContent.includes('100 / 100'),null,{timeout:10000});
  assert(await handbook.getByText('進階色庫 · 40 色').count()===1,'handbook: 40-color appearance control missing');
  await assertNoBodyOverflow(handbook,'handbook',8);
  await screenshot(handbook.locator('main'),'handbook.png');
  handbookCheck();
  await handbook.close();

  console.log('PASS: browser visual smoke for main, 3D, parallel, Why, Concept, Flow, Stakeholder and handbook.');
}finally{
  await browser.close();
}
