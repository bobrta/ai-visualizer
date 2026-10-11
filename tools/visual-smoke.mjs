import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const ROOT=process.cwd();
const BASE=process.env.VC_BASE_URL||'http://127.0.0.1:4173';
const OUT=path.join(ROOT,'artifacts','visual');
fs.mkdirSync(OUT,{recursive:true});
const LOCAL_PLOTLY=fs.readFileSync(path.join(ROOT,'node_modules','plotly.js-dist-min','plotly.min.js'));

function assert(value,message){if(!value)throw new Error(message);}
async function attachDiagnostics(page,name){
  const errors=[];
  page.on('pageerror',e=>errors.push('pageerror: '+e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push('console.error: '+m.text());});
  page.on('requestfailed',r=>errors.push('requestfailed: '+r.url()+' :: '+(r.failure()?.errorText||'')));
  return ()=>{if(errors.length)throw new Error(name+' browser errors:\n'+errors.join('\n'));};
}
async function assertNoBodyOverflow(page,label,slack=8){
  const m=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
  assert(m.scroll<=m.client+slack,`${label}: horizontal page overflow ${m.scroll} > ${m.client}`);
}
async function screenshot(locator,file){
  await locator.screenshot({path:path.join(OUT,file),animations:'disabled'});
}

const browser=await chromium.launch({headless:false,args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
try{
  const context=await browser.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1});
  await context.route(/https:\/\/cdn\.plot\.ly\/plotly-[^/]+\.min\.js/,route=>route.fulfill({status:200,contentType:'application/javascript',body:LOCAL_PLOTLY}));

  const main=await context.newPage(),mainCheck=await attachDiagnostics(main,'main');
  await main.goto(BASE+'/',{waitUntil:'domcontentloaded'});
  await main.addScriptTag({content:LOCAL_PLOTLY.toString('utf8')});
  assert(await main.evaluate(()=>!document.body.classList.contains('locked')),'main: password gate should be removed');
  assert(await main.locator('#templates').isVisible(),'main: workbench did not open directly');
  assert(await main.locator('#lockApp').count()===0,'main: lock button should be removed');

  await main.click('#templates');
  await main.waitForSelector('#library[open]',{state:'visible',timeout:5000});
  await main.locator('.category-tab[data-category="time"]').click();
  assert(await main.locator('.template-card:not([hidden])').count()>0,'main: time-management category should contain charts');
  await main.locator('.category-tab[data-category="all"]').click();
  await main.locator('.template-card[data-type="bar"]').click();
  await main.waitForFunction(()=>document.querySelector('#chartType')?.value==='bar',null,{timeout:5000});

  await main.click('#codeMode');
  const pasted={type:'bar',title:'JSON 貼上回歸測試',x:['A','B'],y:[1,2]};
  await main.evaluate(text=>{const el=document.querySelector('#input');el.value=text;el.dispatchEvent(new Event('paste',{bubbles:true}));},JSON.stringify(pasted));
  await main.waitForFunction(()=>document.querySelector('#plot')?.data?.[0]?.type==='bar'&&String(document.querySelector('#plot')?.layout?.title?.text||'').includes('JSON 貼上回歸測試'),null,{timeout:10000});

  await main.click('#fillMode');
  const titleField=main.locator('#fields input[aria-label="圖形標題"]');
  await titleField.fill('文字輸入即時更新測試');
  await main.waitForFunction(()=>String(document.querySelector('#plot')?.layout?.title?.text||'').includes('文字輸入即時更新測試'),null,{timeout:10000});
  assert(await main.locator('#appearance .font-select option').count()===5,'main: expected five font choices');
  await screenshot(main.locator('#plot'),'main-json-live.png');
  await assertNoBodyOverflow(main,'main');
  mainCheck();

  const guide=await context.newPage(),guideCheck=await attachDiagnostics(guide,'chart-guide');
  await guide.goto(BASE+'/guides/chart-handbook/',{waitUntil:'domcontentloaded'});
  assert(await guide.locator('#guideFont option').count()===5,'chart-guide: expected five font choices');
  assert(await guide.locator('#charts .chart-card').count()>0,'chart-guide: chart cards missing');
  await guide.click('#intentGrid .intent[data-intent="compare"]');
  await guide.waitForFunction(()=>document.querySelectorAll('#recommendGrid .recommend-card').length>0,null,{timeout:5000});
  await screenshot(guide.locator('main'),'chart-guide.png');
  await assertNoBodyOverflow(guide,'chart-guide');
  guideCheck();

  const research=await context.newPage(),researchCheck=await attachDiagnostics(research,'research');
  await research.goto(BASE+'/extensions/research-studio/index.html?template=errorbar',{waitUntil:'domcontentloaded'});
  assert(await research.evaluate(()=>!document.body.classList.contains('locked')),'research: password gate should be removed');
  assert(await research.locator('#lock').count()===0,'research: lock button should be removed');
  await research.waitForSelector('#json',{state:'visible',timeout:10000});
  await research.click('#render');
  await research.waitForFunction(()=>{const s=document.querySelector('#status')?.textContent||'';return s.includes('已完成')||s.includes('無法產生');},null,{timeout:15000});
  assert((await research.locator('#status').textContent())?.includes('已完成'),'research: initial render failed');
  await research.fill('#title','研究文字即時更新測試');
  await research.waitForFunction(()=>document.querySelector('#figureTitle')?.textContent==='研究文字即時更新測試',null,{timeout:10000});
  const liveDoc=await research.evaluate(()=>{const d=JSON.parse(document.querySelector('#json').value);d.title='研究 JSON 貼上更新測試';return JSON.stringify(d);});
  await research.evaluate(text=>{const el=document.querySelector('#json');el.value=text;el.dispatchEvent(new Event('paste',{bubbles:true}));},liveDoc);
  await research.waitForFunction(()=>document.querySelector('#figureTitle')?.textContent==='研究 JSON 貼上更新測試',null,{timeout:10000});
  assert(await research.locator('#appearance .font-select option').count()===5,'research: expected five font choices');
  await screenshot(research.locator('#paper'),'research-live.png');
  await assertNoBodyOverflow(research,'research');
  researchCheck();

  await context.close();
}finally{
  await browser.close();
}
console.log('PASS: public no-gate visual smoke.');
