/* Size typography from immutable baseline values, not the previous update.
   Plotly relayout changes coordinates; its annotation fonts are pixel sizes. */
(()=>{'use strict';let state=null,multiplier=1,revision=0;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function span(r){return Array.isArray(r)&&r.length===2&&r.every(Number.isFinite)?Math.abs(r[1]-r[0]):null;}
function factor(initial,current){const a=span(initial),b=span(current);return a&&b?clamp(a/b,.15,8):1;}
function range(g,key){return g._fullLayout?.[key]?.range||g.layout?.[key]?.range;}
function rectangle(g){const r=g.getBoundingClientRect();return {width:Math.max(240,r.width),height:Math.max(240,r.height)};}
function changes(s){const g=s.g,box=rectangle(g),viewport=clamp(Math.min(box.width/s.box.width,box.height/s.box.height),.5,4)*multiplier;
 const x=factor(s.x,range(g,'xaxis')),y=factor(s.y,range(g,'yaxis')),u={},fonts=s.layout.font?.size||14,special=s.special;
 const scaled=(n,k=1,max=144)=>clamp(n*viewport*k,10,max);
 u['font.size']=special?clamp(fonts*multiplier,11,18):scaled(fonts);u['title.font.size']=scaled(s.layout.title?.font?.size||22,1,special?34:144);u['legend.font.size']=scaled(s.layout.legend?.font?.size||12,1,special?18:144);
 for(const key of ['xaxis','yaxis','yaxis2']){if(key==='yaxis2'&&!s.layout.yaxis2)continue;u[key+'.tickfont.size']=scaled(s.layout[key]?.tickfont?.size||12,1,special?18:144);u[key+'.title.font.size']=scaled(s.layout[key]?.title?.font?.size||14,1,special?20:144);}
 if(s.has3d){for(const key of ['xaxis','yaxis','zaxis']){u['scene.'+key+'.tickfont.size']=clamp((s.layout.scene?.[key]?.tickfont?.size||11)*multiplier,9,14);u['scene.'+key+'.title.font.size']=clamp((s.layout.scene?.[key]?.title?.font?.size||13)*multiplier,10,16);}}
 (s.layout.annotations||[]).forEach((a,i)=>{const xr=a.xref||'x',yr=a.yref||'y';const k=xr==='x'&&yr==='y'?Math.min(x,y):xr==='x'?x:yr==='y'?y:1;if(a.text)u['annotations['+i+'].font.size']=scaled(a.font?.size||fonts,k);if(a.showarrow)u['annotations['+i+'].arrowwidth']=clamp((a.arrowwidth||2)*viewport*k,1,12);});
 return {layout:u,viewport,zoom:Math.min(x,y),scaled};}
async function update(){const s=state;if(!s)return;const serial=++revision;const c=changes(s),signature=JSON.stringify(c.layout);if(signature===s.signature)return;s.signature=signature;s.busy=true;
 try{await window.Plotly.relayout(s.g,c.layout);if(state!==s||serial!==revision)return;
 for(let i=0;i<s.traces.length;i++){const t=s.traces[i],patch={};if(t.type==='parcoords'){patch['labelfont.size']=clamp((t.labelfont?.size||13)*multiplier,11,16);patch['tickfont.size']=clamp((t.tickfont?.size||10)*multiplier,9,13);patch['rangefont.size']=clamp((t.rangefont?.size||10)*multiplier,9,12);}else if(t.text||t.type==='pie'||t.type==='treemap'||t.type==='sunburst'){patch['textfont.size']=c.scaled(t.textfont?.size||14,t.type==='scatter'?c.zoom:1);}if(t.mode?.includes('markers+text')&&typeof t.marker?.size==='number')patch['marker.size']=clamp(t.marker.size*c.viewport*c.zoom,8,192);if(t.type==='table'){patch['header.font.size']=c.scaled(t.header?.font?.size||14);patch['cells.font.size']=c.scaled(t.cells?.font?.size||13);patch['header.height']=(t.header?.height||36)*c.viewport;patch['cells.height']=Array.isArray(t.cells?.height)?t.cells.height.map(h=>h*c.viewport):(t.cells?.height||36)*c.viewport;}if(Object.keys(patch).length)await window.Plotly.restyle(s.g,patch,[i]);}
 }finally{s.busy=false;}}
function schedule(){if(!state||state.busy)return;clearTimeout(state.timer);state.timer=setTimeout(()=>update().catch(e=>{console.warn('Typography update:',e.message);}),40);}
function bind(g,config){if(state){clearTimeout(state.timer);state.observer?.disconnect();state.g.removeListener?.('plotly_relayout',state.listener);}
 const traces=structuredClone(config.traces),layout=structuredClone(config.layout),has3d=traces.some(t=>['scatter3d','mesh3d','surface'].includes(t.type)),hasParcoords=traces.some(t=>t.type==='parcoords');state={g,layout,traces,has3d,hasParcoords,special:has3d||hasParcoords,box:rectangle(g),x:structuredClone(range(g,'xaxis')),y:structuredClone(range(g,'yaxis')),listener:schedule,busy:false};g.on?.('plotly_relayout',schedule);
 if(typeof ResizeObserver!=='undefined'){state.observer=new ResizeObserver(schedule);state.observer.observe(g);}return update();}
async function zoomBy(k){if(!state)return;const s=state,u={};for(const key of ['xaxis','yaxis']){const r=range(s.g,key);if(!span(r))continue;const center=(r[0]+r[1])/2;u[key+'.range']=r.map(v=>center+(v-center)/k);u[key+'.autorange']=false;}if(Object.keys(u).length){await window.Plotly.relayout(s.g,u);await update();}else await setMultiplier(multiplier*k);}
async function fit(){if(!state)return;const u={};for(const [key,r]of [['xaxis',state.x],['yaxis',state.y]])if(span(r)){u[key+'.range']=r;u[key+'.autorange']=false;}await window.Plotly.relayout(state.g,u);await update();}
function setMultiplier(n){multiplier=clamp(Number(n)||1,.8,2);return update();}
window.VCTypography={bind,update,zoomBy,fit,setMultiplier,get multiplier(){return multiplier;},factor,changes};
})();
