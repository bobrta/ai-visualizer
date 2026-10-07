/* Sidebar workflow: reorganize existing controls without changing their IDs. */
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

  const step1=makeStep('01','選架構','先決定你要表達什麼',true);
  const step2=makeStep('02','填資料','輸入內容並產生圖形',true);
  const step3=makeStep('03','外觀與報告','字級、配色、圖說與座標',false);
  const step4=makeStep('04','儲存與匯出','JSON、SVG、PNG、PDF',false);

  const move=(node,target)=>{if(node&&target&&!target.contains(node))target.append(node);};
  const closestP=id=>$(id)?.closest('p');
  const closestLabel=id=>$(id)?.closest('label');
  const closestDetails=id=>$(id)?.closest('details');

  move($('templates'),step1.body);
  move(closestP('fillMode'),step1.body);
  const chartLabel=$('chartType')?.previousElementSibling;
  if(chartLabel?.tagName==='LABEL')move(chartLabel,step1.body);
  move($('chartType'),step1.body);
  if($('chartType')?.nextElementSibling?.classList?.contains('hint'))move($('chartType').nextElementSibling,step1.body);

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

  wrapper.append(step1.section,step2.section,step3.section,step4.section);
  aside.prepend(wrapper);

  const generate=$('generate');
  if(generate){
    const sticky=document.createElement('div');
    sticky.className='workflow-primary-action';
    const label=document.createElement('span');
    label.innerHTML='<strong>目前圖形</strong><small id="workflowCurrentType">準備產生</small>';
    const quick=document.createElement('button');
    quick.type='button';
    quick.className='primary';
    quick.textContent='產生圖形';
    quick.onclick=()=>generate.click();
    sticky.append(label,quick);
    aside.append(sticky);
  }

  const updateType=()=>{
    const select=$('chartType'),label=$('workflowCurrentType');
    if(label&&select)label.textContent=select.selectedOptions?.[0]?.textContent||'準備產生';
  };
  $('chartType')?.addEventListener('change',updateType);
  $('templates')?.addEventListener('click',updateType);
  updateType();
})();