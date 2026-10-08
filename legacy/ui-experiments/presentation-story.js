/* Business presentation storyline planner. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const KEY='visual-canvas-presentation-story-v1';
  const STORIES={
    problem_solution:{
      label:'問題解決提案',
      desc:'適合改善提案、顧問式簡報與決策會議',
      slides:[
        {stage:'01',role:'背景',question:'現在發生什麼？為什麼值得關注？',title:'先把情境與重要性講清楚',charts:['scqa_framework','line','bar']},
        {stage:'02',role:'問題',question:'真正的核心問題是什麼？',title:'把症狀收斂成一個核心問題',charts:['engineering_pareto','fishbone','cause_chain']},
        {stage:'03',role:'證據',question:'有什麼數據證明問題存在？',title:'用數據證明這不是感覺',charts:['bar','grouped_bar','line','table']},
        {stage:'04',role:'原因',question:'為什麼會發生？',title:'找到可被改善的根因',charts:['fishbone','cause_chain','scatter','heatmap']},
        {stage:'05',role:'方案',question:'我們準備怎麼解？',title:'提出具體且可執行的解法',charts:['process_flow','decision_tree','value_proposition_canvas']},
        {stage:'06',role:'效益',question:'做了之後會改善什麼？',title:'把效益轉成可以比較的結果',charts:['waterfall','grouped_bar','okr_framework']},
        {stage:'07',role:'執行',question:'誰在何時做什麼？',title:'把方案變成執行計畫',charts:['study_gantt','critical_path_plan','process_flow']},
        {stage:'08',role:'風險',question:'可能失敗在哪裡？如何降低風險？',title:'先回答評審或主管最可能的質疑',charts:['swot_analysis','tows_strategy','decision_tree']},
        {stage:'09',role:'行動',question:'現在希望聽眾做什麼？',title:'用一句話收斂決策與下一步',charts:['prep_framework','aida_framework','okr_framework']}
      ]
    },
    pitch:{
      label:'企劃／競賽提案',
      desc:'適合競賽、創新提案、商業企劃與專案簡報',
      slides:[
        {stage:'01',role:'一句話價值',question:'我們要解決誰的什麼問題？',title:'一句話說清楚提案價值',charts:['scqa_framework','value_proposition_canvas']},
        {stage:'02',role:'需求／痛點',question:'目標使用者現在卡在哪？',title:'先證明痛點是真實且重要的',charts:['bar','engineering_pareto','value_proposition_canvas']},
        {stage:'03',role:'洞察',question:'現有方法為什麼不夠？',title:'指出現況與缺口',charts:['comparison_matrix','porter_five_forces','pestel_analysis']},
        {stage:'04',role:'解決方案',question:'你的方案如何運作？',title:'讓評審一眼看懂方案機制',charts:['process_flow','sankey','business_model_canvas']},
        {stage:'05',role:'差異化',question:'為什麼是你這個方案？',title:'把優勢和替代方案放在同一張圖比較',charts:['comparison_matrix','swot_analysis','tows_strategy']},
        {stage:'06',role:'可行性',question:'資源、流程、合作與限制是否可落地？',title:'證明方案不是只有想法',charts:['business_model_canvas','process_flow','critical_path_plan']},
        {stage:'07',role:'效益／KPI',question:'成功要用什麼數字衡量？',title:'把成功定義成可追蹤的指標',charts:['okr_framework','waterfall','grouped_bar']},
        {stage:'08',role:'時程',question:'如何從試點走到落地？',title:'給出清楚的里程碑與驗證節奏',charts:['study_gantt','timeline','critical_path_plan']},
        {stage:'09',role:'收尾',question:'評審最後應記住什麼？',title:'重新講一次價值與下一步',charts:['prep_framework','aida_framework','scqa_framework']}
      ]
    },
    data_story:{
      label:'數據分析報告',
      desc:'適合營運分析、研究結果轉商業簡報與成效報告',
      slides:[
        {stage:'01',role:'問題',question:'這次分析要回答什麼？',title:'先界定一個清楚的決策問題',charts:['scqa_framework','prep_framework']},
        {stage:'02',role:'資料',question:'用了什麼資料？範圍與限制是什麼？',title:'先交代資料來源與邊界',charts:['table','timeline']},
        {stage:'03',role:'全貌',question:'整體數字長什麼樣？',title:'先讓聽眾看見整體分布與規模',charts:['histogram','box','bar']},
        {stage:'04',role:'比較',question:'哪些群組或期間不一樣？',title:'找出差距最大的位置',charts:['grouped_bar','box','comparison_matrix']},
        {stage:'05',role:'關係',question:'哪些因素一起變化？',title:'找出值得進一步解釋的關係',charts:['scatter','heatmap','bubble']},
        {stage:'06',role:'原因假設',question:'哪些機制可能解釋結果？',title:'從結果提出可驗證的原因假設',charts:['cause_chain','fishbone','argument_map']},
        {stage:'07',role:'洞察',question:'最重要的結論是什麼？',title:'把分析轉成一句可行動的洞察',charts:['waterfall','engineering_pareto','prep_framework']},
        {stage:'08',role:'建議',question:'因此應該做什麼？',title:'把洞察轉成具體決策',charts:['decision_tree','tows_strategy','process_flow']},
        {stage:'09',role:'追蹤',question:'接下來怎麼驗證是否有效？',title:'定義下一輪需要追蹤的 KPI',charts:['okr_framework','line','time_variance_audit']}
      ]
    }
  };
  let current='problem_solution',state={};
  try{
    const saved=JSON.parse(localStorage.getItem(KEY)||'null');
    if(saved&&STORIES[saved.current]){current=saved.current;state=saved.state||{};}
  }catch{}

  const host=document.createElement('section');host.id='presentationStory';host.className='presentation-story';
  const head=document.createElement('div');head.className='story-head';
  head.innerHTML='<div><span class="mode-eyebrow">STORYLINE</span><strong>商業簡報故事線</strong></div><button id="storyCollapse" type="button">收合</button>';
  const controls=document.createElement('div');controls.className='story-controls';
  const select=document.createElement('select');select.id='storyType';select.setAttribute('aria-label','簡報故事線');
  for(const [id,s] of Object.entries(STORIES)){const o=document.createElement('option');o.value=id;o.textContent=s.label;select.append(o);}
  const copy=document.createElement('button');copy.type='button';copy.id='copyStory';copy.textContent='複製大綱';
  controls.append(select,copy);
  const desc=document.createElement('p');desc.id='storyDesc';desc.className='story-desc';
  const list=document.createElement('div');list.id='storySlides';list.className='story-slides';
  host.append(head,controls,desc,list);

  function safe(s){return String(s??'');}
  function storyState(){return state[current]||(state[current]={});}
  function save(){try{localStorage.setItem(KEY,JSON.stringify({current,state}));}catch{}}
  function available(types){const set=new Set((typeof CHARTS!=='undefined'?CHARTS:[]).map(x=>x[0]));return types.filter(x=>set.has(x));}
  function chartName(type){return (typeof CHARTS!=='undefined'?new Map(CHARTS).get(type):null)||type;}

  function render(){
    const story=STORIES[current];select.value=current;desc.textContent=story.desc;
    list.replaceChildren();const st=storyState();
    story.slides.forEach((slide,i)=>{
      const row=document.createElement('article');row.className='story-slide';
      if(st[i]?.done)row.classList.add('done');
      const top=document.createElement('div');top.className='story-slide-top';
      const num=document.createElement('span');num.className='story-stage';num.textContent=slide.stage;
      const meta=document.createElement('div');meta.className='story-meta';
      const role=document.createElement('strong');role.textContent=slide.role;
      const q=document.createElement('small');q.textContent=slide.question;
      meta.append(role,q);
      const done=document.createElement('input');done.type='checkbox';done.checked=Boolean(st[i]?.done);done.setAttribute('aria-label','完成 '+slide.role);
      done.onchange=()=>{st[i]=st[i]||{};st[i].done=done.checked;save();row.classList.toggle('done',done.checked);};
      top.append(num,meta,done);

      const title=document.createElement('input');title.className='story-title-input';title.placeholder=slide.title;title.value=st[i]?.title||'';
      title.setAttribute('aria-label',slide.role+' 標題');title.oninput=()=>{st[i]=st[i]||{};st[i].title=title.value;save();};
      const takeaway=document.createElement('textarea');takeaway.className='story-takeaway';takeaway.placeholder='這頁的一句核心結論／takeaway';takeaway.value=st[i]?.takeaway||'';
      takeaway.setAttribute('aria-label',slide.role+' 核心結論');takeaway.oninput=()=>{st[i]=st[i]||{};st[i].takeaway=takeaway.value;save();};

      const charts=document.createElement('div');charts.className='story-chart-row';
      const types=available(slide.charts);
      const label=document.createElement('span');label.textContent='建議圖：';charts.append(label);
      types.forEach(type=>{const b=document.createElement('button');b.type='button';b.textContent=chartName(type);b.onclick=()=>openChart(type);charts.append(b);});
      const browse=document.createElement('button');browse.type='button';browse.className='story-browse';browse.textContent='看這頁其他適合圖';browse.onclick=()=>{window.VCTemplateLibrary?.showAdvisorTypes?.(types);$('templates')?.click();};charts.append(browse);
      row.append(top,title,takeaway,charts);list.append(row);
    });
  }
  function openChart(type){
    const card=[...document.querySelectorAll('.template-card')].find(c=>c.dataset.type===type);
    if(card){card.click();return;}
    const select=$('chartType');if(select){select.value=type;$('sample')?.click();}
  }
  async function copyOutline(){
    const story=STORIES[current],st=storyState();
    const lines=[story.label,''];
    story.slides.forEach((slide,i)=>{
      lines.push(slide.stage+'｜'+slide.role);
      lines.push('目的：'+slide.question);
      lines.push('標題：'+(st[i]?.title?.trim()||slide.title));
      if(st[i]?.takeaway?.trim())lines.push('核心結論：'+st[i].takeaway.trim());
      lines.push('建議圖表：'+available(slide.charts).map(chartName).join('、'),'');
    });
    const text=lines.join('\n');
    try{await navigator.clipboard.writeText(text);$('status').textContent='已複製 '+story.label+' 大綱。';}
    catch{$('status').textContent='瀏覽器未允許自動複製。';}
  }
  select.onchange=()=>{current=select.value;save();render();};
  copy.onclick=copyOutline;
  head.querySelector('#storyCollapse').onclick=()=>{host.classList.toggle('collapsed');head.querySelector('#storyCollapse').textContent=host.classList.contains('collapsed')?'展開':'收合';};

  function setVisible(mode){host.hidden=mode!=='business';}
  window.addEventListener('vc-work-mode-change',e=>setVisible(e.detail?.mode));
  const advanced=$('workflowAdvancedBody');if(advanced)advanced.append(host);else{const advisor=$('chartAdvisor');advisor?.insertAdjacentElement('afterend',host);}
  select.value=current;render();
  setVisible(window.VCTemplateLibrary?.getMode?.()||'business');
  window.VCPresentationStory={stories:STORIES,getCurrent:()=>current};
})();