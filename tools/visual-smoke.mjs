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
