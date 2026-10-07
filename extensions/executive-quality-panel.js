/* Executive Quality Panel — final user-facing explanation layer. */
(()=>{'use strict';
const VERSION='1.0';
function mount(){
  let panel=document.getElementById('executiveQualityPanel');
  if(panel)return panel;
  const anchor=document.getElementById('guardrailPanel')||document.getElementById('status');
  if(!anchor)return null;
  panel=document.createElement('section');
  panel.id='executiveQualityPanel';
  panel.className='executive-quality-panel';
  panel.hidden=true;
  panel.setAttribute('aria-live','polite');
  anchor.insertAdjacentElement('afterend',panel);
  if(!document.getElementById('executiveQualityPanelStyle')){
    const style=document.createElement('style');style.id='executiveQualityPanelStyle';
    style.textContent=`
.executive-quality-panel{margin:10px 0 12px;padding:12px;border:1px solid #dfe5ee;border-radius:12px;background:linear-gradient(180deg,#fff,#f7f9fc)}
.eq-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.eq-head>div{display:flex;flex-direction:column;gap:2px;min-width:0}.eq-eyebrow{font-size:8px;letter-spacing:.12em;color:#7b8496}.eq-head strong{font-size:12px}.eq-score{font-size:10px;font-weight:700;padding:5px 8px;border-radius:999px;background:#eef1ff;color:#4f57bd;white-space:nowrap}.eq-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.eq-chip{font-size:9px;padding:4px 7px;border-radius:999px;background:#eef1f5;color:#5f6b7c}.eq-chip.auto{background:#edf7ef;color:#356b42}.eq-group{margin-top:9px}.eq-group>strong{display:block;font-size:10px;margin-bottom:5px}.eq-list{display:grid;gap:5px}.eq-item{display:grid;grid-template-columns:20px 1fr;gap:7px;align-items:start;padding:7px 8px;border:1px solid #e7eaf0;border-radius:8px;background:white}.eq-mark{display:grid;place-items:center;width:18px;height:18px;border-radius:999px;background:#eef1ff;color:#515cdd;font-size:9px;font-weight:700}.eq-item.warn .eq-mark{background:#fff0c9;color:#8a641b}.eq-item span:last-child{font-size:9px;line-height:1.45;color:#5f6b7c}.eq-ok{margin:8px 0 0;font-size:9px;color:#607080}
`;
    document.head.append(style);
  }
  return panel;
}
function clear(){const p=mount();if(p){p.replaceChildren();p.hidden=true;}}
function render(q,summary){
  const p=mount();if(!p)return;
  p.replaceChildren();
  if(!q?.enabled){p.hidden=true;return;}
  p.hidden=false;
  const head=document.createElement('div');head.className='eq-head';
  const left=document.createElement('div'),eye=document.createElement('span'),title=document.createElement('strong'),score=document.createElement('span');
  eye.className='eq-eyebrow';eye.textContent='EXECUTIVE QUALITY';
  title.textContent='版面品質與自動修正';
  score.className='eq-score';score.textContent=String(q.score??100)+'/100';
  left.append(eye,title);head.append(left,score);p.append(head);

  const meta=document.createElement('div');meta.className='eq-meta';
  const layout=document.createElement('span');layout.className='eq-chip';layout.textContent='版型：'+(summary?.layoutLabel||q.finalLayout||'—');meta.append(layout);
  if(q.degraded){const auto=document.createElement('span');auto.className='eq-chip auto';auto.textContent='已自動切換安全版型';meta.append(auto);}
  const format=document.createElement('span');format.className='eq-chip';format.textContent='輸出：'+String(q.format||'—');meta.append(format);
  p.append(meta);

  const makeGroup=(label,items,warn=false)=>{
    if(!items?.length)return;
    const group=document.createElement('div');group.className='eq-group';
    const h=document.createElement('strong');h.textContent=label+' · '+items.length;group.append(h);
    const list=document.createElement('div');list.className='eq-list';
    items.forEach((item,i)=>{const row=document.createElement('div');row.className='eq-item'+(warn?' warn':'');const mark=document.createElement('span');mark.className='eq-mark';mark.textContent=warn?'!':'✓';const txt=document.createElement('span');txt.textContent=item.label||item.code||('項目 '+(i+1));row.append(mark,txt);list.append(row);});
    group.append(list);p.append(group);
  };
  makeGroup('已自動修正',q.fixes||[]);
  makeGroup('建議人工確認',q.warnings||[],true);
  if(!(q.fixes||[]).length&&!(q.warnings||[]).length){const ok=document.createElement('p');ok.className='eq-ok';ok.textContent='目前版面沒有偵測到需要額外修正的壓力。';p.append(ok);}
}
window.VCExecutiveQualityPanel={VERSION,mount,render,clear};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();