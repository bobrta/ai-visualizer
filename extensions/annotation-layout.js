/* Annotation Layout v1: deterministic placement for Auto Insight labels. */
(()=>{'use strict';
const VERSION='1.0',base=chartConfig,W=900,H=520;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function numericRange(a){const v=(a||[]).filter(Number.isFinite);if(!v.length)return null;let min=Math.min(...v),max=Math.max(...v);if(min===max){min-=1;max+=1;}return{min,max};}
function categoryIndex(a,v){const i=(a||[]).findIndex(x=>String(x)===String(v));return i<0?null:i;}
function pointNorm(d,a){
 const t=d.type,x=a.x,y=a.y;
 if(['bar','grouped_bar','stacked_bar','waterfall','line','area','stacked_area'].includes(t)){
   const series=Array.isArray(d.series)?d.series:[d],xs=series[0]?.x||d.labels||[],allY=series.flatMap(s=>Array.isArray(s.y)?s.y:[]);if(t==='waterfall')allY.push(...(d.values||[]));
   const xi=categoryIndex(xs,x),xr=Math.max(1,xs.length-1),yr=numericRange(allY);
   return {x:xi===null?.5:xs.length===1?.5:xi/xr,y:yr&&Number.isFinite(y)?(y-yr.min)/(yr.max-yr.min):.5};
 }
 if(['scatter','bubble'].includes(t)){const xr=numericRange(d.x),yr=numericRange(d.y);return{x:xr&&Number.isFinite(x)?(x-xr.min)/(xr.max-xr.min):.5,y:yr&&Number.isFinite(y)?(y-yr.min)/(yr.max-yr.min):.5};}
 return{x:.5,y:.5};
}
function boxFor(a,offset){
 const text=String(a.text||''),font=a.font?.size||11,bw=clamp(text.length*font*.58+18,54,190),bh=font*1.7+12;
 const p={x:pointNorm(a.__data||{},a).x*W,y:(1-pointNorm(a.__data||{},a).y)*H};
 return {left:p.x+offset.ax-bw/2,right:p.x+offset.ax+bw/2,top:p.y+offset.ay-bh/2,bottom:p.y+offset.ay+bh/2,width:bw,height:bh};
}
function overlap(a,b,pad=6){return a.left<b.right+pad&&a.right>b.left-pad&&a.top<b.bottom+pad&&a.bottom>b.top-pad;}
function reserved(layout){
 const out=[{name:'title',left:0,right:W,top:0,bottom:84}];
 const l=layout?.legend;
 if(l&&l.orientation==='v'&&Number(l.x)>=1)out.push({name:'legend',left:W-165,right:W,top:75,bottom:H-30});
 if(l&&l.orientation==='h'&&Number(l.y)<0)out.push({name:'legend',left:40,right:W-40,top:H-92,bottom:H});
 return out;
}
function candidates(norm){
 const up=[{ax:0,ay:-48},{ax:44,ay:-42},{ax:-44,ay:-42},{ax:62,ay:-18},{ax:-62,ay:-18},{ax:0,ay:48},{ax:48,ay:38},{ax:-48,ay:38}];
 const down=[{ax:0,ay:48},{ax:44,ay:42},{ax:-44,ay:42},{ax:62,ay:18},{ax:-62,ay:18},{ax:0,ay:-48},{ax:48,ay:-38},{ax:-48,ay:-38}];
 let list=norm.y>.72?down:up;
 if(norm.x<.2)list=list.map(o=>({...o,ax:Math.max(o.ax,16)}));
 if(norm.x>.8)list=list.map(o=>({...o,ax:Math.min(o.ax,-16)}));
 return list;
}
function scoreBox(b,placed,zones,offset){
 let score=Math.hypot(offset.ax,offset.ay)*.08;
 if(b.left<12)score+=(12-b.left)*12;if(b.right>W-12)score+=(b.right-(W-12))*12;if(b.top<12)score+=(12-b.top)*12;if(b.bottom>H-12)score+=(b.bottom-(H-12))*12;
 for(const z of zones)if(overlap(b,z,4))score+=z.name==='title'?900:700;
 for(const p of placed)if(overlap(b,p,10))score+=1200;
 return score;
}
function place(d,layout,annotations){
 const placed=[],kept=[],fallbacks=[],zones=reserved(layout);
 for(const original of annotations||[]){
   const a={...original,__data:d},norm=pointNorm(d,a),opts=candidates(norm);let best=null;
   for(const o of opts){const b=boxFor(a,o),score=scoreBox(b,placed,zones,o);if(!best||score<best.score)best={o,b,score};}
   if(!best||best.score>=900){fallbacks.push({text:a.text||'',reason:'no-clear-space',x:a.x,y:a.y});continue;}
   const out={...original,ax:best.o.ax,ay:best.o.ay,xanchor:best.o.ax>20?'left':best.o.ax<-20?'right':'center',yanchor:best.o.ay>20?'top':best.o.ay<-20?'bottom':'middle'};
   kept.push(out);placed.push(best.b);
 }
 return {annotations:kept,fallbacks,boxes:placed};
}
function apply(d,r){
 const current=r.layout?.annotations||[],report=r.autoInsight||{},autoTexts=new Set((report.annotations||[]).map(x=>String(x.text||'')));
 if(!current.length||!autoTexts.size)return {...r,annotationLayout:{version:VERSION,placed:0,fallbacks:[]}};
 const manual=current.filter(x=>!autoTexts.has(String(x.text||''))),auto=current.filter(x=>autoTexts.has(String(x.text||''))),result=place(d,r.layout,auto);
 r.layout={...(r.layout||{}),annotations:[...manual,...result.annotations]};
 if(report&&result.fallbacks.length)report.fallbacks=[...(report.fallbacks||[]),...result.fallbacks];
 return {...r,annotationLayout:{version:VERSION,placed:result.annotations.length,fallbacks:result.fallbacks}};
}
chartConfig=function(d){return apply(d,base(d));};
window.VCAnnotationLayout={VERSION,pointNorm,candidates,boxFor,overlap,reserved,scoreBox,place,apply};
})();