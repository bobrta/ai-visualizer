/* Output format presets for presentations and research reports. */
'use strict';
(()=>{
  const KEY='visual-canvas-output-format-v1';
  const $=id=>document.getElementById(id);
  const PRESETS={
    slide_16_9:{label:'16:9 商業簡報',width:1920,height:1080,safe:.055,pdf:'slide_16_9'},
    slide_4_3:{label:'4:3 簡報',width:1600,height:1200,safe:.055,pdf:'slide_4_3'},
    a4_landscape:{label:'A4 橫式研究報告',width:3508,height:2480,safe:.06,pdf:'a4_landscape'},
    a4_portrait:{label:'A4 直式研究報告',width:2480,height:3508,safe:.06,pdf:'a4_portrait'},
    square:{label:'1:1 方形',width:1600,height:1600,safe:.055,pdf:'square'}
  };
  let preset='slide_16_9';
  try{preset=localStorage.getItem(KEY)||preset;}catch{}
  if(!PRESETS[preset])preset='slide_16_9';

  function mount(){
    const step=$('pdfExport')?.closest('.workflow-step-body');
    if(!step||$('outputFormatPanel'))return;
    const panel=document.createElement('div');panel.id='outputFormatPanel';panel.className='output-format-panel';
    panel.innerHTML='<strong>輸出版型</strong><select id="outputPreset" aria-label="輸出版型"></select><div class="output-size"><span id="outputDimensions"></span><span id="outputSafe"></span></div><label class="output-safe-toggle"><input id="showSafeArea" type="checkbox" checked> 顯示安全邊界</label>';
    const select=panel.querySelector('#outputPreset');
    for(const [id,p] of Object.entries(PRESETS)){const o=document.createElement('option');o.value=id;o.textContent=p.label;select.append(o);}
    select.value=preset;select.onchange=()=>setPreset(select.value,true);
    panel.querySelector('#showSafeArea').onchange=updatePreview;
    step.prepend(panel);
    updateInfo();updatePreview();
  }

  function setPreset(id,manual=false){
    if(!PRESETS[id])return;preset=id;
    try{localStorage.setItem(KEY,preset);}catch{}
    if($('outputPreset'))$('outputPreset').value=preset;
    updateInfo();updatePreview();
    if(manual){const s=$('status');if(s)s.textContent='輸出版型已切換為 '+PRESETS[preset].label+'。';}
  }
  function updateInfo(){
    const p=PRESETS[preset];
    if($('outputDimensions'))$('outputDimensions').textContent=p.width+' × '+p.height+' px';
    if($('outputSafe'))$('outputSafe').textContent='安全邊界 '+Math.round(p.safe*100)+'%';
  }
  function updatePreview(){
    const workspace=document.querySelector('.workspace');if(!workspace)return;
    let frame=$('outputPreviewFrame');
    if(!frame){frame=document.createElement('div');frame.id='outputPreviewFrame';frame.className='output-preview-frame';workspace.append(frame);}
    const p=PRESETS[preset],r=workspace.getBoundingClientRect(),pad=36,maxW=Math.max(120,r.width-pad*2),maxH=Math.max(120,r.height-pad*2),ratio=p.width/p.height;
    let w=maxW,h=w/ratio;if(h>maxH){h=maxH;w=h*ratio;}
    frame.style.width=w+'px';frame.style.height=h+'px';frame.style.left=((r.width-w)/2)+'px';frame.style.top=((r.height-h)/2)+'px';
    frame.style.setProperty('--safe',Math.round(p.safe*100)+'%');
    frame.classList.toggle('hide-safe',!($('showSafeArea')?.checked??true));
    frame.dataset.label=p.label;
  }
  function current(){return {id:preset,...PRESETS[preset]};}
  function applyMode(mode){
    if(mode==='business')setPreset('slide_16_9');
    else if(mode==='research')setPreset('a4_landscape');
  }
  window.addEventListener('resize',updatePreview);
  window.addEventListener('vc-work-mode-change',e=>applyMode(e.detail?.mode));
  window.VCOutputFormat={PRESETS,current,setPreset,updatePreview};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();