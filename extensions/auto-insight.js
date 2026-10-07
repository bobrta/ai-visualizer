/* Auto Insight v1: deterministic presentation insights and restrained annotations. */
(()=>{'use strict';
const VERSION='1.0',base=chartConfig,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const mode=()=>{try{return localStorage.getItem('visual-canvas-work-mode-v1')||'business';}catch{return'business';}};
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('zh-TW',{maximumFractionDigits:2}).format(n):String(n??'');
const pct=n=>Number.isFinite(n)?(n*100).toFixed(Math.abs(n)>=.1?1:2)+'%':'';
function argmax(a){let k=-1,v=-Infinity;for(let i=0;i<(a||[]).length;i++)if(Number.isFinite(a[i])&&a[i]>v){v=a[i];k=i;}return{k,value:v};}
function argmin(a){let k=-1,v=Infinity;for(let i=0;i<(a||[]).length;i++)if(Number.isFinite(a[i])&&a[i]<v){v=a[i];k=i;}return{k,value:v};}
function pearson(x,y){const p=[];for(let i=0;i<Math.min(x?.length||0,y?.length||0);i++)if(Number.isFinite(x[i])&&Number.isFinite(y[i]))p.push([x[i],y[i]]);if(p.length<3)return null;const mx=p.reduce((s,v)=>s+v[0],0)/p.length,my=p.reduce((s,v)=>s+v[1],0)/p.length;let a=0,b=0,c=0;for(const [xx,yy]of p){const dx=xx-mx,dy=yy-my;a+=dx*dy;b+=dx*dx;c+=dy*dy;}return b&&c?a/Math.sqrt(b*c):null;}
function annotation(x,y,text,color,extra={}){return {x,y,text,showarrow:true,arrowhead:2,arrowsize:1,arrowwidth:1.5,arrowcolor:color,ax:0,ay:-42,bgcolor:'rgba(255,255,255,.92)',bordercolor:color,borderwidth:1,borderpad:5,font:{size:11,color},...extra};}
function insight(kind,text,detail='',annotations=[]){return{kind,text,detail,annotations};}
function analyze(d,config){
 const t=d.type,ins=[],s=VCStyle.state(),accent=s.accent||VCStyle.palette()[0],positive=s.positive||'#2E7D4F',negative=s.negative||'#B54747',m=mode(),maxInsights=m==='research'?3:2;
 const add=x=>{if(x&&ins.length<maxInsights)ins.push(x);};
 const series=Array.isArray(d.series)?d.series:[d],first=series[0]||d;
 if(['bar','grouped_bar','stacked_bar'].includes(t)){
   let best=null,worst=null;
   for(const ser of series){const y=ser.y||[],x=ser.x||[];const hi=argmax(y),lo=argmin(y);if(hi.k>=0&&(!best||hi.value>best.value))best={...hi,label:x[hi.k],series:ser.name||''};if(lo.k>=0&&(!worst||lo.value<worst.value))worst={...lo,label:x[lo.k],series:ser.name||''};}
   if(best)add(insight('max',`${best.label} 最高：${fmt(best.value)}`,best.series?`系列：${best.series}`:'',[annotation(best.label,best.value,`最高 ${fmt(best.value)}`,accent)]));
   if(best&&worst&&best.k!==worst.k&&Math.abs(best.value-worst.value)>0)add(insight('range',`最高與最低相差 ${fmt(best.value-worst.value)}`,`${best.label} vs. ${worst.label}`));
 }
 if(['line','area','stacked_area'].includes(t)){
   let bestMove=null,last=null;
   for(const ser of series){const y=ser.y||[],x=ser.x||[];for(let i=1;i<y.length;i++)if(Number.isFinite(y[i])&&Number.isFinite(y[i-1])){const delta=y[i]-y[i-1];if(!bestMove||Math.abs(delta)>Math.abs(bestMove.delta))bestMove={delta,i,x:x[i],prev:x[i-1],value:y[i],series:ser.name||''};}if(y.length>=2&&Number.isFinite(y.at(-1))&&Number.isFinite(y.at(-2)))last={delta:y.at(-1)-y.at(-2),x:x.at(-1),value:y.at(-1),series:ser.name||''};}
   if(bestMove){const up=bestMove.delta>=0;add(insight(up?'rise':'fall',`最大${up?'上升':'下降'}：${fmt(Math.abs(bestMove.delta))}`,`${bestMove.prev} → ${bestMove.x}`,[annotation(bestMove.x,bestMove.value,`${up?'▲':'▼'} ${fmt(Math.abs(bestMove.delta))}`,up?positive:negative)]));}
   if(last&&(!bestMove||last.x!==bestMove.x)){const up=last.delta>=0;add(insight('latest',`最新一期${up?'增加':'減少'} ${fmt(Math.abs(last.delta))}`,last.series||''));}
 }
 if(['pie','donut'].includes(t)){
   const vals=d.values||[],labels=d.labels||[],hi=argmax(vals),sum=vals.filter(Number.isFinite).reduce((a,b)=>a+b,0);
   if(hi.k>=0&&sum>0)add(insight('share',`${labels[hi.k]} 占比最高：${pct(hi.value/sum)}`,`數值 ${fmt(hi.value)}`));
 }
 if(['scatter','bubble'].includes(t)){
   const r=pearson(d.x||[],d.y||[]);
   if(r!==null){const a=Math.abs(r),strength=a>=.8?'高度':a>=.5?'中度':a>=.3?'弱度':'極弱',dir=r>=0?'正':'負';add(insight('correlation',`${strength}${dir}相關（r = ${r.toFixed(2)}）`,a<.3?'線性關係不明顯':'相關不代表因果'));} 
   const hi=argmax(d.y||[]);if(hi.k>=0&&m==='research')add(insight('max',`Y 最高點：${fmt(hi.value)}`,`X = ${fmt(d.x?.[hi.k])}`,[annotation(d.x?.[hi.k],hi.value,`Y最高 ${fmt(hi.value)}`,accent)]));
 }
 if(t==='waterfall'){
   const vals=d.values||[],labels=d.labels||[],pos=argmax(vals),neg=argmin(vals);
   if(pos.k>=0&&pos.value>0)add(insight('positive',`最大正向貢獻：${labels[pos.k]} +${fmt(pos.value)}`,'',[annotation(labels[pos.k],pos.value,`+${fmt(pos.value)}`,positive)]));
   if(neg.k>=0&&neg.value<0)add(insight('negative',`最大負向貢獻：${labels[neg.k]} ${fmt(neg.value)}`,'',[annotation(labels[neg.k],neg.value,fmt(neg.value),negative,{ay:42})]));
 }
 if(t==='sankey'){
   const hi=argmax(d.values||[]);if(hi.k>=0){const from=d.labels?.[d.source?.[hi.k]]??'',to=d.labels?.[d.target?.[hi.k]]??'';add(insight('flow',`最大流量：${from} → ${to}（${fmt(hi.value)}）`));}
 }
 if(['scatter3d','line3d','bar3d'].includes(t)){
   const z=argmax(d.z||[]);if(z.k>=0)add(insight('zmax',`第三維最高值：${fmt(z.value)}`,`X ${fmt(d.x?.[z.k])} · Y ${fmt(d.y?.[z.k])}`));
 }
 return {version:VERSION,mode:m,items:ins,summary:ins[0]?.text||'',annotations:ins.flatMap(x=>x.annotations||[]).slice(0,m==='research'?3:2)};
}
function apply(d,r){
 const report=analyze(d,r);
 if(report.annotations.length&&['bar','grouped_bar','stacked_bar','line','area','stacked_area','scatter','bubble','waterfall'].includes(d.type)){
   r.layout={...(r.layout||{}),annotations:[...(r.layout?.annotations||[]),...report.annotations]};
 }
 return {...r,autoInsight:report};
}
chartConfig=function(d){return apply(d,base(d));};
window.VCAutoInsight={VERSION,analyze,apply,pearson,argmax,argmin};
})();