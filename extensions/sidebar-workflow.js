/* Simple workbench shell: keep chart selection, data entry and export close to the canvas. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const aside=document.querySelector('main > aside');
  if(!aside||$('simpleWorkbench'))return;

  const move=(node,target)=>{if(node&&target&&!target.contains(node))target.append(node);};
  const closestP=id=>$(id)?.closest('p');
  const closestLabel=id=>$(id)?.closest('label');
  const closestDetails=id=>$(id)?.closest('details');

  const shell=document.createElement('div');
  shell.id='simpleWorkbench';
  shell.className='simple-workbench';

  const picker=document.createElement('section');
  picker.className='workbench-picker';
  picker.innerHTML='<div class="workbench-picker-head"><div><span class="workbench-eyebrow">CURRENT CHART</span><strong id="workbenchChartName">圖表</strong></div><button id="workbenchChooseChart" class="primary" type="button">選擇圖表</button></div><p>以卡片選擇圖表；選完會直接載入可編輯範例。</p>';

  const editor=document.createElement('section');
  editor.className='workbench-editor';
  const editorTop=document.createElement('div');
  editorTop.className='workbench-editor-top';
  editorTop.innerHTML='<div><span class="workbench-eyebrow">DATA</span><strong>資料與指令</strong></div>';
  const modeHost=document.createElement('div');
  modeHost.className='workbench-mode-tabs';
  const fillP=closestP('fillMode');
  if(fillP){
    const fill=$('fillMode'),code=$('codeMode');
    if(fill)modeHost.append(fill);
    if(code)modeHost.append(code);
    fillP.remove();
  }
  editorTop.append(modeHost);
  editor.append(editorTop);

  move($('formPanel'),editor);
  move($('input'),editor);

  const actionRow=closestP('generate');
  if(actionRow){actionRow.className='workbench-action-row';move(actionRow,editor);}
  move($('status'),editor);

  const secondary=closestP('copyCommand');
  if(secondary){
    secondary.className='workbench-secondary-row';
    move(secondary,editor);
  }

  const settings=document.createElement('details');
  settings.className='workbench-settings';
  settings.innerHTML='<summary><span><strong>外觀與報告</strong><small>字體、配色、字級與圖說</small></span><span>⌄</span></summary><div class="workbench-settings-body"></div>';
  const settingsBody=settings.querySelector('.workbench-settings-body');
  move($('appearance'),settingsBody);
  move(closestLabel('textScale'),settingsBody);
  move(closestLabel('executiveSummaryMode'),settingsBody);
  move(closestLabel('executiveLayoutMode'),settingsBody);
  move(closestDetails('reportX'),settingsBody);

  const diagnostics=document.createElement('details');
  diagnostics.className='workbench-diagnostics';
  diagnostics.innerHTML='<summary><span><strong>檢查與洞察</strong><small>需要時再打開</small></span><span>⌄</span></summary><div class="workbench-diagnostics-body"></div>';
  const diagnosticsBody=diagnostics.querySelector('.workbench-diagnostics-body');
  move($('insightPanel'),diagnosticsBody);
  move($('guardrailPanel'),diagnosticsBody);

  const exports=document.createElement('section');
  exports.className='workbench-export';
  exports.innerHTML='<div><span class="workbench-eyebrow">EXPORT</span><strong>儲存與匯出</strong></div>';
  const exportRow=document.createElement('div');
  exportRow.className='workbench-export-row';
  move($('json'),exportRow);
  move($('exportFormat'),exportRow);
  move($('export'),exportRow);
  move($('pdfExport'),exportRow);
  exports.append(exportRow);

  const chartType=$('chartType');
  const chartLabel=chartType?.previousElementSibling;
  if(chartLabel?.tagName==='LABEL')chartLabel.hidden=true;
  if(chartType)chartType.hidden=true;
  const typeHint=chartType?.nextElementSibling;
  if(typeHint?.classList?.contains('hint'))typeHint.hidden=true;

  const introTitle=aside.querySelector('h2');
  const introParagraph=[...aside.querySelectorAll(':scope > p')].find(p=>p.textContent.includes('點選架構填寫資料'));
  introTitle?.remove();
  introParagraph?.remove();

  const downloadInfo=[...aside.querySelectorAll('details')].find(d=>d.querySelector('summary')?.textContent?.includes('下載格式'));
  downloadInfo?.remove();
  const guide=[...aside.querySelectorAll('a')].find(a=>a.getAttribute('href')?.includes('chart-handbook'));
  guide?.closest('p')?.remove();

  shell.append(picker,editor,settings,diagnostics,exports);
  aside.prepend(shell);

  $('workbenchChooseChart').onclick=()=>$('templates')?.click();

  const updateChartName=()=>{
    const name=$('chartType')?.selectedOptions?.[0]?.textContent||'圖表';
    const el=$('workbenchChartName');if(el)el.textContent=name;
  };
  $('chartType')?.addEventListener('change',updateChartName);
  window.addEventListener('vc-template-applied',updateChartName);
  updateChartName();

  // Keep diagnostics visually quiet until there is something useful to show.
  const observer=new MutationObserver(()=>{
    const visible=[...diagnosticsBody.children].some(el=>!el.hidden&&el.textContent.trim());
    diagnostics.hidden=!visible;
  });
  observer.observe(diagnosticsBody,{subtree:true,childList:true,attributes:true,characterData:true});
  diagnostics.hidden=true;
})();