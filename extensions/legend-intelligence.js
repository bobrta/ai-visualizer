/* Legend Intelligence / Label Priority Engine v1
   Coordinates legend visibility, direct labels, and restrained value labels. */
(()=>{'use strict';
const VERSION='1.0',base=chartConfig;
const mode=()=>{try{return localStorage.getItem('visual-canvas-work-mode-v1')||'business';}catch{return'business';}};
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('zh-TW',{maximumFractionDigits:1}).format(n):String(n??'');
function topIndices(values,n=3){
 return (values||[]).map((v,i)=>({i,v:Number(v)})).filter(x=>Number.isFinite(x.v)).sort((a,b)=>b.v-a.v||a.i-b.i).slice(0,n).map(x=>x.i);
}
function focusSeries(r){
 const set=new Set((r.emphasis?.focus||[]).filter(x=>x.kind==='series').map(x=>x.index));
 return set;
}
function apply(d,r){
 const traces=r.traces||[],layout=r.layout||(r.layout={}),m=mode(),business=m==='business',research=m==='research',adjustments=[],labels=[];
 const add=(code,label)=>{if(!adjustments.some(x=>x.code===code&&x.label===label))adjustments.push({code,label});};
 const focus=focusSeries(r);

 if(['line','area','stacked_area'].includes(d.type)&&traces.length){
   const maxDirect=business?2:research?3:2;
   const ranked=[...focus];
   if(!ranked.length&&traces.length)ranked.push(0);
   const direct=new Set(ranked.slice(0,maxDirect));
   traces.forEach((t,i)=>{
     const xs=t.x||[],ys=t.y||[];
     t.legendrank=direct.has(i)?i:100+i;
     if(direct.has(i)&&xs.length&&ys.length){
       const text=Array(xs.length).fill('');text[text.length-1]=String(t.name||'');
       t.text=text;t.textposition='middle right';t.textfont={...(t.textfont||{}),size:business?11:10,color:t.line?.color};
       if(!String(t.mode||'').includes('text'))t.mode=(t.mode||'lines')+'+text';
       t.cliponaxis=false;
       t.showlegend=traces.length<=3?true:!business;
       labels.push({kind:'series-end',index:i,name:t.name||String(i)});
     }else if(business&&traces.length>5){
       t.showlegend=true;
     }
   });
   if(direct.size){layout.margin={...(layout.margin||{}),r:Math.max(layout.margin?.r||0,105)};add('direct-line-labels','主系列在線尾直接標名稱');}
   if(traces.length>8){
     layout.legend={...(layout.legend||{}),font:{...(layout.legend?.font||{}),size:9},itemwidth:30};
     add('compact-legend','系列很多，壓縮圖例字級與項目寬度');
   }
 }

 if(['bar','grouped_bar','stacked_bar'].includes(d.type)&&traces.length){
   const topN=business?3:research?5:4;
   if(traces.length===1){
     const t=traces[0],vals=t.y||[],chosen=new Set(topIndices(vals,topN));
     for(const f of r.emphasis?.focus||[])if(f.kind==='category'&&Number.isInteger(f.index))chosen.add(f.index);
     t.text=vals.map((v,i)=>chosen.has(i)?fmt(v):'');
     t.textposition='outside';t.textfont={...(t.textfont||{}),size:10};t.cliponaxis=false;
     layout.uniformtext={mode:'hide',minsize:9};
     labels.push(...[...chosen].map(i=>({kind:'bar-value',index:i})));add('top-bar-labels',`只顯示 Top ${Math.min(topN,vals.length)}／焦點數值標籤`);
   }else{
     traces.forEach((t,i)=>{
       const primary=focus.has(i);
       t.legendrank=primary?i:100+i;
       if(primary){
         const vals=t.y||[],chosen=new Set(topIndices(vals,business?2:3));
         t.text=vals.map((v,j)=>chosen.has(j)?fmt(v):'');t.textposition='outside';t.textfont={...(t.textfont||{}),size:9};t.cliponaxis=false;
         labels.push(...[...chosen].map(j=>({kind:'bar-value',series:i,index:j})));
       }else{
         t.text=undefined;t.textposition=undefined;
       }
     });
     layout.uniformtext={mode:'hide',minsize:9};
     if(focus.size)add('primary-bar-labels','群組長條只標主系列的重點值');
   }
   if(traces.length>6){
     layout.legend={...(layout.legend||{}),font:{...(layout.legend?.font||{}),size:9},traceorder:'normal'};
     add('compact-legend','長條系列很多，縮小圖例');
   }
 }

 if(['pie','donut'].includes(d.type)){
   const t=traces.find(x=>x.type==='pie'),n=(d.labels||[]).length;
   if(t){
     if(n<=5){
       t.textinfo='label+percent';t.textposition='auto';t.showlegend=false;add('pie-direct-labels','分類少，直接在圓餅顯示名稱與比例');
     }else{
       t.textinfo=n>8?'percent':'label+percent';t.textposition=n>8?'inside':'auto';t.showlegend=true;
       layout.legend={...(layout.legend||{}),traceorder:'normal',font:{...(layout.legend?.font||{}),size:n>10?9:10}};
       add('pie-legend-balance','分類較多，保留圖例並降低直接標籤密度');
     }
   }
 }

 if(['scatter','bubble'].includes(d.type)){
   const t=traces.find(x=>x.type==='scatter'),points=(r.emphasis?.focus||[]).filter(x=>x.kind==='point');
   if(t&&points.length){
     const n=(t.x||[]).length,text=Array(n).fill('');
     for(const p of points)if(Number.isInteger(p.index)&&p.index<n)text[p.index]=`${t.name&&t.name!=='資料'?t.name+' · ':''}${fmt(t.y?.[p.index])}`;
     t.text=text;t.textposition='top center';t.textfont={...(t.textfont||{}),size:10};if(!String(t.mode||'').includes('text'))t.mode=(t.mode||'markers')+'+text';
     t.cliponaxis=false;labels.push(...points.map(p=>({kind:'point-label',index:p.index})));add('scatter-focus-label','散佈圖只標焦點點');
   }
 }

 const legendCount=traces.filter(t=>t.showlegend!==false&&t.name).length;
 if(legendCount>10){
   layout.legend={...(layout.legend||{}),orientation:'v',x:1.02,xanchor:'left',y:1,yanchor:'top',font:{...(layout.legend?.font||{}),size:9}};
   layout.margin={...(layout.margin||{}),r:Math.max(layout.margin?.r||0,175)};
   add('legend-overflow','圖例超過 10 項，移到右側並保留閱讀空間');
 }else if(legendCount>5&&layout.legend?.orientation!=='v'){
   layout.legend={...(layout.legend||{}),orientation:'h',x:0,y:-.2,font:{...(layout.legend?.font||{}),size:10}};
   layout.margin={...(layout.margin||{}),b:Math.max(layout.margin?.b||0,135)};
   add('legend-wrap','中等數量圖例移到底部並增加空間');
 }

 return {...r,legendIntelligence:{version:VERSION,mode:m,adjustments,labels,legendCount}};
}
chartConfig=function(d){return apply(d,base(d));};
window.VCLegendIntelligence={VERSION,topIndices,focusSeries,apply};
})();