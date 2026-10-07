/* Reliability layer: draft autosave, undo/redo and recovery. */
'use strict';
(()=>{
  const DRAFT_KEY='visual-canvas-draft-v1';
  const MAX_HISTORY=80;
  const history=[];
  let historyIndex=-1;
  let restoring=false;
  let saveTimer=null;
  const $id=id=>document.getElementById(id);

  function currentData(){
    try{
      if(typeof formMode!=='undefined'&&formMode&&typeof collectForm==='function') return collectForm();
      return JSON.parse($id('input').value);
    }catch{
      return null;
    }
  }

  function snapshot(){
    const data=currentData();
    if(!data)return null;
    return {
      data,
      chartType:$id('chartType')?.value||data.type||'mindmap',
      report:{
        x:$id('reportX')?.value||'',
        y:$id('reportY')?.value||'',
        caption:$id('reportCaption')?.value||'',
        source:$id('reportSource')?.value||''
      },
      textScale:$id('textScale')?.value||'1',
      savedAt:Date.now()
    };
  }

  function same(a,b){
    try{return JSON.stringify(a?.data)===JSON.stringify(b?.data)&&JSON.stringify(a?.report)===JSON.stringify(b?.report)&&a?.textScale===b?.textScale;}catch{return false;}
  }

  function updateButtons(){
    const u=$id('undoEdit'),r=$id('redoEdit');
    if(u)u.disabled=historyIndex<=0;
    if(r)r.disabled=historyIndex<0||historyIndex>=history.length-1;
  }

  function pushHistory(){
    if(restoring)return;
    const s=snapshot();
    if(!s)return;
    if(historyIndex>=0&&same(history[historyIndex],s))return;
    history.splice(historyIndex+1);
    history.push(s);
    if(history.length>MAX_HISTORY)history.shift();
    historyIndex=history.length-1;
    updateButtons();
  }

  function applyState(s,{render=true}={}){
    if(!s)return;
    restoring=true;
    try{
      $id('input').value=JSON.stringify(s.data,null,2);
      if($id('chartType'))$id('chartType').value=s.chartType||s.data.type||'mindmap';
      if($id('reportX'))$id('reportX').value=s.report?.x||'';
      if($id('reportY'))$id('reportY').value=s.report?.y||'';
      if($id('reportCaption'))$id('reportCaption').value=s.report?.caption||'';
      if($id('reportSource'))$id('reportSource').value=s.report?.source||'';
      if($id('textScale')&&s.textScale)$id('textScale').value=s.textScale;
      if(typeof formMode!=='undefined'&&formMode&&typeof fillForm==='function')fillForm(s.data);
      if(render&&typeof originalGenerate==='function')originalGenerate();
      const status=$id('status');
      if(status)status.textContent='已復原先前編輯。';
    }finally{
      restoring=false;
    }
  }

  function undo(){
    if(historyIndex<=0)return;
    historyIndex--;
    applyState(history[historyIndex]);
    updateButtons();
  }

  function redo(){
    if(historyIndex>=history.length-1)return;
    historyIndex++;
    applyState(history[historyIndex]);
    updateButtons();
  }

  function saveDraftNow(){
    const s=snapshot();
    if(!s)return;
    try{
      localStorage.setItem(DRAFT_KEY,JSON.stringify(s));
      const badge=$id('draftState');
      if(badge)badge.textContent='草稿已儲存';
    }catch(e){
      const badge=$id('draftState');
      if(badge)badge.textContent='草稿儲存失敗';
    }
  }

  function queueSave(){
    clearTimeout(saveTimer);
    const badge=$id('draftState');
    if(badge)badge.textContent='儲存中…';
    saveTimer=setTimeout(saveDraftNow,500);
  }

  function loadDraft(){
    try{
      const raw=localStorage.getItem(DRAFT_KEY);
      if(!raw)return false;
      const s=JSON.parse(raw);
      if(!s?.data)return false;
      applyState(s,{render:false});
      pushHistory();
      const when=s.savedAt?new Date(s.savedAt).toLocaleString():'先前';
      const status=$id('status');
      if(status)status.textContent='已復原自動草稿（'+when+'）。按「產生圖形」即可重新繪製。';
      return true;
    }catch{return false;}
  }

  function clearDraft(){
    try{localStorage.removeItem(DRAFT_KEY);}catch{}
    const badge=$id('draftState');
    if(badge)badge.textContent='草稿已清除';
  }

  function shouldTrack(target){
    return target?.matches?.('#input,#fields input,#fields textarea,#reportX,#reportY,#reportCaption,#reportSource,#textScale');
  }

  document.addEventListener('input',e=>{
    if(!shouldTrack(e.target))return;
    queueSave();
  });
  document.addEventListener('change',e=>{
    if(!shouldTrack(e.target))return;
    pushHistory();
    queueSave();
  });
  document.addEventListener('focusin',e=>{
    if(shouldTrack(e.target))pushHistory();
  });

  document.addEventListener('keydown',e=>{
    const mod=e.ctrlKey||e.metaKey;
    if(!mod)return;
    if(e.key.toLowerCase()==='z'&&!e.shiftKey){
      if(e.target?.matches?.('input,textarea')&&e.target.id==='input')return;
      e.preventDefault();undo();
    }else if((e.key.toLowerCase()==='y')||(e.key.toLowerCase()==='z'&&e.shiftKey)){
      if(e.target?.matches?.('input,textarea')&&e.target.id==='input')return;
      e.preventDefault();redo();
    }else if(e.key.toLowerCase()==='s'){
      e.preventDefault();saveDraftNow();
      const status=$id('status');if(status)status.textContent='草稿已手動儲存到此瀏覽器。';
    }
  });

  window.addEventListener('beforeunload',()=>{clearTimeout(saveTimer);saveDraftNow();});
  window.VCEditorState={undo,redo,saveDraftNow,clearDraft,loadDraft,pushHistory};

  const boot=()=>{
    $id('undoEdit')?.addEventListener('click',undo);
    $id('redoEdit')?.addEventListener('click',redo);
    $id('saveDraft')?.addEventListener('click',()=>{saveDraftNow();const s=$id('status');if(s)s.textContent='草稿已手動儲存。';});
    $id('clearDraft')?.addEventListener('click',clearDraft);
    if(!loadDraft())pushHistory();
    updateButtons();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();