/* One snapshot owns editable input, report metadata, scale and recovery. */
'use strict';
(()=>{
  const DRAFT_KEY='visual-canvas-draft-v1',MAX_HISTORY=80;
  const history=[],$id=id=>document.getElementById(id);
  let historyIndex=-1,restoring=false,saveTimer=null,historyTimer=null,draftCleared=false;
  function snapshot(){
    let raw=$id('input').value,data=null;
    try{data=typeof formMode!=='undefined'&&formMode?collectForm():JSON.parse(raw);raw=JSON.stringify(data,null,2);}catch{}
    if(data&&typeof data==='object'&&!Array.isArray(data)){reportFields(data);raw=JSON.stringify(data,null,2);}
    return {data,raw,formMode:typeof formMode!=='undefined'&&formMode,chartType:$id('chartType').value,
      report:Object.fromEntries(['reportX','reportY','reportCaption','reportSource'].map(id=>[id,$id(id).value])),
      textScale:$id('textScale').value,pdfPageFormat:$id('pdfPageFormat')?.value||'a4_landscape',pdfImageScale:$id('pdfImageScale')?.value||'115',pdfShowTitle:Boolean($id('pdfShowTitle')?.checked),presentation:window.VCStyle?.state(),savedAt:Date.now()};
  }
  function signature(s){const {savedAt,...value}=s||{};return JSON.stringify(value);}
  function updateButtons(){$id('undoEdit').disabled=historyIndex<=0;$id('redoEdit').disabled=historyIndex>=history.length-1;}
  function pushHistory(){
    if(restoring)return;const s=structuredClone(snapshot());
    if(historyIndex>=0&&signature(history[historyIndex])===signature(s))return;
    history.splice(historyIndex+1);history.push(s);if(history.length>MAX_HISTORY)history.shift();historyIndex=history.length-1;updateButtons();
  }
  async function applyState(s,{render=true}={}){
    restoring=true;
    try{
      $id('input').value=s.raw??JSON.stringify(s.data,null,2);$id('chartType').value=s.chartType||s.data?.type||'mindmap';
      const legacy={reportX:'x',reportY:'y',reportCaption:'caption',reportSource:'source'};
      for(const id of Object.keys(legacy))$id(id).value=s.report?.[id]??s.report?.[legacy[id]]??'';
      if(s.presentation){VCStyle.set(s.presentation);appearanceUI?.refresh();colors.splice(0,colors.length,...VCStyle.palette());}
      $id('textScale').value=s.textScale||'1';if($id('pdfPageFormat'))$id('pdfPageFormat').value=s.pdfPageFormat||'a4_landscape';if($id('pdfImageScale')){$id('pdfImageScale').value=s.pdfImageScale||'115';$id('pdfImageScaleValue').textContent=$id('pdfImageScale').value+'%';}if($id('pdfShowTitle'))$id('pdfShowTitle').checked=Boolean(s.pdfShowTitle);await VCTypography.setMultiplier(s.textScale||1);
      if(s.data&&typeof fillForm==='function')fillForm(s.data);
      showMode(Boolean(s.data&&(s.formMode??true)));
      if(render&&s.data)await originalGenerate();else window.VCRenderValid=false;
    }finally{restoring=false;}
  }
  async function undo(){clearTimeout(historyTimer);pushHistory();if(historyIndex<=0)return;await applyState(history[--historyIndex]);updateButtons();queueSave();}
  async function redo(){clearTimeout(historyTimer);if(historyIndex>=history.length-1)return;await applyState(history[++historyIndex]);updateButtons();queueSave();}
  function saveDraftNow(){
    clearTimeout(saveTimer);if(draftCleared)return false;
    try{localStorage.setItem(DRAFT_KEY,JSON.stringify(snapshot()));$id('draftState').textContent='草稿已儲存';return true;}
    catch{$id('draftState').textContent='草稿儲存失敗';return false;}
  }
  function queueSave(){if(restoring)return;draftCleared=false;clearTimeout(saveTimer);$id('draftState').textContent='儲存中…';saveTimer=setTimeout(saveDraftNow,500);}
  async function loadDraft(){
    try{
      const raw=localStorage.getItem(DRAFT_KEY);if(!raw)return false;const s=JSON.parse(raw);
      if(!s||(!s.data&&typeof s.raw!=='string'))return false;
      // Explicit template links must open the requested template, preserving the previous draft.
      if(new URLSearchParams(location.search).has('template')){draftCleared=true;return false;}
      await applyState(s,{render:false});pushHistory();$id('draftState').textContent='已復原草稿';
      $id('status').textContent='已復原草稿。按「產生圖形」重新繪製。';return true;
    }catch{return false;}
  }
  function clearDraft(){clearTimeout(saveTimer);draftCleared=true;try{localStorage.removeItem(DRAFT_KEY);$id('draftState').textContent='草稿已清除';return true;}catch{$id('draftState').textContent='草稿清除失敗';return false;}}
  function shouldTrack(t){return t?.matches?.('#input,#fields input,#fields textarea,#fields select,#reportX,#reportY,#reportCaption,#reportSource,#textScale,#pdfPageFormat,#pdfImageScale,#pdfShowTitle');}
  function changed(){if(restoring)return;window.VCRenderValid=false;queueSave();clearTimeout(historyTimer);historyTimer=setTimeout(pushHistory,300);}
  document.addEventListener('input',e=>{if(shouldTrack(e.target))changed();});
  document.addEventListener('change',e=>{if(shouldTrack(e.target)){changed();pushHistory();}});
  document.addEventListener('focusin',e=>{if(shouldTrack(e.target))pushHistory();});
  window.addEventListener('vc-template-applied',()=>{if(restoring)return;pushHistory();queueSave();});
  window.addEventListener('vc-editor-mutation',()=>{if(restoring)return;pushHistory();changed();});
  document.addEventListener('keydown',e=>{
    if(!(e.ctrlKey||e.metaKey))return;const key=e.key.toLowerCase();
    if(key==='s'){e.preventDefault();draftCleared=false;saveDraftNow();return;}
    // Preserve the browser's native text undo inside all editable controls.
    if(e.target?.matches?.('input,textarea,[contenteditable="true"]'))return;
    if(key==='z'){e.preventDefault();e.shiftKey?redo():undo();}else if(key==='y'){e.preventDefault();redo();}
  });
  function flush(){clearTimeout(saveTimer);saveDraftNow();}
  window.addEventListener('pagehide',flush);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush();});
  window.VCEditorState={undo,redo,saveDraftNow,clearDraft,loadDraft,pushHistory};
  async function boot(){
    $id('undoEdit').addEventListener('click',undo);$id('redoEdit').addEventListener('click',redo);
    $id('saveDraft').addEventListener('click',()=>{draftCleared=false;saveDraftNow();});$id('clearDraft').addEventListener('click',clearDraft);
    if(!await loadDraft())pushHistory();updateButtons();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
