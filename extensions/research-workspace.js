/* Research project workspace: question -> literature -> hypothesis -> method -> analysis -> results -> limitations -> conclusion. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const KEY='visual-canvas-research-workspace-v1';
  const STEPS=[
    {id:'question',n:'01',title:'研究問題',prompt:'我要回答的核心問題是什麼？',hint:'把題目寫成可被資料回答的問題，避免只寫大方向。',charts:['mindmap','concept_map','scqa_framework'],studio:['tree']},
    {id:'evidence',n:'02',title:'文獻／資料',prompt:'目前已有什麼證據？資料從哪裡來？',hint:'記錄文獻來源、資料範圍、時間、樣本與重要限制。',charts:['table','comparison_matrix','timeline','argument_map'],studio:['forest','network']},
    {id:'hypothesis',n:'03',title:'假設與變數',prompt:'預期哪些變數有什麼關係？',hint:'清楚定義自變數、依變數、控制條件；探索性研究可寫研究命題。',charts:['concept_map','cause_chain','argument_map','scatter'],studio:['network']},
    {id:'method',n:'04',title:'研究方法',prompt:'我要怎麼蒐集與分析資料？',hint:'交代對象、流程、量測方式、工具、比較設計與分析方法。',charts:['process_flow','decision_tree','study_gantt'],studio:['flowchart','sequence','gantt']},
    {id:'analysis',n:'05',title:'資料分析',prompt:'哪些分析最能回答研究問題？',hint:'先看資料品質與分布，再做比較、關係或趨勢分析。',charts:['histogram','box','scatter','heatmap','engineering_pareto','process_capability'],studio:['errorbar','dumbbell','pareto','control']},
    {id:'results',n:'06',title:'研究結果',prompt:'資料實際顯示了什麼？',hint:'先描述結果，再解釋；不要把相關直接寫成因果。',charts:['grouped_bar','line','box','scatter','waterfall','table'],studio:['errorbar','forest','dumbbell']},
    {id:'limitations',n:'07',title:'限制與替代解釋',prompt:'這個結果還可能怎麼解釋？',hint:'樣本、測量、選樣、外部效度、未控制變數都可能影響結論。',charts:['argument_map','fishbone','decision_tree','swot_analysis'],studio:['tree']},
    {id:'conclusion',n:'08',title:'結論與下一步',prompt:'可以合理下什麼結論？下一步要驗證什麼？',hint:'讓結論只回答資料支持的範圍，並留下後續驗證或應用方向。',charts:['prep_framework','scqa_framework','okr_framework','process_flow'],studio:['gantt','flowchart']}
  ];
  let data={};
  try{data=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch{}
  const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data));}catch{}};

  const host=document.createElement('section');host.id='researchWorkspace';host.className='research-workspace';
  host.innerHTML='<div class="research-head"><div><span class="mode-eyebrow">RESEARCH WORKSPACE</span><strong>研究專題工作區</strong><small id="researchProgress"></small></div><div><button id="researchCopy" type="button">複製研究大綱</button><button id="researchCollapse" type="button">收合</button></div></div><div class="research-progress"><span id="researchProgressBar"></span></div><div id="researchSteps" class="research-steps"></div>';
  const stepsHost=host.querySelector('#researchSteps');

  const mainNames=()=>new Map(typeof CHARTS!=='undefined'?CHARTS:[]);
  function openMain(type){
    const card=[...document.querySelectorAll('.template-card')].find(c=>c.dataset.type===type);
    if(card){card.click();return;}
    if($('chartType')){$('chartType').value=type;$('sample')?.click();}
  }
  function studioUrl(type){return 'extensions/research-studio/index.html?template='+encodeURIComponent(type);}
  function updateProgress(){
    const done=STEPS.filter(s=>data[s.id]?.done).length,p=Math.round(done/STEPS.length*100);
    $('researchProgress').textContent=done+' / '+STEPS.length+' 完成';
    $('researchProgressBar').style.width=p+'%';
  }
  function render(){
    stepsHost.replaceChildren();const names=mainNames();
    STEPS.forEach(step=>{
      const state=data[step.id]||(data[step.id]={});
      const card=document.createElement('article');card.className='research-step'+(state.done?' done':'');
      const head=document.createElement('div');head.className='research-step-head';
      const num=document.createElement('span');num.className='research-step-num';num.textContent=step.n;
      const meta=document.createElement('div');meta.className='research-step-meta';
      const title=document.createElement('strong');title.textContent=step.title;
      const q=document.createElement('small');q.textContent=step.prompt;meta.append(title,q);
      const check=document.createElement('input');check.type='checkbox';check.checked=Boolean(state.done);check.setAttribute('aria-label','完成 '+step.title);
      check.onchange=()=>{state.done=check.checked;save();card.classList.toggle('done',state.done);updateProgress();};
      head.append(num,meta,check);

      const note=document.createElement('textarea');note.className='research-note';note.placeholder=step.hint;note.value=state.note||'';note.setAttribute('aria-label',step.title+'筆記');
      note.oninput=()=>{state.note=note.value;save();};

      const decision=document.createElement('input');decision.className='research-decision';decision.placeholder='這一步目前的關鍵決定／結論';decision.value=state.decision||'';decision.setAttribute('aria-label',step.title+'關鍵決定');
      decision.oninput=()=>{state.decision=decision.value;save();};

      const tools=document.createElement('div');tools.className='research-tools';
      const l1=document.createElement('span');l1.textContent='主工作台：';tools.append(l1);
      step.charts.filter(t=>names.has(t)).forEach(type=>{const b=document.createElement('button');b.type='button';b.textContent=names.get(type);b.onclick=()=>openMain(type);tools.append(b);});
      if(step.studio?.length){
        const l2=document.createElement('span');l2.className='research-studio-label';l2.textContent='Research Studio：';tools.append(l2);
        step.studio.forEach(type=>{const item=window.RESEARCH_CATALOG?.find?.(x=>x.id===type);const a=document.createElement('a');a.href=studioUrl(type);a.textContent=item?.name||type;a.target='_self';tools.append(a);});
      }
      card.append(head,note,decision,tools);stepsHost.append(card);
    });
    updateProgress();
  }
  async function copyOutline(){
    const lines=['研究專題大綱',''];
    STEPS.forEach(step=>{const s=data[step.id]||{};lines.push(step.n+'｜'+step.title);lines.push('核心問題：'+step.prompt);if(s.note?.trim())lines.push('目前內容：'+s.note.trim());if(s.decision?.trim())lines.push('關鍵決定：'+s.decision.trim());lines.push('狀態：'+(s.done?'完成':'進行中'),'');});
    try{await navigator.clipboard.writeText(lines.join('\n'));$('status').textContent='已複製研究專題大綱。';}catch{$('status').textContent='瀏覽器未允許自動複製。';}
  }
  host.querySelector('#researchCopy').onclick=copyOutline;
  host.querySelector('#researchCollapse').onclick=()=>{host.classList.toggle('collapsed');host.querySelector('#researchCollapse').textContent=host.classList.contains('collapsed')?'展開':'收合';};
  function visible(mode){host.hidden=mode!=='research';}
  window.addEventListener('vc-work-mode-change',e=>visible(e.detail?.mode));
  const advisor=$('chartAdvisor');advisor?.insertAdjacentElement('afterend',host);
  render();visible(window.VCTemplateLibrary?.getMode?.()||'business');
  window.VCResearchWorkspace={steps:STEPS,getData:()=>structuredClone(data)};
})();