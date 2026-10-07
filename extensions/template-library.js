/* Template library UX: categories, work-mode recommendations, search and recents. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const grid=$('templateGrid'),search=$('templateSearch'),tabs=$('categoryTabs'),count=$('templateCount');
  if(!grid||!search||!tabs||typeof CHARTS==='undefined')return;
  const RECENT_KEY='visual-canvas-recent-templates-v1';
  const MODE_KEY='visual-canvas-work-mode-v1';
  const ranges=[
    {id:'recommended',label:'⭐ 推薦'},
    {id:'all',label:'全部',start:0,end:999},
    {id:'data',label:'📊 數據圖表',start:0,end:29},
    {id:'learning',label:'🧠 學習理解',start:30,end:49},
    {id:'flow',label:'🔁 流程與時間',start:50,end:69},
    {id:'strategy',label:'💼 商業策略',start:70,end:79},
    {id:'ie',label:'⚙️ 工業工程',start:80,end:89},
    {id:'time',label:'⏱ 時間管理',start:90,end:99},
    {id:'recent',label:'最近使用'}
  ];
  const modeRecommended={
    business:new Set([
      'bar','grouped_bar','stacked_bar','line','area','pie','donut','waterfall','funnel','treemap','sankey',
      'comparison_matrix','quadrant','decision_tree','process_flow','timeline','swot_analysis','tows_matrix',
      'bmc_canvas','vpc_canvas','pestel_analysis','porter_five_forces','aida_funnel','okr_dashboard',
      'prep_framework','scqa_framework','priority_eisenhower','priority_value_effort','time_savings_roi'
    ]),
    research:new Set([
      'mindmap','line','scatter','bubble','histogram','box','violin','heatmap','contour','table',
      'concept_map','cause_chain','comparison_matrix','process_flow','formula_map','hierarchy_map',
      'argument_map','timeline','gantt','engineering_pareto','process_capability','critical_path_plan',
      'time_variance_audit','little_law_time'
    ]),
    learning:new Set([
      'mindmap','concept_map','cause_chain','decision_tree','comparison_matrix','process_flow','formula_map',
      'hierarchy_map','exam_overview','fishbone','venn','quadrant','timeline','cycle','pyramid',
      'cornell_notes','kwl','retrieval_cards','spaced_review','learning_gantt','argument_map'
    ]),
    all:new Set()
  };
  let active='recommended';
  let advisorTypes=null;
  let mode='business';
  try{mode=localStorage.getItem(MODE_KEY)||'business';}catch{}
  let recents=[];
  try{recents=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]').filter(x=>typeof x==='string').slice(0,8);}catch{}

  const categoryFor=i=>{
    const r=ranges.find(x=>Number.isFinite(x.start)&&i>=x.start&&i<=x.end);
    return r||ranges[2];
  };
  const cards=[...grid.querySelectorAll('.template-card')];
  cards.forEach((card,i)=>{
    const [type,name]=CHARTS[i]||['',''];
    const meta=window.VC_LEARNING_TEMPLATES?.find?.(x=>x.id===type);
    const cat=categoryFor(i);
    card.dataset.type=type;card.dataset.name=name;card.dataset.desc=meta?.desc||'';card.dataset.category=cat.id;
    card.setAttribute('aria-label',name+'｜'+cat.label+(meta?.desc?'｜'+meta.desc:''));
    const badge=document.createElement('span');badge.className='template-badge';badge.textContent=cat.label.replace(/^[^\s]+\s/,'');card.append(badge);
    if(recents.includes(type))card.classList.add('recent');
  });

  for(const r of ranges){
    const b=document.createElement('button');b.type='button';b.className='category-tab';b.dataset.category=r.id;b.textContent=r.label;
    b.onclick=()=>{active=r.id;render();};tabs.append(b);
  }

  function remember(type){
    if(!type)return;
    recents=[type,...recents.filter(x=>x!==type)].slice(0,8);
    try{localStorage.setItem(RECENT_KEY,JSON.stringify(recents));}catch{}
    cards.forEach(c=>c.classList.toggle('recent',recents.includes(c.dataset.type)));
  }
  grid.addEventListener('click',e=>{const card=e.target.closest('.template-card');if(card)remember(card.dataset.type);},true);
  const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,'');

  function recommended(card){
    if(mode==='all')return true;
    const set=modeRecommended[mode]||modeRecommended.business;
    return set.has(card.dataset.type)||
      (mode==='business'&&['strategy'].includes(card.dataset.category))||
      (mode==='research'&&['ie'].includes(card.dataset.category))||
      (mode==='learning'&&['learning'].includes(card.dataset.category));
  }
  function render(){
    const q=norm(search.value);let visible=0;
    cards.forEach(card=>{
      const inCategory=active==='all'||(active==='recent'?recents.includes(card.dataset.type):active==='advisor'?(advisorTypes?.has(card.dataset.type)??false):active==='recommended'?recommended(card):card.dataset.category===active);
      const hay=norm(card.dataset.name+' '+card.dataset.type+' '+card.dataset.desc+' '+card.textContent);
      const show=inCategory&&(!q||hay.includes(q));card.hidden=!show;
      card.classList.toggle('mode-recommended',recommended(card));if(show)visible++;
    });
    tabs.querySelectorAll('.category-tab').forEach(b=>b.classList.toggle('active',b.dataset.category===active));
    const labels={business:'商業簡報',research:'研究專題',learning:'學習整理',all:'全功能'};
    count.textContent=(active==='recommended'?(labels[mode]+'推薦 · '):active==='advisor'?'建議器結果 · ':'')+visible+' / '+cards.length+' 種';
    let empty=grid.querySelector('.empty-library');
    if(!visible){if(!empty){empty=document.createElement('div');empty.className='empty-library';grid.append(empty);}
      empty.textContent=active==='recent'&&!recents.length?'還沒有最近使用的圖形。':'找不到符合條件的圖形，試試較短的關鍵字。';
    }else empty?.remove();
  }
  function setMode(next){
    mode=['business','research','learning','all'].includes(next)?next:'business';
    try{localStorage.setItem(MODE_KEY,mode);}catch{}
    active='recommended';search.value='';render();
  }

  search.addEventListener('input',render);
  search.addEventListener('keydown',e=>{if(e.key==='Escape'){search.value='';render();search.blur();}});
  $('templates')?.addEventListener('click',()=>requestAnimationFrame(()=>{search.focus();render();}));
  window.VCTemplateLibrary={setMode,getMode:()=>mode,showRecommended:()=>{active='recommended';render();},showAdvisorTypes:(types)=>{advisorTypes=new Set(types||[]);active='advisor';search.value='';render();}};
  render();
})();