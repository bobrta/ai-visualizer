/* Clean sidebar workflow: quick chart switching first, advanced tools out of the way. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const aside=document.querySelector('main > aside');
  if(!aside||$('workflowSidebar'))return;

  const wrapper=document.createElement('div');
  wrapper.id='workflowSidebar';
  wrapper.className='workflow-sidebar';

  const makeStep=(num,title,desc,open=true)=>{
    const section=document.createElement('section');
    section.className='workflow-step'+(open?' open':'');
    const head=document.createElement('button');
    head.type='button';
    head.className='workflow-step-head';
    head.innerHTML='<span class="workflow-num">'+num+'</span><span class="workflow-title"><strong>'+title+'</strong><small>'+desc+'</small></span><span class="workflow-chevron">⌄</span>';
    const body=document.createElement('div');
    body.className='workflow-step-body';
    head.onclick=()=>section.classList.toggle('open');
    section.append(head,body);
    return {section,body};
  };

  const categories=[
    {id:'all',label:'全部圖表',start:0,end:999},
    {id:'data',label:'數據圖表',start:0,end:29},
    {id:'learning',label:'學習理解',start:30,end:49},
    {id:'flow',label:'流程與時間',start:50,end:69},
    {id:'strategy',label:'商業策略',start:70,end:79},
    {id:'engineering',label:'工業工程',start:80,end:89},
    {id:'time',label:'時間管理',start:90,end:99}
  ];
  const categoryForType=type=>{
    const i=(typeof CHARTS!=='undefined'?CHARTS:[]).findIndex(x=>x[0]===type);
    return categories.find(c=>c.id!=='all'&&i>=c.start&&i<=c.end)?.id||'all';
  };

  const quick=document.createElement('section');
  quick.className='quick-chart-switcher';
  quick.innerHTML='<div class="quick-chart-head"><div><span class="mode-eyebrow">CHART SWITCHER</span><strong>快速換圖表</strong></div><small>選完立即載入，不用再按「範例」</small></div>';
  const quickGrid=document.createElement('div');quickGrid.className='quick-chart-grid';
  const cat=document.createElement('select');cat.id='quickChartCategory';cat.setAttribute('aria-label','圖表主題');
  for(const c of categories){const o=document.createElement('option');o.value=c.id;o.textContent=c.label;cat.append(o);}
  const pick=document.createElement('select');pick.id='quickChartSelect';pick.setAttribute('aria-label','快速選擇圖表');
  quickGrid.append(cat,pick);
  const quickHint=document.createElement('div');quickHint.className='quick-chart-hint';quickHint.textContent='切換圖表會載入該圖的範例欄位；原本資料不會自動轉成另一種圖的格式。';
  quick.append(quickGrid,quickHint);

  function fillQuick(category,preferred){
    const list=(typeof CHARTS!=='undefined'?CHARTS:[]).filter((_,i)=>{
      const c=categories.find(x=>x.id===category)||categories[0];
      return c.id==='all'||(i>=c.start&&i<=c.end);
    });
    pick.replaceChildren();
    for(const [type,name] of list){const o=document.createElement('option');o.value=type;o.textContent=name;pick.append(o);}
    if(preferred&&list.some(x=>x[0]===preferred))pick.value=preferred;
  }
  function syncQuick(type){
    if(!type)return;
    const category=categoryForType(type);
    if(cat.value!==category){cat.value=category;fillQuick(category,type);}
    else if([...pick.options].some(o=>o.value===type))pick.value=type;
  }
  cat.onchange=()=>{
    fillQuick(cat.value);
    if(pick.value)window.VCApplyTemplate?.(pick.value);
  };
  pick.onchange=()=>window.VCApplyTemplate?.(pick.value);
  window.addEventListener('vc-template-applied',e=>syncQuick(e.detail?.type));

  const step1=makeStep('01','選圖表','需要時開啟完整 100 圖圖庫',true);
  const step2=makeStep('02','填資料','修改欄位後直接產生',true);
  const step3=makeStep('03','外觀與報告','字級、配色、圖說與座標',false);
  const step4=makeStep('04','儲存與匯出','JSON、SVG、PNG、PDF',false);

  const move=(node,target)=>{if(node&&target&&!target.contains(node))target.append(node);};
  const closestP=id=>$(id)?.closest('p');
  const closestLabel=id=>$(id)?.closest('label');
  const closestDetails=id=>$(id)?.closest('details');

  move($('templates'),step1.body);
  move(closestP('fillMode'),step1.body);

  // Keep the original chartType select available to legacy code/tests, but remove it from the visible workflow.
  const chartLabel=$('chartType')?.previousElementSibling;
  chartLabel?.classList?.add('workflow-internal-control');
  $('chartType')?.classList?.add('workflow-internal-control');
  if($('chartType')?.nextElementSibling?.classList?.contains('hint'))$('chartType').nextElementSibling.classList.add('workflow-internal-control');

  move($('formPanel'),step2.body);
  move($('input'),step2.body);
  move(closestP('generate'),step2.body);
  move($('status'),step2.body);
  const statusNext=$('status')?.nextElementSibling;
  if(statusNext?.classList?.contains('hint'))move(statusNext,step2.body);
  move(closestP('copyCommand'),step2.body);

  move($('appearance'),step3.body);
  move(closestLabel('textScale'),step3.body);
  move(closestDetails('reportX'),step3.body);

  const downloadInfo=[...aside.querySelectorAll('details')].find(d=>d.querySelector('summary')?.textContent?.includes('下載格式'));
  move(downloadInfo,step4.body);
  const guide=[...aside.querySelectorAll('a')].find(a=>a.getAttribute('href')?.includes('chart-handbook'));
  if(guide)move(guide.closest('p')||guide,step4.body);
  move($('json'),step4.body);
  move($('exportFormat'),step4.body);
  move($('export'),step4.body);
  move($('pdfExport'),step4.body);

  const introTitle=aside.querySelector('h2');
  const introParagraph=[...aside.querySelectorAll(':scope > p')].find(p=>p.textContent.includes('點選架構填寫資料'));
  introTitle?.remove();
  introParagraph?.remove();

  const advanced=document.createElement('details');
  advanced.id='workflowAdvanced';
  advanced.className='workflow-advanced';
  const summary=document.createElement('summary');
  summary.innerHTML='<span><strong>進階工具</strong><small>專案、工作模式、選圖建議、研究／簡報流程</small></span><span class="advanced-chevron">⌄</span>';
  const advancedBody=document.createElement('div');advancedBody.id='workflowAdvancedBody';advancedBody.className='workflow-advanced-body';
  advanced.append(summary,advancedBody);

  wrapper.append(quick,step1.section,step2.section,step3.section,step4.section,advanced);
  aside.prepend(wrapper);

  const current=$('chartType')?.value||(typeof CHARTS!=='undefined'&&CHARTS[0]?.[0])||'';
  const currentCategory=categoryForType(current);
  cat.value=currentCategory;
  fillQuick(currentCategory,current);

  const updateType=()=>{
    const type=$('chartType')?.value;
    if(type)syncQuick(type);
  };
  $('templates')?.addEventListener('click',updateType);
  updateType();
})();