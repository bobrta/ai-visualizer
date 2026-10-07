/* Presentation Hierarchy / Emphasis Engine v1
   Adds restrained visual hierarchy without changing source values. */
(()=>{'use strict';
const VERSION='1.0',base=chartConfig;
const mode=()=>{try{return localStorage.getItem('visual-canvas-work-mode-v1')||'business';}catch{return'business';}};
const nums=a=>Array.isArray(a)?a.filter(Number.isFinite):[];
const rgba=(hex,a)=>{const h=String(hex||'').replace('#','');if(!/^[0-9a-f]{6}$/i.test(h))return `rgba(99,115,129,${a})`;const n=parseInt(h,16);return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;};
const mix=(a,b,t)=>window.VCStyle?.mix?VCStyle.mix(a,b,t):a;
function seriesScore(s){
 const y=nums(s?.y);if(!y.length)return 0;
 const range=Math.max(...y)-Math.min(...y),net=y.length>1?Math.abs(y.at(-1)-y[0]):0,peak=Math.max(...y.map(Math.abs));
 return range*.55+net*.35+peak*.10;
}
function maxIndex(a){let k=-1,v=-Infinity;for(let i=0;i<(a||[]).length;i++)if(Number.isFinite(a[i])&&a[i]>v){v=a[i];k=i;}return k;}
function minIndex(a){let k=-1,v=Infinity;for(let i=0;i<(a||[]).length;i++)if(Number.isFinite(a[i])&&a[i]<v){v=a[i];k=i;}return k;}
function focusSeriesIndex(d,traces){
 const wanted=d.focus_series;
 if(wanted!==undefined){
   const idx=typeof wanted==='number'?wanted:(d.series||[]).findIndex(s=>String(s.name)===String(wanted));
   if(idx>=0&&idx<traces.length)return idx;
 }
 const ss=Array.isArray(d.series)?d.series:[d],scored=ss.map((s,i)=>({i,score:seriesScore(s)})).sort((a,b)=>b.score-a.score||a.i-b.i);
 return scored[0]?.i??0;
}
function apply(d,r){
 const s=VCStyle.state(),m=mode(),mono=s.theme==='mono',traces=r.traces||[],adjustments=[],focus=[];
 const add=(code,label)=>{if(!adjustments.some(x=>x.code===code&&x.label===label))adjustments.push({code,label});};
 const business=m==='business',research=m==='research';
 const accent=s.accent||VCStyle.palette()[0],bg=s.bg||'#FFFFFF',muted=s.muted||'#6B7280';

 if(['line','area','stacked_area'].includes(d.type)&&traces.length>1){
   const f=focusSeriesIndex(d,traces),scores=(d.series||[]).map((x,i)=>({i,score:seriesScore(x)})).sort((a,b)=>b.score-a.score||a.i-b.i),secondary=business&&scores.length>2?scores[1]?.i:null;
   traces.forEach((t,i)=>{
     const primary=i===f,second=i===secondary,baseWidth=Number(t.line?.width)||2.4;
     t.line={...(t.line||{}),width:primary?Math.max(3.8,baseWidth):second?Math.max(2.8,baseWidth):research?Math.max(2.1,baseWidth*.9):1.7};
     t.opacity=primary?1:second?.82:research?.72:.38;
     if(t.marker)t.marker={...t.marker,size:primary?Math.max(Number(t.marker?.size)||0,8):Math.max(Number(t.marker?.size)||0,6),opacity:primary?1:research?.82:.5};
     if(primary){focus.push({kind:'series',index:i,name:t.name||String(i)});t.showlegend=true;}
   });
   add('series-hierarchy',business?'突出主要折線，其餘降低視覺權重':'建立主要／次要系列層級');
 }

 if(['bar','grouped_bar','stacked_bar'].includes(d.type)&&traces.length){
   if(traces.length===1){
     const t=traces[0],y=Array.isArray(t.y)?t.y:[],hi=maxIndex(y),lo=minIndex(y),n=y.length;
     if(hi>=0){
       const baseColor=Array.isArray(t.marker?.color)?t.marker.color[hi]:t.marker?.color||accent;
       const colors=Array.from({length:n},(_,i)=>i===hi?accent:(research?mix(baseColor,bg,.28):mix(baseColor,bg,.62)));
       t.marker={...(t.marker||{}),color:colors,line:{...(t.marker?.line||{}),width:colors.map((_,i)=>i===hi?1.2:.4),color:colors.map((_,i)=>i===hi?accent:rgba(muted,.35))}};
       t.opacity=1;focus.push({kind:'category',index:hi,label:t.x?.[hi]??String(hi)});
       add('bar-highlight','突出最高值，其餘長條降低視覺權重');
       if(d.focus_category!==undefined){const idx=(t.x||[]).findIndex(x=>String(x)===String(d.focus_category));if(idx>=0&&idx!==hi){colors[idx]=accent;t.marker.color=colors;focus.push({kind:'category',index:idx,label:t.x?.[idx]??String(idx)});}}
       if(research&&lo>=0&&lo!==hi)t.marker.opacity=Array.from({length:n},()=>1);
     }
   }else{
     const f=focusSeriesIndex(d,traces);
     traces.forEach((t,i)=>{t.opacity=i===f?1:research?.78:.46;if(i===f){t.marker={...(t.marker||{}),line:{...(t.marker?.line||{}),width:1.1,color:accent}};focus.push({kind:'series',index:i,name:t.name||String(i)});}});
     add('bar-series-hierarchy','群組長條建立主要／次要系列層級');
   }
 }

 if(['pie','donut'].includes(d.type)){
   const t=traces.find(x=>x.type==='pie'),vals=d.values||[],hi=maxIndex(vals);
   if(t&&hi>=0){
     t.pull=vals.map((_,i)=>i===hi?(business?.075:.045):0);
     const base=Array.isArray(t.marker?.colors)?t.marker.colors:VCStyle.palette(),colors=vals.map((_,i)=>i===hi?accent:mix(base[i%base.length]||muted,bg,research?.18:.48));
     t.marker={...(t.marker||{}),colors};focus.push({kind:'slice',index:hi,label:d.labels?.[hi]??String(hi)});
     add('pie-emphasis','最大占比類別使用主色與輕微拉出');
   }
 }

 if(['scatter','bubble'].includes(d.type)){
   const t=traces.find(x=>x.type==='scatter'),hi=maxIndex(d.y||[]);
   if(t&&hi>=0&&business){
     const n=(d.y||[]).length,baseSize=Number(t.marker?.size)||7;
     if(!Array.isArray(t.marker?.size)){
       t.marker={...(t.marker||{}),size:Array.from({length:n},(_,i)=>i===hi?Math.max(baseSize+4,11):Math.max(baseSize,7)),opacity:Array.from({length:n},(_,i)=>i===hi?1:.5),line:{...(t.marker?.line||{}),width:Array.from({length:n},(_,i)=>i===hi?2:1),color:Array.from({length:n},(_,i)=>i===hi?accent:rgba(muted,.55))}};
     }else{
       t.marker={...(t.marker||{}),opacity:Array.from({length:n},(_,i)=>i===hi?1:.55),line:{...(t.marker?.line||{}),width:Array.from({length:n},(_,i)=>i===hi?2:1),color:Array.from({length:n},(_,i)=>i===hi?accent:rgba(muted,.55))}};
     }
     focus.push({kind:'point',index:hi,x:d.x?.[hi],y:d.y?.[hi]});add('scatter-focus','輕度突出最高 Y 點，其他點降低透明度');
   }
 }

 if(d.type==='waterfall'){
   const t=traces.find(x=>x.type==='waterfall'),vals=d.values||[],pos=maxIndex(vals),neg=minIndex(vals);
   if(t){
     t.connector={...(t.connector||{}),line:{...(t.connector?.line||{}),color:rgba(muted,.55),width:1.2}};
     t.opacity=.96;t.increasing={...(t.increasing||{}),marker:{...(t.increasing?.marker||{}),line:{color:s.positive,width:.8}}};t.decreasing={...(t.decreasing||{}),marker:{...(t.decreasing?.marker||{}),line:{color:s.negative,width:.8}}};t.totals={...(t.totals||{}),marker:{...(t.totals?.marker||{}),line:{color:accent,width:1.5}}};
     if(pos>=0)focus.push({kind:'positive',index:pos,label:d.labels?.[pos]});if(neg>=0&&vals[neg]<0)focus.push({kind:'negative',index:neg,label:d.labels?.[neg]});add('waterfall-hierarchy','總計與主要貢獻使用更清楚的邊界');
   }
 }

 if(mono){
   for(const t of traces){
     if(t.type==='scatter'&&String(t.mode||'').includes('lines')&&t.opacity<1)t.opacity=Math.max(t.opacity,.58);
     if(t.type==='bar'&&t.opacity<1)t.opacity=Math.max(t.opacity,.68);
   }
 }
 return {...r,emphasis:{version:VERSION,mode:m,adjustments,focus}};
}
chartConfig=function(d){return apply(d,base(d));};
window.VCEmphasis={VERSION,seriesScore,maxIndex,minIndex,focusSeriesIndex,apply};
})();