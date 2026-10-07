/* Executive Summary / Chart Composition v2
   Multi-layout business presentation composition in Plotly paper space. */
(()=>{'use strict';
const VERSION='2.0',base=chartConfig,KEY='visual-canvas-executive-summary-v1',LAYOUT_KEY='visual-canvas-executive-layout-v2';
const LAYOUTS={auto:'自動選擇',top_kpi:'KPI 上排 + 主圖',left_kpi:'左 KPI + 右主圖',trend_focus:'大數字 + 趨勢圖',split_compare:'雙欄比較'};
const mode=()=>{try{return localStorage.getItem('visual-canvas-work-mode-v1')||'business';}catch{return'business';}};
function enabled(){try{const v=localStorage.getItem(KEY);return v===null?mode()==='business':v==='1';}catch{return mode()==='business';}}
function setEnabled(v){try{localStorage.setItem(KEY,v?'1':'0');}catch{}return Boolean(v);}
function layoutMode(){try{const v=localStorage.getItem(LAYOUT_KEY)||'auto';return LAYOUTS[v]?v:'auto';}catch{return'auto';}}
function setLayoutMode(v){const next=LAYOUTS[v]?v:'auto';try{localStorage.setItem(LAYOUT_KEY,next);}catch{}return next;}
const fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('zh-TW',{maximumFractionDigits:1}).format(n):String(n??'');
const pct=n=>Number.isFinite(n)?(n*100).toFixed(Math.abs(n)>=.1?1:2)+'%':'';
const max=(a=[])=>a.filter(Number.isFinite).length?Math.max(...a.filter(Number.isFinite)):null;
const min=(a=[])=>a.filter(Number.isFinite).length?Math.min(...a.filter(Number.isFinite)):null;
function kpis(d,config){
 const out=[],push=(label,value,detail='')=>{if(value!==null&&value!==undefined&&String(value)!=='')out.push({label,value:String(value),detail});};
 const t=d.type,ss=Array.isArray(d.series)?d.series:[d],s=ss[0]||d;
 if(['bar','grouped_bar','stacked_bar'].includes(t)){const vals=ss.flatMap(x=>Array.isArray(x.y)?x.y:[]),hi=max(vals),lo=min(vals);push('最高值',fmt(hi));if(lo!==null&&hi!==null&&hi!==lo)push('最低值',fmt(lo));if(hi!==null&&lo!==null)push('差距',fmt(hi-lo));}
 else if(['line','area','stacked_area'].includes(t)){const y=s.y||[];if(y.length){push('最新值',fmt(y.at(-1)),String(s.x?.at(-1)??''));if(y.length>1&&Number.isFinite(y.at(-1))&&Number.isFinite(y.at(-2))){const diff=y.at(-1)-y.at(-2);push('最新變化',(diff>=0?'+':'')+fmt(diff));}push('期間高點',fmt(max(y)));}}
 else if(['pie','donut'].includes(t)){const vals=d.values||[],sum=vals.filter(Number.isFinite).reduce((a,b)=>a+b,0),hi=max(vals),i=vals.indexOf(hi);if(sum>0&&i>=0){push('最大類別',d.labels?.[i]??'',fmt(hi));push('最大占比',pct(hi/sum));push('類別數',String(vals.length));}}
 else if(['scatter','bubble'].includes(t)){const r=window.VCAutoInsight?.pearson?.(d.x||[],d.y||[]);push('樣本數',String(Math.min(d.x?.length||0,d.y?.length||0)));if(r!==null&&r!==undefined)push('相關係數 r',Number(r).toFixed(2));push('Y 最高',fmt(max(d.y||[])));}
 else if(t==='waterfall'){const vals=d.values||[],positive=vals.filter(x=>Number.isFinite(x)&&x>0).reduce((a,b)=>a+b,0),negative=vals.filter(x=>Number.isFinite(x)&&x<0).reduce((a,b)=>a+b,0),net=vals.filter(Number.isFinite).reduce((a,b)=>a+b,0);push('淨變化',(net>=0?'+':'')+fmt(net));push('正向貢獻','+'+fmt(positive));push('負向貢獻',fmt(negative));}
 else if(t==='sankey'){const vals=d.values||[];push('總流量',fmt(vals.filter(Number.isFinite).reduce((a,b)=>a+b,0)));push('最大流量',fmt(max(vals)));push('節點數',String((d.labels||[]).length));}
 else if(['scatter3d','line3d','bar3d'].includes(t)){push('資料點',String(d.x?.length||0));push('Z 最高',fmt(max(d.z||[])));push('Z 最低',fmt(min(d.z||[])));}
 else if(t==='table'){push('資料列',String((d.rows||[]).length));push('欄位數',String((d.headers||[]).length));}
 if(out.length<3&&config?.autoInsight?.items?.length){for(const item of config.autoInsight.items){if(out.length>=3)break;push('重點',item.text);}}
 return out.slice(0,3);
}
function headline(d,config){const explicit=d.presentation?.headline||d.headline;if(explicit)return String(explicit).slice(0,72);const insight=config?.autoInsight?.summary;if(insight)return String(insight).slice(0,72);return String(d.title||'').slice(0,72);}
function source(d){return String(d.report?.source||d.source||'').trim().slice(0,220);}
function autoLayout(d){if(['line','area','stacked_area'].includes(d.type))return'trend_focus';if(['grouped_bar','stacked_bar','pie','donut'].includes(d.type))return'split_compare';if(d.type==='bar')return'left_kpi';return'top_kpi';}
function resolveLayout(d){const explicit=d.presentation?.executive_layout||d.executive_layout;if(explicit&&LAYOUTS[explicit]&&explicit!=='auto')return explicit;const saved=layoutMode();return saved==='auto'?autoLayout(d):saved;}
function escapeHtml(v){return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function ann(text,x,y,opt={}){return{xref:'paper',yref:'paper',x,y,showarrow:false,text,...opt};}
function card(shapes,anns,c,s,x0,x1,y0,y1,primary=false){
 shapes.push({type:'rect',xref:'paper',yref:'paper',x0,x1,y0,y1,line:{color:s.grid,width:1},fillcolor:s.surface,layer:'above'});
 anns.push(ann(escapeHtml(c.label),x0+.018,y1-.025,{xanchor:'left',font:{family:s.fontFamily,size:9,color:s.muted}}));
 anns.push(ann('<b>'+escapeHtml(c.value)+'</b>',x0+.018,y0+(y1-y0)*.43,{xanchor:'left',font:{family:s.titleFamily,size:primary?22:18,color:primary?s.accent:s.fg}}));
 if(c.detail)anns.push(ann(escapeHtml(c.detail),x1-.012,y0+(y1-y0)*.43,{xanchor:'right',font:{family:s.fontFamily,size:8,color:s.muted}}));
}
function setCartesianDomain(layout,xDomain,yDomain=[0,1]){for(const k of ['xaxis'])if(layout[k])layout[k]={...layout[k],domain:xDomain};for(const k of ['yaxis'])if(layout[k])layout[k]={...layout[k],domain:yDomain};}
function setTraceDomain(traces,xDomain,yDomain=[0,1]){for(const t of traces||[])if(['pie','parcoords','sankey'].includes(t.type))t.domain={...(t.domain||{}),x:xDomain,y:yDomain};}
function compose(d,r){
 if(!enabled()||mode()!=='business')return {...r,executiveSummary:{version:VERSION,enabled:false,kpis:[],layout:null}};
 const s=VCStyle.state(),layout=r.layout||(r.layout={}),traces=r.traces||[],cards=kpis(d,r),head=headline(d,r),insight=r.autoInsight?.summary||'',src=source(d),variant=resolveLayout(d);
 layout.title={...(layout.title||{}),text:''};const anns=[...(layout.annotations||[])],shapes=[...(layout.shapes||[])];
 layout.paper_bgcolor=s.bg;layout.plot_bgcolor=s.surface;
 anns.push(ann('<b>'+escapeHtml(head)+'</b>',0,1.30,{xanchor:'left',yanchor:'top',font:{family:s.titleFamily,size:26,color:s.fg},align:'left'}));
 if(d.title&&String(d.title)!==head)anns.push(ann(escapeHtml(String(d.title).slice(0,90)),0,1.23,{xanchor:'left',font:{family:s.fontFamily,size:11,color:s.muted},align:'left'}));
 shapes.push({type:'line',xref:'paper',yref:'paper',x0:0,x1:1,y0:1.205,y1:1.205,line:{color:s.accent,width:2}});

 if(variant==='top_kpi'){
   layout.margin={...(layout.margin||{}),t:Math.max(layout.margin?.t||0,235),b:Math.max(layout.margin?.b||0,92),l:Math.max(layout.margin?.l||0,72),r:Math.max(layout.margin?.r||0,72)};
   const gap=.018,n=Math.max(1,cards.length),w=Math.min(.29,(1-gap*(n-1))/n);
   cards.forEach((c,i)=>card(shapes,anns,c,s,i*(w+gap),i*(w+gap)+w,1.055,1.17,i===0));
 }
 if(variant==='left_kpi'){
   layout.margin={...(layout.margin||{}),t:Math.max(layout.margin?.t||0,170),b:Math.max(layout.margin?.b||0,92),l:Math.max(layout.margin?.l||0,58),r:Math.max(layout.margin?.r||0,58)};
   setCartesianDomain(layout,[.34,1]);setTraceDomain(traces,[.34,1]);
   cards.forEach((c,i)=>card(shapes,anns,c,s,0,.26,.72-i*.27,.93-i*.27,i===0));
   anns.push(ann('<b>KEY METRICS</b>',0,.99,{xanchor:'left',font:{family:s.fontFamily,size:9,color:s.muted}}));
 }
 if(variant==='trend_focus'){
   layout.margin={...(layout.margin||{}),t:Math.max(layout.margin?.t||0,170),b:Math.max(layout.margin?.b||0,92),l:Math.max(layout.margin?.l||0,58),r:Math.max(layout.margin?.r||0,58)};
   setCartesianDomain(layout,[.30,1]);setTraceDomain(traces,[.30,1]);
   const c=cards[0];if(c){shapes.push({type:'rect',xref:'paper',yref:'paper',x0:0,x1:.23,y0:.48,y1:.91,line:{color:s.grid,width:1},fillcolor:s.surface,layer:'above'});anns.push(ann(escapeHtml(c.label),.025,.84,{xanchor:'left',font:{family:s.fontFamily,size:10,color:s.muted}}));anns.push(ann('<b>'+escapeHtml(c.value)+'</b>',.025,.68,{xanchor:'left',font:{family:s.titleFamily,size:32,color:s.accent}}));if(c.detail)anns.push(ann(escapeHtml(c.detail),.025,.57,{xanchor:'left',font:{family:s.fontFamily,size:9,color:s.muted}}));}
   cards.slice(1,3).forEach((c,i)=>card(shapes,anns,c,s,0,.23,.31-i*.18,.44-i*.18,false));
 }
 if(variant==='split_compare'){
   layout.margin={...(layout.margin||{}),t:Math.max(layout.margin?.t||0,170),b:Math.max(layout.margin?.b||0,92),l:Math.max(layout.margin?.l||0,58),r:Math.max(layout.margin?.r||0,58)};
   setCartesianDomain(layout,[0,.64]);setTraceDomain(traces,[0,.64]);
   anns.push(ann('<b>KEY TAKEAWAYS</b>',.72,.98,{xanchor:'left',font:{family:s.fontFamily,size:9,color:s.muted}}));
   cards.forEach((c,i)=>card(shapes,anns,c,s,.72,.99,.70-i*.25,.91-i*.25,i===0));
 }
 if(insight)anns.push(ann('<b>INSIGHT</b>  '+escapeHtml(String(insight).slice(0,150)),0,-.13,{xanchor:'left',yanchor:'top',font:{family:s.fontFamily,size:10,color:s.fg},align:'left'}));
 if(src)anns.push(ann('資料來源：'+escapeHtml(src),1,-.13,{xanchor:'right',yanchor:'top',font:{family:s.fontFamily,size:8,color:s.muted},align:'right'}));
 layout.annotations=anns;layout.shapes=shapes;
 return {...r,executiveSummary:{version:VERSION,enabled:true,headline:head,kpis:cards,insight,source:src,layout:variant,layoutLabel:LAYOUTS[variant]}};
}
chartConfig=function(d){return compose(d,base(d));};
window.VCExecutiveSummary={VERSION,LAYOUTS,enabled,setEnabled,layoutMode,setLayoutMode,kpis,headline,source,autoLayout,resolveLayout,compose,escapeHtml};
})();