/* Smart Layout v1: density-aware presentation layout. No source-data mutation. */
(()=>{'use strict';
const VERSION='1.0',base=chartConfig;
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const len=v=>Array.from(String(v??'')).length;
const finite=a=>Array.isArray(a)?a.filter(Number.isFinite):[];
function setMargin(layout,key,value){layout.margin={...(layout.margin||{}),[key]:Math.max(layout.margin?.[key]||0,value)};}
function wrapLabel(value,max=10,maxLines=3){
 const s=String(value??'');if(len(s)<=max)return s;
 const chars=Array.from(s),lines=[];while(chars.length&&lines.length<maxLines)lines.push(chars.splice(0,max).join(''));
 if(chars.length){let last=lines[maxLines-1]||'';while(len(last)>Math.max(1,max-1))last=Array.from(last).slice(0,-1).join('');lines[maxLines-1]=last+'…';}
 return lines.join('<br>');
}
function categoryCount(d){
 const s=Array.isArray(d.series)?d.series[0]:d;
 return Array.isArray(s?.x)?s.x.length:0;
}
function seriesCount(d){return Array.isArray(d.series)?d.series.length:1;}
function spans3d(d){
 const span=a=>{const v=finite(a);return v.length?Math.max(...v)-Math.min(...v):0;};
 return [span(d.x),span(d.y),span(d.z)];
}
function apply(d,r){
 const t=d.type,adjustments=[],add=(code,label)=>adjustments.push({code,label});
 const traces=r.traces||[],layout=r.layout||(r.layout={});
 const titleLen=len(d.title);
 if(titleLen>55){layout.title={...layout.title,font:{...(layout.title?.font||{}),size:22}};setMargin(layout,'t',112);add('compact-title','縮小長標題並增加上邊距');}
 else if(titleLen>38){layout.title={...layout.title,font:{...(layout.title?.font||{}),size:24}};setMargin(layout,'t',104);add('compact-title','稍微縮小長標題');}

 if(['bar','grouped_bar','stacked_bar'].includes(t)){
   const n=categoryCount(d),first=Array.isArray(d.series)?d.series[0]:d,labels=Array.isArray(first?.x)?first.x:[],stringLabels=labels.length&&labels.every(x=>typeof x==='string'),long=labels.filter(x=>len(x)>10).length;
   if(stringLabels&&(n>8||long)){
     const angle=n>20?-60:n>12?-45:-30,size=n>24?9:n>14?10:11,max=n>20?8:10;
     layout.xaxis={...(layout.xaxis||{}),automargin:true,tickangle:angle,tickfont:{...(layout.xaxis?.tickfont||{}),size},tickmode:'array',tickvals:labels,ticktext:labels.map(x=>wrapLabel(x,max,2))};
     setMargin(layout,'b',n>20?150:n>12?130:112);add('dense-category-axis','自動換行分類標籤並調整角度／下邊距');
   }
   const s=seriesCount(d);
   if(s>5){
     layout.legend={...(layout.legend||{}),font:{...(layout.legend?.font||{}),size:s>10?9:10}};
     if(s>10){layout.legend={...layout.legend,orientation:'v',x:1.02,xanchor:'left',y:1,yanchor:'top'};setMargin(layout,'r',170);add('legend-side','系列很多，圖例移到右側');}
     else{layout.legend={...layout.legend,orientation:'h',x:0,y:-.22};setMargin(layout,'b',145);add('legend-wrap-space','增加多系列圖例空間');}
   }
 }
 if(['line','area','stacked_area','scatter','bubble'].includes(t)){
   const s=seriesCount(d);
   if(s>5){
     layout.legend={...(layout.legend||{}),font:{...(layout.legend?.font||{}),size:s>10?9:10}};
     if(s>10){layout.legend={...layout.legend,orientation:'v',x:1.02,xanchor:'left',y:1};setMargin(layout,'r',170);add('legend-side','多系列圖例移到右側');}
     else{layout.legend={...layout.legend,orientation:'h',x:0,y:-.22};setMargin(layout,'b',140);add('legend-wrap-space','為多系列圖例增加底部空間');}
   }
 }
 if(['pie','donut'].includes(t)){
   const n=Array.isArray(d.labels)?d.labels.length:0,trace=traces.find(x=>x.type==='pie');
   if(trace&&n>5){
     trace.textposition='inside';trace.textinfo=n>8?'percent':'label+percent';trace.insidetextfont={...(trace.insidetextfont||{}),size:n>8?9:10};
     layout.legend={...(layout.legend||{}),orientation:'v',x:1.02,xanchor:'left',y:.98,yanchor:'top',font:{...(layout.legend?.font||{}),size:n>8?9:10}};
     setMargin(layout,'r',n>8?180:155);setMargin(layout,'b',58);add('pie-side-legend','分類較多，圖例移到右側並改用內部標籤');
   }
 }
 if(t==='parallel'){
   const trace=traces.find(x=>x.type==='parcoords'),n=Array.isArray(d.dimensions)?d.dimensions.length:0;
   if(trace){
     const domain=n<=2?[.16,.84]:n<=5?[.08,.92]:n<=8?[.04,.96]:[.02,.98];
     trace.domain={...(trace.domain||{}),x:domain,y:[.08,.92]};
     const label=n>=10?10:n>=8?11:n<=3?14:12,tick=n>=10?8:n>=8?9:10;
     trace.labelfont={...(trace.labelfont||{}),size:label};trace.tickfont={...(trace.tickfont||{}),size:tick};trace.rangefont={...(trace.rangefont||{}),size:tick};
     layout.margin={...(layout.margin||{}),l:n>8?28:48,r:n>8?28:48,b:48,t:92};add('parallel-domain','依維度數調整平行座標間距與字級');
   }
 }
 if(t==='sankey'){
   const trace=traces.find(x=>x.type==='sankey'),nodes=Array.isArray(d.labels)?d.labels.length:0,links=Array.isArray(d.values)?d.values.length:0;
   if(trace){
     const pad=nodes>25?10:nodes>15?14:nodes>8?18:24,thickness=nodes>25?12:nodes>15?14:18,font=nodes>25?8:nodes>15?9:11;
     trace.node={...(trace.node||{}),pad,thickness};trace.textfont={...(trace.textfont||{}),size:font};
     setMargin(layout,'l',nodes>15?72:56);setMargin(layout,'r',nodes>15?92:64);setMargin(layout,'b',links>25?78:64);add('sankey-density','依節點／流向密度調整間距、厚度與字級');
   }
 }
 if(['scatter3d','line3d','bar3d'].includes(t)){
   const [sx,sy,sz]=spans3d(d),positive=[sx,sy,sz].filter(x=>x>0),ratio=positive.length?Math.max(...positive)/Math.max(.000001,Math.min(...positive)):1,n=Array.isArray(d.x)?d.x.length:0;
   layout.scene={...(layout.scene||{}),aspectmode:ratio<=6?'data':'cube',camera:{...(layout.scene?.camera||{}),eye:n>250?{x:1.55,y:1.55,z:1.1}:ratio>6?{x:1.35,y:1.35,z:1}:{x:1.25,y:1.25,z:.95}}};
   if(ratio>6)add('3d-aspect','維度跨度差異大，改用等比例立方體避免壓扁');else add('3d-aspect','依資料跨度使用 data aspect');
   if(n>250)add('3d-camera','資料較密，拉遠 3D 視角');
 }
 if(t==='table'){
   const trace=traces.find(x=>x.type==='table'),cols=Array.isArray(d.headers)?d.headers.length:0,rows=Array.isArray(d.rows)?d.rows.length:0;
   if(trace&&(cols>6||rows>20)){
     const headerSize=cols>12?10:cols>8?11:12,cellSize=cols>12?9:cols>8?10:11,height=rows>50?24:rows>25?26:28;
     trace.header={...(trace.header||{}),font:{...(trace.header?.font||{}),size:headerSize},height:Math.max(trace.header?.height||0,height+4)};
     trace.cells={...(trace.cells||{}),font:{...(trace.cells?.font||{}),size:cellSize},height};
     setMargin(layout,'l',36);setMargin(layout,'r',36);add('table-density','依欄列密度縮小表格字級與列高');
   }
 }
 if(['heatmap','contour','surface'].includes(t)){
   const rows=Array.isArray(d.z)?d.z.length:0,cols=rows&&Array.isArray(d.z[0])?d.z[0].length:0;
   if(cols>16&&layout.xaxis){layout.xaxis={...layout.xaxis,tickangle:-45,tickfont:{...(layout.xaxis.tickfont||{}),size:9},automargin:true};setMargin(layout,'b',115);add('matrix-axis','矩陣欄數較多，旋轉 X 軸標籤');}
   if(rows>20&&layout.yaxis){layout.yaxis={...layout.yaxis,tickfont:{...(layout.yaxis.tickfont||{}),size:9},automargin:true};setMargin(layout,'l',92);add('matrix-axis','矩陣列數較多，增加 Y 軸空間');}
 }
 return {...r,smartLayout:{version:VERSION,adjustments}};
}
chartConfig=function(d){return apply(d,base(d));};
window.VCSmartLayout={VERSION,apply,wrapLabel,spans3d};
})();