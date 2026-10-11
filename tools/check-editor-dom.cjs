'use strict';
const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=process.cwd();let checks=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
class LocalLoader extends ResourceLoader{fetch(url){const u=new URL(url);if(u.origin!=='https://visual.test')return null;const f=path.join(root,decodeURIComponent(u.pathname));return fs.existsSync(f)&&fs.statSync(f).isFile()?Promise.resolve(fs.readFileSync(f)):null;}}
async function open(route='/',storage={}){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!e.message.includes('Not implemented: navigation'))errors.push(e.message);});
 const dom=new JSDOM(fs.readFileSync(path.join(root,new URL(route,'https://visual.test').pathname.replace(/\/$/,'/index.html')),'utf8'),{
 url:'https://visual.test'+route,runScripts:'dangerously',resources:new LocalLoader(),pretendToBeVisual:true,virtualConsole:vc,
 beforeParse(w){
 w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.URL.createObjectURL=()=> 'blob:mock';w.URL.revokeObjectURL=()=>{};
 for(const [key,value]of Object.entries(storage))w.localStorage.setItem(key,value);
 w.HTMLElement.prototype.getBoundingClientRect=()=>({width:1000,height:700,left:0,top:0,right:1000,bottom:700});
 w.SVGElement.prototype.getBoundingClientRect=w.HTMLElement.prototype.getBoundingClientRect;
 w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};w.HTMLDialogElement.prototype.close=function(){this.open=false;};
 w.HTMLAnchorElement.prototype.click=function(){};
 w.Plotly={newPlot:async(id,data,layout)=>{const g=typeof id==='string'?w.document.getElementById(id):id;g.data=data;g.layout=layout;g._fullLayout=layout;g.on=()=>{};g.removeListener=()=>{};},relayout:async()=>{},restyle:async()=>{},react:async()=>{},purge:()=>{},Plots:{resize:()=>{}},toImage:async()=> 'data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg"></svg>')};
 }});
 await new Promise(resolve=>dom.window.addEventListener('load',resolve,{once:true}));await sleep(60);return {dom,w:dom.window,errors};
}
const ok=(v,msg)=>{assert(v,msg);checks++;};
function click(w,id){w.document.getElementById(id).click();}
function input(w,id,value){const e=w.document.getElementById(id);e.value=value;e.dispatchEvent(new w.Event('input',{bubbles:true}));}
(async()=>{
 let {dom,w,errors}=await open();const $=id=>w.document.getElementById(id);
 ok(!$('gate')&&!$('lockApp'),'main has no password or lock');ok(!w.document.body.classList.contains('locked'),'main direct entry');
 click(w,'generate');await sleep(50);ok(w.VCRenderValid,'mindmap completes');
 const original=$('input').value;Object.defineProperty(w.navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied');}}});click(w,'copyPrompt');await sleep(20);
 ok($('input').value===original,'clipboard denial leaves editor intact');ok($('clipboardFallback').open,'separate copy dialog');$('clipboardFallback').close();
 click(w,'codeMode');input(w,'input','{ unfinished');click(w,'saveDraft');const invalid=w.localStorage.getItem('visual-canvas-draft-v1');ok(JSON.parse(invalid).raw==='{ unfinished','invalid JSON saved');
 click(w,'clearDraft');await sleep(550);ok(!w.localStorage.getItem('visual-canvas-draft-v1'),'clear cancels timer');w.dispatchEvent(new w.Event('pagehide'));ok(!w.localStorage.getItem('visual-canvas-draft-v1'),'pagehide keeps draft cleared');
 w.VCApplyTemplate('mindmap');let before=w.document.querySelectorAll('.branch-editor').length;
 [...$('fields').querySelectorAll('button')].find(b=>b.textContent==='＋主要分支').click();ok(w.document.querySelectorAll('.branch-editor').length===before+1,'branch add');
 await w.VCEditorState.undo();ok(w.document.querySelectorAll('.branch-editor').length===before,'branch undo');await w.VCEditorState.redo();ok(w.document.querySelectorAll('.branch-editor').length===before+1,'branch redo');
 $('textScale').value='1.3';$('textScale').dispatchEvent(new w.Event('change',{bubbles:true}));await sleep(30);await w.VCEditorState.undo();ok(w.VCTypography.multiplier===1,'undo restores actual typography');
 w.VCApplyTemplate('bar');click(w,'generate');await sleep(50);ok(w.VCRenderValid&&$('plot').data.length>0,'Plotly configuration submitted (engine mocked)');
 input(w,'reportSource','測試來源');click(w,'generate');await sleep(50);ok(w.eval('chartData.report.source')==='測試來源','report field input reaches render');
 click(w,'export');await sleep(50);ok($('status').textContent.includes('16:9 簡報')&&!$('status').textContent.includes('undefined'),'export label defined');
 w.VCApplyTemplate('mindmap');ok($('reportSource').value==='','template resets report');click(w,'export');await sleep(20);ok($('status').textContent.includes('請先成功產生'),'stale export blocked');
 click(w,'codeMode');input(w,'input',JSON.stringify({type:'mindmap',title:'x'.repeat(201),branches:[]}));click(w,'generate');await sleep(20);ok($('status').textContent.includes('1–200'),'root limit');ok(!w.VCRenderValid,'failed render invalidates export');
 input(w,'input',JSON.stringify({type:'mindmap',title:'根',custom:'keep',description:'note',branches:[{title:'分支',children:[{title:'葉'}]}]}));click(w,'generate');await sleep(20);w.eval('sync()');ok(JSON.parse($('input').value).custom==='keep','node sync keeps command metadata');ok($('scene').querySelector('[aria-expanded][tabindex="0"]'),'keyboard branch control');
 w.VCApplyTemplate('bar');ok(!w.document.querySelector('#fields label label'),'no nested labels');
 ok([...w.document.querySelectorAll('#fields input[type=number]')].every(e=>e.step==='any'),'decimal scalar inputs');
 ok(errors.length===0,'no DOM exceptions: '+errors.join('; '));dom.window.close();
 ({dom,w,errors}=await open('/',{'visual-canvas-draft-v1':invalid}));ok(w.document.getElementById('input').value==='{ unfinished','invalid draft recovery');ok(!w.document.getElementById('input').hidden,'code mode recovery');dom.window.close();
 ({dom,w,errors}=await open('/?template=bar',{'visual-canvas-draft-v1':invalid}));ok(w.document.getElementById('chartType').value==='bar','explicit URL wins over draft');dom.window.close();
 ({dom,w,errors}=await open('/extensions/research-studio/index.html?template=why'));ok(!w.document.getElementById('password')&&!w.document.getElementById('lock'),'research has no gate');
 click(w,'render');await sleep(50);ok(w.document.querySelector('#stage svg'),'native diagram DOM renders');
 input(w,'search','why');ok(w.document.querySelectorAll('.catalog-item.active').length===1,'search keeps active item');
 w.document.getElementById('size').value='1600,1200';w.document.getElementById('size').dispatchEvent(new w.Event('change'));await sleep(50);ok(w.eval('lastDoc.presentation.width')===1600,'size rerenders');
 const out=w.eval('reportSVG().text');ok(out.includes('viewBox='),'report SVG supplies viewBox');
 click(w,'example');click(w,'svg');ok(w.document.getElementById('status').textContent.includes('先成功產生'),'research template invalidates export');
 ok(errors.length===0,'no research DOM errors: '+errors.join('; '));dom.window.close();
 console.log('PASS: '+checks+' DOM integration checks. Plotly and downloads mocked; browser visual QA remains separate.');
})().catch(e=>{console.error(e);process.exit(1);});
