/* Goal-first chart advisor for business, research and learning. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const goals=[
    {id:'compare',label:'比較',hint:'方案、類別、前後差異'},
    {id:'trend',label:'趨勢',hint:'時間變化與成長'},
    {id:'cause',label:'原因',hint:'問題成因與因果'},
    {id:'relation',label:'關係',hint:'相關、流向與連結'},
    {id:'decision',label:'決策',hint:'選方案與排序'},
    {id:'story',label:'說服',hint:'簡報敘事與論證'},
    {id:'process',label:'流程',hint:'步驟、時程與交接'},
    {id:'distribution',label:'分布',hint:'離散、異常與變異'}
  ];
  const rules={
    business:{
      compare:['grouped_bar','bar','comparison_matrix','radar','waterfall'],
      trend:['line','area','stacked_area','waterfall','okr_dashboard'],
      cause:['fishbone','cause_chain','swot_analysis','pestel_analysis','porter_five_forces'],
      relation:['scatter','bubble','sankey','treemap','concept_map'],
      decision:['decision_tree','quadrant','tows_strategy','priority_eisenhower','priority_value_effort'],
      story:['scqa_framework','prep_framework','funnel','aida_funnel','waterfall'],
      process:['process_flow','sankey','timeline','study_gantt','critical_path_plan'],
      distribution:['histogram','box','violin','heatmap','engineering_pareto']
    },
    research:{
      compare:['box','grouped_bar','comparison_matrix','table','radar'],
      trend:['line','area','timeline','study_gantt','time_variance_audit'],
      cause:['cause_chain','fishbone','argument_map','engineering_pareto','concept_map'],
      relation:['scatter','bubble','heatmap','sankey','parallel'],
      decision:['decision_tree','comparison_matrix','quadrant','argument_map','table'],
      story:['argument_map','scqa_framework','concept_map','table','timeline'],
      process:['process_flow','study_gantt','critical_path_plan','sankey','timeline'],
      distribution:['histogram','box','violin','heatmap','process_capability']
    },
    learning:{
      compare:['comparison_matrix','venn','bar','radar','quadrant'],
      trend:['timeline','line','spaced_repetition','study_gantt','cycle_map'],
      cause:['cause_chain','fishbone','concept_map','argument_map','mindmap'],
      relation:['concept_map','mindmap','sankey','venn','hierarchy_map'],
      decision:['decision_tree','quadrant','comparison_matrix','argument_map','priority_eisenhower'],
      story:['prep_framework','scqa_framework','argument_map','exam_overview','cornell_notes'],
      process:['process_flow','cycle_map','timeline','study_gantt','hierarchy_map'],
      distribution:['histogram','box','heatmap','table','quadrant']
    },
    all:{}
  };
  const why={
    grouped_bar:'適合並排比較多個方案或類別。',
    line:'最適合呈現時間趨勢。',
    scatter:'用來看兩個連續變數的關係。',
    box:'快速比較中位數、離散程度與異常值。',
    fishbone:'把問題原因拆成可討論的分類。',
    decision_tree:'把條件與選擇路徑畫清楚。',
    scqa_framework:'適合商業簡報的問題—答案敘事。',
    process_flow:'把 SOP 或方法步驟說清楚。',
    comparison_matrix:'多準則比較方案時最直觀。',
    argument_map:'整理主張、證據與反駁。',
    sankey:'適合資源、流程或流量去向。',
    histogram:'看資料分布與集中程度。',
    heatmap:'多變數或矩陣關係一眼比較。',
    waterfall:'解釋數值如何一步步增減。',
    timeline:'把事件先後順序說清楚。'
  };
  const host=document.createElement('section');host.className='chart-advisor';host.id='chartAdvisor';
  host.innerHTML='<div class="advisor-head"><div><span class="mode-eyebrow">CHART ADVISOR</span><strong>你現在想表達什麼？</strong></div><button id="advisorReset" type="button">重設</button></div><div id="advisorGoals" class="advisor-goals"></div><div id="advisorResult" class="advisor-result"><span>選一個目的，我會縮成 3–5 個適合的圖。</span></div>';
  const goalsHost=host.querySelector('#advisorGoals');
  for(const g of goals){const b=document.createElement('button');b.type='button';b.dataset.goal=g.id;b.innerHTML='<strong>'+g.label+'</strong><small>'+g.hint+'</small>';b.onclick=()=>choose(g.id);goalsHost.append(b);}
  function choose(goal){
    goalsHost.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.goal===goal));
    const mode=window.VCTemplateLibrary?.getMode?.()||'business';
    const group=rules[mode]||rules.business;
    let picks=group[goal]||rules.business[goal]||[];
    const available=new Set((typeof CHARTS!=='undefined'?CHARTS:[]).map(x=>x[0]));
    picks=picks.filter(x=>available.has(x)).slice(0,5);
    const names=new Map((typeof CHARTS!=='undefined'?CHARTS:[]));
    const box=$('advisorResult');box.replaceChildren();
    for(const type of picks){const row=document.createElement('button');row.type='button';row.className='advisor-pick';row.innerHTML='<strong>'+escapeHtml(names.get(type)||type)+'</strong><small>'+escapeHtml(why[type]||'符合目前用途與工作模式。')+'</small>';row.onclick=()=>{const card=[...document.querySelectorAll('.template-card')].find(c=>c.dataset.type===type);card?.click();};box.append(row);}
    window.VCTemplateLibrary?.showAdvisorTypes?.(picks);
    $('templates')?.click();
  }
  function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  host.querySelector('#advisorReset').onclick=()=>{goalsHost.querySelectorAll('button').forEach(b=>b.classList.remove('active'));$('advisorResult').innerHTML='<span>選一個目的，我會縮成 3–5 個適合的圖。</span>';window.VCTemplateLibrary?.showRecommended?.();};
  const advanced=$('workflowAdvancedBody');if(advanced)advanced.append(host);else{const modePanel=$('workModePanel');modePanel?.insertAdjacentElement('afterend',host);}
})();