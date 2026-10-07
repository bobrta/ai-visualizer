/* Accessibility / Readability Engine v1
   Improves contrast and non-color differentiation without changing source data. */
(()=>{'use strict';
const VERSION='1.0',base=chartConfig;
const DASH=['solid','dash','dot','dashdot','longdash','longdashdot'];
const SYMBOL=['circle','square','diamond','cross','x','triangle-up','triangle-down','star'];
const PATTERN=['','/','\\','x','.','-','|','+'];

function hex6(v){const s=String(v||'').trim();if(/^#[0-9a-f]{6}$/i.test(s))return s.toUpperCase();if(/^#[0-9a-f]{3}$/i.test(s))return '#'+[...s.slice(1)].map(x=>x+x).join('').toUpperCase();return null;}
function rgb(hex){const h=hex6(hex);return h?h.slice(1).match(/../g).map(x=>parseInt(x,16)):null;}
function luminance(hex){const a=rgb(hex);if(!a)return null;const v=a.map(n=>{const x=n/255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2];}
function contrast(a,b){const x=luminance(a),y=luminance(b);if(x===null||y===null)return null;const hi=Math.max(x,y),lo=Math.min(x,y);return(hi+.05)/(lo+.05);}
function mix(a,b,t){const aa=rgb(a),bb=rgb(b);if(!aa||!bb)return a;return '#'+aa.map((v,i)=>Math.round(v+(bb[i]-v)*t).toString(16).padStart(2,'0')).join('').toUpperCase();}
function ensureContrast(color,bg,min=4.5){
 const c=hex6(color),b=hex6(bg);if(!c||!b)return color;if((contrast(c,b)||0)>=min)return c;
 const black='#111827',white='#FFFFFF',target=(contrast(black,b)||0)>=(contrast(white,b)||0)?black:white;
 for(let i=1;i<=20;i++){const next=mix(c,target,i/20);if((contrast(next,b)||0)>=min)return next;}
 return target;
}
function minFont(obj,key,min,add,label){
 if(!obj)return;const cur=Number(obj[key]);if(Number.isFinite(cur)&&cur<min){obj[key]=min;add('min-font',label+`提升至 ${min}px`);}
}
function apply(d,r){
 const s=VCStyle.state(),layout=r.layout||(r.layout={}),traces=r.traces||[],adjustments=[],warnings=[];
 const add=(code,label)=>{if(!adjustments.some(x=>x.code===code&&x.label===label))adjustments.push({code,label});};
 const warn=(code,label)=>warnings.push({code,label});
 const bg=hex6(layout.paper_bgcolor)||hex6(s.bg)||'#FFFFFF';
 const fg=ensureContrast(layout.font?.color||s.fg,bg,4.5),muted=ensureContrast(s.muted,bg,3.4),grid=ensureContrast(s.grid,bg,1.55);

 layout.font={...(layout.font||{}),color:fg};
 minFont(layout.font,'size',11,add,'全域文字');
 if(layout.title){layout.title.font={...(layout.title.font||{}),color:ensureContrast(layout.title.font?.color||s.fg,bg,4.5)};minFont(layout.title.font,'size',20,add,'圖表標題');}
 if(layout.legend){layout.legend.font={...(layout.legend.font||{}),color:ensureContrast(layout.legend.font?.color||muted,bg,3.4)};minFont(layout.legend.font,'size',10,add,'圖例');}

 for(const key of ['xaxis','yaxis']){
   if(!layout[key])continue;
   const a=layout[key];
   a.tickfont={...(a.tickfont||{}),color:ensureContrast(a.tickfont?.color||muted,bg,3.4)};
   minFont(a.tickfont,'size',9,add,key+' 刻度');
   a.title={...(a.title||{}),font:{...(a.title?.font||{}),color:ensureContrast(a.title?.font?.color||fg,bg,4.5)}};
   minFont(a.title.font,'size',11,add,key+' 軸標題');
   if(a.gridcolor&&hex6(a.gridcolor)!==grid){a.gridcolor=grid;add('grid-contrast','提高座標格線可見度');}
 }
 if(layout.scene){
   for(const key of ['xaxis','yaxis','zaxis']){
     const a=layout.scene[key]||(layout.scene[key]={});
     a.tickfont={...(a.tickfont||{}),color:ensureContrast(a.tickfont?.color||muted,bg,3.4)};
     minFont(a.tickfont,'size',9,add,'3D '+key+' 刻度');
     a.title={...(a.title||{}),font:{...(a.title?.font||{}),color:ensureContrast(a.title?.font?.color||fg,bg,4.5)}};
     minFont(a.title.font,'size',11,add,'3D '+key+' 標題');
     if(a.gridcolor){a.gridcolor=grid;}
   }
 }
 if(Array.isArray(layout.annotations))for(const a of layout.annotations){a.font={...(a.font||{}),color:ensureContrast(a.font?.color||fg,bg,4.5)};minFont(a.font,'size',10,add,'標註');}

 const mono=s.theme==='mono';
 const lineLike=traces.filter(t=>t.type==='scatter'&&String(t.mode||'').includes('lines'));
 lineLike.forEach((t,i)=>{
   t.line={...(t.line||{}),dash:DASH[i%DASH.length],width:Math.max(Number(t.line?.width)||0,2.4)};
   if(lineLike.length>1||mono){
     t.mode=String(t.mode||'lines').includes('markers')?t.mode:t.mode+'+markers';
     t.marker={...(t.marker||{}),symbol:SYMBOL[i%SYMBOL.length],size:Math.max(Number(t.marker?.size)||0,6.5),line:{...(t.marker?.line||{}),width:1,color:bg}};
     add('noncolor-lines','折線系列加入不同線型與 marker');
   }
 });

 const bars=traces.filter(t=>t.type==='bar');
 if((mono||bars.length>3)&&bars.length){
   bars.forEach((t,i)=>{const shape=mono?PATTERN[(i%(PATTERN.length-1))+1]:PATTERN[i%PATTERN.length];t.marker={...(t.marker||{}),pattern:{...(t.marker?.pattern||{}),shape,solidity:mono?.28:.22},line:{...(t.marker?.line||{}),color:ensureContrast(s.fg,bg,3),width:mono?1.1:.8}};});
   add('bar-patterns','長條系列加入紋理，避免只靠顏色');
 }

 for(const t of traces){
   if(t.type==='scatter'&&String(t.mode||'').includes('markers')&&!String(t.mode||'').includes('lines')){
     t.marker={...(t.marker||{}),size:Math.max(Number(t.marker?.size)||0,7),line:{...(t.marker?.line||{}),width:Math.max(Number(t.marker?.line?.width)||0,1),color:ensureContrast(t.marker?.line?.color||s.fg,bg,3)}};
   }
   if(t.type==='pie'){
     t.textinfo=t.textinfo||'label+percent';t.textfont={...(t.textfont||{}),color:ensureContrast(t.textfont?.color||fg,bg,4.5)};
     minFont(t.textfont,'size',10,add,'圓餅標籤');
     t.marker={...(t.marker||{}),line:{...(t.marker?.line||{}),color:bg,width:Math.max(Number(t.marker?.line?.width)||0,2)}};
     add('pie-labels','圓餅保留文字／比例，不只靠顏色');
   }
   if(t.type==='sankey'){
     t.node={...(t.node||{}),line:{...(t.node?.line||{}),color:ensureContrast(s.fg,bg,3),width:Math.max(Number(t.node?.line?.width)||0,1)}};
     if((d.labels||[]).some(x=>String(x).length>28))warn('long-sankey-label','桑基節點文字很長，建議縮短名稱以提高可讀性。');
   }
   if(t.type==='parcoords'){
     t.labelfont={...(t.labelfont||{}),color:ensureContrast(t.labelfont?.color||fg,bg,4.5)};minFont(t.labelfont,'size',10,add,'平行座標標籤');
     t.tickfont={...(t.tickfont||{}),color:ensureContrast(t.tickfont?.color||muted,bg,3.4)};minFont(t.tickfont,'size',8,add,'平行座標刻度');
     t.rangefont={...(t.rangefont||{}),color:ensureContrast(t.rangefont?.color||muted,bg,3.4)};minFont(t.rangefont,'size',8,add,'平行座標範圍');
   }
   if(t.type==='table'){
     t.header={...(t.header||{}),font:{...(t.header?.font||{})}};minFont(t.header.font,'size',10,add,'表格表頭');
     t.cells={...(t.cells||{}),font:{...(t.cells?.font||{})}};minFont(t.cells.font,'size',9,add,'表格內容');
   }
 }
 const report={version:VERSION,adjustments,warnings,contrast:{foreground:contrast(fg,bg),muted:contrast(muted,bg)},mono};
 return {...r,accessibility:report};
}
chartConfig=function(d){return apply(d,base(d));};
window.VCAccessibility={VERSION,hex6,rgb,luminance,contrast,mix,ensureContrast,apply,DASH,SYMBOL,PATTERN};
})();