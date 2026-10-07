/* Template library UX: category filters, search and recently used. */
'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const grid=$('templateGrid'), search=$('templateSearch'), tabs=$('categoryTabs'), count=$('templateCount');
  if(!grid||!search||!tabs||!Array.isArray(window.CHARTS)&&typeof CHARTS==='undefined')return;
  const charts=typeof CHARTS!=='undefined'?CHARTS:window.CHARTS;
  const RECENT_KEY='visual-canvas-recent-templates-v1';
  const ranges=[
    {id:'all',label:'全部',start:0,end:999},
    {id:'data',label:'📊 數據圖表',start:0,end:29},
    {id:'learning',label:'🧠 學習理解',start:30,end:49},
    {id:'flow',label:'🔁 流程與時間',start:50,end:69},
    {id:'strategy',label:'💼 商業策略',start:70,end:79},
    {id:'ie',label:'⚙️ 工業工程',start:80,end:89},
    {id:'time',label:'⏱ 時間管理',start:90,end:99},
    {id:'recent',label:'最近使用',start:-1,end:-1}
  ];
  let active='all';
  let recents=[];
  try{recents=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]').filter(x=>typeof x==='string').slice(0,8);}catch{}

  const categoryFor=i=>{
    const r=ranges.find(x=>x.id!=='all'&&x.id!=='recent'&&i>=x.start&&i<=x.end);
    return r||ranges[1];
  };

  const cards=[...grid.querySelectorAll('.template-card')];
  cards.forEach((card,i)=>{
    const [type,name]=charts[i]||['',''];
    const meta=window.VC_LEARNING_TEMPLATES?.find?.(x=>x.id===type);
    const cat=categoryFor(i);
    card.dataset.type=type;
    card.dataset.name=name;
    card.dataset.desc=meta?.desc||'';
    card.dataset.category=cat.id;
    card.setAttribute('aria-label',name+'｜'+cat.label+(meta?.desc?'｜'+meta.desc:''));
    const badge=document.createElement('span');
    badge.className='template-badge';
    badge.textContent=cat.label.replace(/^[^\s]+\s/,'');
    card.append(badge);
    if(recents.includes(type))card.classList.add('recent');
  });

  for(const r of ranges){
    const b=document.createElement('button');
    b.type='button';b.className='category-tab';b.dataset.category=r.id;b.textContent=r.label;
    b.onclick=()=>{active=r.id;render();};
    tabs.append(b);
  }

  function remember(type){
    if(!type)return;
    recents=[type,...recents.filter(x=>x!==type)].slice(0,8);
    try{localStorage.setItem(RECENT_KEY,JSON.stringify(recents));}catch{}
    cards.forEach(c=>c.classList.toggle('recent',recents.includes(c.dataset.type)));
  }

  grid.addEventListener('click',e=>{
    const card=e.target.closest('.template-card');
    if(card)remember(card.dataset.type);
  },true);

  function normalized(s){return String(s||'').toLowerCase().replace(/\s+/g,'');}
  function render(){
    const q=normalized(search.value);
    let visible=0;
    cards.forEach((card,i)=>{
      const inCategory=active==='all'||(active==='recent'?recents.includes(card.dataset.type):card.dataset.category===active);
      const hay=normalized(card.dataset.name+' '+card.dataset.type+' '+card.dataset.desc+' '+card.textContent);
      const show=inCategory&&(!q||hay.includes(q));
      card.hidden=!show;
      if(show)visible++;
    });
    tabs.querySelectorAll('.category-tab').forEach(b=>b.classList.toggle('active',b.dataset.category===active));
    count.textContent=visible+' / '+cards.length+' 種';
    let empty=grid.querySelector('.empty-library');
    if(!visible){
      if(!empty){empty=document.createElement('div');empty.className='empty-library';grid.append(empty);}
      empty.textContent=active==='recent'&&!recents.length?'還沒有最近使用的圖形。':'找不到符合條件的圖形，試試較短的關鍵字。';
    }else empty?.remove();
  }
  search.addEventListener('input',render);
  search.addEventListener('keydown',e=>{
    if(e.key==='Escape'){search.value='';render();search.blur();}
  });
  const open=$('templates');
  open?.addEventListener('click',()=>requestAnimationFrame(()=>{search.focus();render();}));
  render();
})();