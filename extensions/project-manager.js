/* Project manager: multi-project, multi-chart local workspace. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const STORE='visual-canvas-projects-v1', ACTIVE='visual-canvas-active-project-v1';
  const MODE='visual-canvas-work-mode-v1', OUTPUT='visual-canvas-output-format-v1';
  const STORY='visual-canvas-presentation-story-v1', RESEARCH='visual-canvas-research-workspace-v1';
  let db={version:1,projects:{}},active=null;
  const now=()=>new Date().toISOString();
  const uid=()=>Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);
  const safeParse=(s,fallback=null)=>{try{return JSON.parse(s);}catch{return fallback;}};
  function load(){
    try{db=safeParse(localStorage.getItem(STORE),db)||db;active=localStorage.getItem(ACTIVE)||null;}catch{}
    if(!db.projects||typeof db.projects!=='object')db={version:1,projects:{}};
    if(active&&!db.projects[active])active=null;
  }
  function persist(){try{localStorage.setItem(STORE,JSON.stringify(db));if(active)localStorage.setItem(ACTIVE,active);else localStorage.removeItem(ACTIVE);}catch(e){status('專案儲存失敗：瀏覽器空間可能不足。');}}
  function status(msg){const s=$('status');if(s)s.textContent=msg;}
  function project(){return active?db.projects[active]:null;}
  function snapshotContext(){
    return {
      mode:localStorage.getItem(MODE)||window.VCTemplateLibrary?.getMode?.()||'business',
      output:localStorage.getItem(OUTPUT)||window.VCOutputFormat?.current?.().id||'slide_16_9',
      story:safeParse(localStorage.getItem(STORY),null),
      research:safeParse(localStorage.getItem(RESEARCH),null)
    };
  }
  function restoreContext(ctx){
    if(!ctx)return;
    try{
      if(ctx.mode)localStorage.setItem(MODE,ctx.mode);
      if(ctx.output)localStorage.setItem(OUTPUT,ctx.output);
      if(ctx.story)localStorage.setItem(STORY,JSON.stringify(ctx.story)); else localStorage.removeItem(STORY);
      if(ctx.research)localStorage.setItem(RESEARCH,JSON.stringify(ctx.research)); else localStorage.removeItem(RESEARCH);
    }catch{}
    if(ctx.output)window.VCOutputFormat?.setPreset?.(ctx.output);
    if(ctx.mode)window.VCTemplateLibrary?.setMode?.(ctx.mode);
  }
  function createProject(name){
    const title=String(name||'').trim().slice(0,80);if(!title)return null;
    const id=uid();db.projects[id]={id,name:title,createdAt:now(),updatedAt:now(),items:[],context:snapshotContext(),notes:''};active=id;persist();render();status('已建立專案「'+title+'」。');return id;
  }
  function saveProjectContext(){
    const p=project();if(!p)return;
    p.context=snapshotContext();p.updatedAt=now();persist();renderSummary();
  }
  function currentVisual(){
    let data;
    try{
      if(typeof formMode!=='undefined'&&formMode&&typeof collectForm==='function')data=collectForm();
      else data=JSON.parse($('input')?.value||'');
    }catch(e){throw Error('目前圖表資料無法讀取：'+e.message);}
    if(!data||typeof data!=='object')throw Error('目前沒有可保存的圖表。');
    const type=data.schema_version==='1.0'?'mindmap':data.type||'unknown';
    const title=String(data.title||$('chartType')?.selectedOptions?.[0]?.textContent||'未命名圖表').trim().slice(0,120);
    const report={x_label:$('reportX')?.value||'',y_label:$('reportY')?.value||'',caption:$('reportCaption')?.value||'',source:$('reportSource')?.value||''};
    if(Object.values(report).some(Boolean))data.report={...(data.report||{}),...Object.fromEntries(Object.entries(report).filter(([,v])=>String(v).trim()))};
    return {id:uid(),title,type,data:structuredClone(data),createdAt:now(),updatedAt:now(),output:window.VCOutputFormat?.current?.().id||localStorage.getItem(OUTPUT)||'slide_16_9'};
  }
  function addCurrent(){
    const p=project();if(!p){status('請先建立或選擇一個專案。');return;}
    try{const item=currentVisual();p.items.push(item);p.context=snapshotContext();p.updatedAt=now();persist();render();status('已加入專案：'+item.title+'。');}
    catch(e){status(e.message);}
  }
  function openItem(item){
    if(!item?.data)return;
    $('input').value=JSON.stringify(item.data,null,2);
    const type=item.data.schema_version==='1.0'?'mindmap':item.data.type;
    if($('chartType')&&type)$('chartType').value=type;
    if(item.data.report){$('reportX').value=item.data.report.x_label||'';$('reportY').value=item.data.report.y_label||'';$('reportCaption').value=item.data.report.caption||'';$('reportSource').value=item.data.report.source||'';}
    if(typeof fillForm==='function')fillForm(item.data);
    if(typeof showMode==='function')showMode(true);
    if(item.output)window.VCOutputFormat?.setPreset?.(item.output);
    $('generate')?.click();
    status('已載入「'+item.title+'」。修改後可再次加入專案，或用「更新目前圖」覆蓋。');
    window.VCProjectManager.currentItemId=item.id;
    render();
  }
  function updateCurrent(){
    const p=project(),id=window.VCProjectManager.currentItemId;if(!p||!id){status('請先從專案中開啟一張圖，再更新。');return;}
    const i=p.items.findIndex(x=>x.id===id);if(i<0){status('找不到目前圖表。');return;}
    try{const fresh=currentVisual();fresh.id=id;fresh.createdAt=p.items[i].createdAt;fresh.updatedAt=now();p.items[i]=fresh;p.updatedAt=now();persist();render();status('已更新「'+fresh.title+'」。');}catch(e){status(e.message);}
  }
  function deleteItem(id){
    const p=project();if(!p)return;const i=p.items.findIndex(x=>x.id===id);if(i<0)return;
    const name=p.items[i].title;p.items.splice(i,1);if(window.VCProjectManager.currentItemId===id)window.VCProjectManager.currentItemId=null;p.updatedAt=now();persist();render();status('已從專案移除「'+name+'」。');
  }
  function renameItem(id){
    const p=project(),item=p?.items.find(x=>x.id===id);if(!item)return;
    const name=prompt('重新命名圖表',item.title);if(!name?.trim())return;item.title=name.trim().slice(0,120);item.updatedAt=now();p.updatedAt=now();persist();render();
  }
  function switchProject(id){
    if(!db.projects[id])return;saveProjectContext();active=id;persist();restoreContext(project().context);window.VCProjectManager.currentItemId=null;location.reload();
  }
  function renameProject(){
    const p=project();if(!p)return;const name=prompt('重新命名專案',p.name);if(!name?.trim())return;p.name=name.trim().slice(0,80);p.updatedAt=now();persist();render();
  }
  function deleteProject(){
    const p=project();if(!p)return;if(!confirm('刪除專案「'+p.name+'」？此操作會移除瀏覽器中的專案資料。'))return;
    delete db.projects[active];active=Object.keys(db.projects)[0]||null;persist();if(active)restoreContext(project().context);render();status('專案已刪除。');
  }
  function exportProject(){
    const p=project();if(!p){status('沒有可匯出的專案。');return;}saveProjectContext();
    const blob=new Blob([JSON.stringify({schema:'visual-canvas-project',version:1,project:p},null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=p.name.replace(/[\\/:*?"<>|]/g,'-')+'.visual-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }
  function importProject(file){
    const reader=new FileReader();reader.onload=()=>{try{const pack=JSON.parse(reader.result);const p=pack?.project;if(pack?.schema!=='visual-canvas-project'||!p?.name||!Array.isArray(p.items))throw Error('不是有效的 Visual Canvas 專案檔。');const id=uid();db.projects[id]={...p,id,name:String(p.name).slice(0,80),updatedAt:now()};active=id;persist();restoreContext(db.projects[id].context);location.reload();}catch(e){status('匯入失敗：'+e.message);}};reader.readAsText(file);}
  function renderSummary(){
    const p=project(),summary=$('projectSummary');if(!summary)return;
    if(!p){summary.textContent='尚未選擇專案';return;}
    summary.textContent=p.items.length+' 張圖 · 最後更新 '+new Date(p.updatedAt).toLocaleString();
  }
  function render(){
    const select=$('projectSelect');if(!select)return;select.replaceChildren();
    const empty=document.createElement('option');empty.value='';empty.textContent='— 選擇專案 —';select.append(empty);
    Object.values(db.projects).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))).forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;select.append(o);});
    select.value=active||'';
    $('projectName').textContent=project()?.name||'Project Manager';
    renderSummary();
    const list=$('projectItems');list.replaceChildren();
    const p=project();
    if(!p){const e=document.createElement('div');e.className='project-empty';e.textContent='建立專案後，可把目前圖表加入並持續管理。';list.append(e);return;}
    if(!p.items.length){const e=document.createElement('div');e.className='project-empty';e.textContent='這個專案還沒有圖表。先產生一張圖，再按「加入目前圖」。';list.append(e);return;}
    p.items.forEach((item,index)=>{const row=document.createElement('article');row.className='project-item';if(window.VCProjectManager.currentItemId===item.id)row.classList.add('active');
      const meta=document.createElement('button');meta.type='button';meta.className='project-item-main';meta.innerHTML='<span class="project-item-index">'+String(index+1).padStart(2,'0')+'</span><span><strong></strong><small></small></span>';meta.querySelector('strong').textContent=item.title;meta.querySelector('small').textContent=(new Map(typeof CHARTS!=='undefined'?CHARTS:[]).get(item.type)||item.type)+' · '+(item.output||'');meta.onclick=()=>openItem(item);
      const actions=document.createElement('div');actions.className='project-item-actions';
      const ren=document.createElement('button');ren.type='button';ren.textContent='改名';ren.onclick=()=>renameItem(item.id);
      const del=document.createElement('button');del.type='button';del.textContent='移除';del.onclick=()=>deleteItem(item.id);
      actions.append(ren,del);row.append(meta,actions);list.append(row);
    });
  }

  const host=document.createElement('section');host.id='projectManager';host.className='project-manager';
  host.innerHTML='<div class="project-head"><div><span class="mode-eyebrow">PROJECT</span><strong id="projectName">Project Manager</strong><small id="projectSummary">尚未選擇專案</small></div><button id="projectCollapse" type="button">收合</button></div><div class="project-controls"><select id="projectSelect" aria-label="選擇專案"></select><button id="newProject" type="button">＋ 新專案</button></div><div class="project-actions"><button id="addCurrentVisual" class="primary" type="button">加入目前圖</button><button id="updateCurrentVisual" type="button">更新目前圖</button><button id="renameProject" type="button">專案改名</button><button id="exportProject" type="button">匯出專案</button><label class="project-import">匯入專案<input id="importProject" type="file" accept=".json,application/json" hidden></label><button id="deleteProject" type="button">刪除專案</button></div><div id="projectItems" class="project-items"></div>';

  $('workflowSidebar')?.prepend(host);
  host.querySelector('#projectCollapse').onclick=()=>{host.classList.toggle('collapsed');host.querySelector('#projectCollapse').textContent=host.classList.contains('collapsed')?'展開':'收合';};
  host.querySelector('#newProject').onclick=()=>{const name=prompt('新專案名稱','新專案');if(name?.trim())createProject(name);};
  host.querySelector('#projectSelect').onchange=e=>{if(e.target.value)switchProject(e.target.value);};
  host.querySelector('#addCurrentVisual').onclick=addCurrent;
  host.querySelector('#updateCurrentVisual').onclick=updateCurrent;
  host.querySelector('#renameProject').onclick=renameProject;
  host.querySelector('#deleteProject').onclick=deleteProject;
  host.querySelector('#exportProject').onclick=exportProject;
  host.querySelector('#importProject').onchange=e=>{const f=e.target.files?.[0];if(f)importProject(f);e.target.value='';};
  window.addEventListener('beforeunload',saveProjectContext);
  window.VCProjectManager={currentItemId:null,createProject,addCurrent,updateCurrent,saveProjectContext,getActive:()=>structuredClone(project()),list:()=>structuredClone(db.projects)};
  load();if(active)restoreContext(project().context);render();
})();