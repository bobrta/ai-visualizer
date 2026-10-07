/* Executive Summary / Chart Composition v1
   Composes title, KPI cards, insight and source into Plotly paper space so exports match preview. */
(()=>{'use strict';
const VERSION='1.0',base=chartConfig,KEY='visual-canvas-executive-summary-v1';
const mode=()=>{try{return localStorage.getItem('visual-canvas-work-mode-v1')||'business';}catch{return'business';}};
function enabled(){try{const v=localStorage.getItem(KEY);return v===null?mode()==='business':v==='1';}catch{return mode()==='business';}}
function setEnabled(v){try{localStorage.setItem(KEY,v?'1':'0');}catch{}return Boolean(v);}
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('zh-TW',{maximumFractionDigits:1}).format(n):String(n??'');
const pct=n=>Number.isFinite(n)?(n*100).toFixed(Math.abs(n)>=.1?1:2)+'%':'';
const max=(a=[])=>a.filter(Number.isFinite).length?Math.max(...a.filter(Number.isFinite)):null;
const min=(a=[])=>a.filter(Number.isFinite).length?Math.min(...a.filter(Number.isFinite)):null;
function kpis(d,config){
 const out=[],push=(label,value,detail='')=>{if(value!==null&&value!==undefined&&String(value)!=='')out.push({label,value:String(value),detail});};
 const t=d.type,ss=Array.isArray(d.series)?d.series:[d],s=ss[0]||d;
 if(['bar','grouped_bar','stacked_bar'].includes(t)){
   const vals=ss.flatMap(x=>Array.isArray(x.y)?x.y:[]),hi=max(vals),lo=min(vals);
   push('最高值',fmt(hi));if(lo!==null&&hi!==null&&hi!==lo)push('最低值',fmt(lo));if(hi!==null&&lo!==null)push('差距',fmt(hi-lo));
 }
 else if(['line','area','stacked_area'].includes(t)){
   const y=s.y||[];if(y.length){push('最新值',fmt(y.at(-1)),String(s.x?.at(-1)??''));if(y.length>1&&Number.isFinite(y.at(-1))&&Number.isFinite(y.at(-2))){const diff=y.at(-1)-y.at(-2);push('最新變化',(diff>=0?'+':'')+fmt(diff));}const hi=max(y);push('期間高點',fmt(hi));}
 }
 else if(['pie','donut'].includes(t)){
   const vals=d.values||[],sum=vals.filter(Number.isFinite).reduce((a,b)=>a+b,0),hi=max(vals),i=vals.indexOf(hi);
   if(sum>0&&i>=0){push('最大類別',d.labels?.[i]??'',fmt(hi));push('最大占比',pct(hi/sum));push('類別數',String(vals.length));}
 }
 else if(['scatter','bubble'].includes(t)){
   const r=window.VCAutoInsight?.pearson?.(d.x||[],d.y||[]);push('樣本數',String(Math.min(d.x?.length||0,d.y?.length||0)));if(r!==null&&r!==undefined)push('相關係數 r',Number(r).toFixed(2));push('Y 最高',fmt(max(d.y||[])));
 }
 else if(t==='waterfall'){
   const vals=d.values||[],positive=vals.filter(x=>Number.isFinite(x)&&x>0).reduce((a,b)=>a+b,0),negative=vals.filter(x=>Number.isFinite(x)&&x<0).reduce((a,b)=>a+b,0),net=vals.filter(Number.isFinite).reduce((a,b)=>a+b,0);
   push('淨變化',(net>=0?'+':'')+fmt(net));push('正向貢獻','+'+fmt(positive));push('負向貢獻',fmt(negative));
 }
 else if(t==='sankey'){
   const vals=d.values||[];push('總流量',fmt(vals.filter(Number.isFinite).reduce((a,b)=>a+b,0)));push('最大流量',fmt(max(vals)));push('節點數',String((d.labels||[]).length));
 }
 else if(['scatter3d','line3d','bar3d'].includes(t)){
   push('資料點',String(d.x?.length||0));push('Z 最高',fmt(max(d.z||[])));push('Z 最低',fmt(min(d.z||[])));
 }
 else if(t==='table'){
   push('資料列',String((d.rows||[]).length));push('欄位數',String((d.headers||[]).length));
 }
 if(out.length<3&&config?.autoInsight?.items?.length){for(const item of config.autoInsight.items){if(out.length>=3)break;push('重點',item.text);}}
 return out.slice(0,3);
}
function headline(d,config){
 const explicit=d.presentation?.headline||d.headline;
 if(explicit)return String(explicit).slice(0,72);
 const insight=config?.autoInsight?.summary;
 if(insight)return String(insight).slice(0,72);
 return String(d.title||'').slice(0,72);
}
function source(d){return String(d.report?.source||d.source||'').trim().slice(0,220);}
function compose(d,r){
 if(!enabled()||mode()!=='business')return {...r,executiveSummary:{version:VERSION,enabled:false,kpis:[]}};
 const s=VCStyle.state(),layout=r.layout||(r.layout={}),cards=kpis(d,r),head=headline(d,r),insight=r.autoInsight?.summary||'',src=source(d),fg=s.fg,bg=s.bg,surface=s.surface,accent=s.accent;
 layout.title={...(layout.title||{}),text:''};
 layout.margin={...(layout.margin||{}),t:Math.max(layout.margin?.t||0,235),b:Math.max(layout.margin?.b||0,92),l:Math.max(layout.margin?.l||0,72),r:Math.max(layout.margin?.r||0,72)};
 const anns=[...(layout.annotations||[])],shapes=[...(layout.shapes||[])];
 anns.push({xref:'paper',yref:'paper',x:0,y:1.34,xanchor:'left',yanchor:'top',showarrow:false,text:'<b>'+escapeHtml(head)+'</b>',font:{family:s.titleFamily,size:26,color:fg},align:'left'});
 if(d.title&&String(d.title)!==head)anns.push({xref:'paper',yref:'paper',x:0,y:1.265,xanchor:'left',showarrow:false,text:escapeHtml(String(d.title).slice(0,90)),font:{family:s.fontFamily,size:11,color:s.muted},align:'left'});
 const gap=.018,n=Math.max(1,cards.length),w=Math.min(.29,(1-gap*(n-1))/n);
 cards.forEach((c,i)=>{const x0=i*(w+gap),x1=x0+w;shapes.push({type:'rect',xref:'paper',yref:'paper',x0,x1,y0:1.085,y1:1.205,line:{color:s.grid,width:1},fillcolor:surface,layer:'above'});anns.push({xref:'paper',yref:'paper',x:x0+.018,y:1.178,xanchor:'left',showarrow:false,text:escapeHtml(c.label),font:{family:s.fontFamily,size:9,color:s.muted}});anns.push({xref:'paper',yref:'paper',x:x0+.018,y:1.125,xanchor:'left',showarrow:false,text:'<b>'+escapeHtml(c.value)+'</b>',font:{family:s.titleFamily,size:18,color:i===0?accent:fg}});if(c.detail)anns.push({xref:'paper',yref:'paper',x:x1-.012,y:1.125,xanchor:'right',showarrow:false,text:escapeHtml(c.detail),font:{family:s.fontFamily,size:8,color:s.muted}});});
 if(insight)anns.push({xref:'paper',yref:'paper',x:0,y:-.135,xanchor:'left',yanchor:'top',showarrow:false,text:'<b>INSIGHT</b>  '+escapeHtml(String(insight).slice(0,150)),font:{family:s.fontFamily,size:10,color:fg},align:'left'});
 if(src)anns.push({xref:'paper',yref:'paper',x:1,y:-.135,xanchor:'right',yanchor:'top',showarrow:false,text:'資料來源：'+escapeHtml(src),font:{family:s.fontFamily,size:8,color:s.muted},align:'right'});
 shapes.push({type:'line',xref:'paper',yref:'paper',x0:0,x1:1,y0:1.235,y1:1.235,line:{color:accent,width:2}});
 layout.annotations=anns;layout.shapes=shapes;layout.paper_bgcolor=bg;layout.plot_bgcolor=s.surface;
 return {...r,executiveSummary:{version:VERSION,enabled:true,headline:head,kpis:cards,insight,source:src}};
}
function escapeHtml(v){return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
chartConfig=function(d){return compose(d,base(d));};
window.VCExecutiveSummary={VERSION,enabled,setEnabled,kpis,headline,source,compose,escapeHtml};
})();