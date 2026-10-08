/* Purpose-first workspace modes for business presentation, research and learning. */
'use strict';
(()=>{
  const MODE_KEY='visual-canvas-work-mode-v1';
  const $=id=>document.getElementById(id);
  const labels={
    business:{icon:'▰',title:'商業簡報',desc:'策略、比較、決策、KPI 與敘事',cta:'選商業圖表'},
    research:{icon:'⌁',title:'研究專題',desc:'資料、方法、流程、證據與分析',cta:'選研究圖表'},
    learning:{icon:'◎',title:'學習整理',desc:'概念、因果、公式、複習與考前整理',cta:'選學習圖表'},
    all:{icon:'⌘',title:'全功能',desc:'直接瀏覽全部 100 種架構',cta:'瀏覽全部'}
  };
  let mode='business';try{mode=localStorage.getItem(MODE_KEY)||'business';}catch{}
  if(!labels[mode])mode='business';

  const host=document.createElement('section');host.className='mode-panel';host.id='workModePanel';
  const top=document.createElement('div');top.className='mode-panel-head';
  top.innerHTML='<div><span class="mode-eyebrow">WORK MODE</span><strong>這次要完成什麼？</strong></div><span id="modeCurrent"></span>';
  const grid=document.createElement('div');grid.className='mode-grid';
  for(const [id,m] of Object.entries(labels)){
    const b=document.createElement('button');b.type='button';b.className='mode-card';b.dataset.mode=id;
    b.innerHTML='<span class="mode-icon">'+m.icon+'</span><span><strong>'+m.title+'</strong><small>'+m.desc+'</small></span>';
    b.onclick=()=>setMode(id,true);grid.append(b);
  }
  const context=document.createElement('div');context.className='mode-context';context.id='modeContext';
  host.append(top,grid,context);

  function setMode(next,openLibrary=false){
    mode=labels[next]?next:'business';
    try{localStorage.setItem(MODE_KEY,mode);}catch{}
    grid.querySelectorAll('.mode-card').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
    $('modeCurrent').textContent=labels[mode].title;
    const researchLink='extensions/research-studio/index.html';
    if(mode==='business')context.innerHTML='<strong>簡報建議流程</strong><span>問題 → 分析 → 比較 → 決策 → 行動</span><button type="button" id="modeAction">'+labels[mode].cta+'</button>';
    else if(mode==='research')context.innerHTML='<strong>研究建議流程</strong><span>問題 → 文獻/資料 → 方法 → 分析 → 結論</span><div><button type="button" id="modeAction">'+labels[mode].cta+'</button><a class="mode-link" href="'+researchLink+'">進入研究與報告工作室 ↗</a></div>';
    else if(mode==='learning')context.innerHTML='<strong>學習建議流程</strong><span>概念 → 關係 → 例子 → 主動提取 → 複習</span><button type="button" id="modeAction">'+labels[mode].cta+'</button>';
    else context.innerHTML='<strong>完整工具箱</strong><span>不篩選用途，直接查看全部架構。</span><button type="button" id="modeAction">'+labels[mode].cta+'</button>';
    $('modeAction')?.addEventListener('click',()=>{$('templates')?.click();});
    window.VCTemplateLibrary?.setMode(mode);
    window.dispatchEvent(new CustomEvent('vc-work-mode-change',{detail:{mode}}));
    if(openLibrary)$('templates')?.click();
  }

  const advanced=$('workflowAdvancedBody');
  const workflow=$('workflowSidebar');
  if(advanced)advanced.append(host);else if(workflow)workflow.append(host);else document.querySelector('main > aside')?.prepend(host);
  setMode(mode,false);
})();