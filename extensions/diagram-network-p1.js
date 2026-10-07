(()=>{'use strict';
const E=window.VCDiagramEngine;if(!E)return;
const VERSION='1.0',NS='http://www.w3.org/2000/svg',clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const make=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
function spreadNetwork(data,{centerId=null,maxNodeWidth=220}={}){
 const ir=E.networkToIR(data,{fontSize:14,maxNodeWidth}),deg=E.degreeMap(ir);
 if(!ir.nodes.length)return {...ir,bounds:{x:0,y:0,width:0,height:0,right:0,bottom:0}};
 const hub=centerId&&ir.nodes.some(n=>n.id===centerId)?centerId:[...ir.nodes].sort((a,b)=>(deg.get(b.id)||0)-(deg.get(a.id)||0)||a.index-b.index)[0].id;
 const levels=E.bfsLevels(ir,hub),groups=new Map(),hubNode=ir.nodes.find(n=>n.id===hub);
 for(const n of ir.nodes){const lv=levels.get(n.id)||0;(groups.get(lv)||groups.set(lv,[]).get(lv)).push(n);}
 hubNode.x=0;hubNode.y=0;hubNode.level=0;
 const total=ir.nodes.length,ringGap=210+Math.min(120,total*6),nodeGap=total>16?42:total>10?36:32,hubSafe=Math.max(165,Math.max(hubNode.width,hubNode.height)+92);
 for(const [lv,arr] of [...groups.entries()].sort((a,b)=>a[0]-b[0])){
   if(lv===0)continue;
   arr.sort((a,b)=>(deg.get(b.id)||0)-(deg.get(a.id)||0)||a.index-b.index);
   const radius=Math.max(hubSafe+72,ringGap*lv),phase=-Math.PI/2+(lv%2?Math.PI/Math.max(4,arr.length):0);
   arr.forEach((n,i)=>{const a=phase+Math.PI*2*i/Math.max(1,arr.length);n.x=Math.cos(a)*radius;n.y=Math.sin(a)*radius*.84;n.level=lv;});
 }
 let nodes=E.avoidCollisions(ir.nodes,{gap:nodeGap,iterations:220,axis:'both'});
 const moved=nodes.find(n=>n.id===hub);nodes=nodes.map(n=>({...n,x:n.x-moved.x,y:n.y-moved.y}));
 nodes=nodes.map(n=>{if(n.id===hub)return n;const dx=n.x,dy=n.y/.84,dist=Math.hypot(dx,dy)||1,min=hubSafe+Math.hypot(n.width,n.height)/2+32;if(dist>=min)return n;const k=min/dist;return {...n,x:dx*k,y:dy*k*.84};});
 nodes=E.avoidCollisions(nodes,{gap:nodeGap,iterations:120,axis:'both'});
 const h2=nodes.find(n=>n.id===hub);nodes=nodes.map(n=>({...n,x:n.x-h2.x,y:n.y-h2.y}));
 let b=E.bounds(nodes,54),sx=54-b.x,sy=54-b.y;nodes=nodes.map(n=>({...n,x:n.x+sx,y:n.y+sy}));b=E.bounds(nodes,54);
 return {...ir,nodes,meta:{...ir.meta,hub,ringGap,nodeGap,hubSafeRadius:hubSafe,layoutVersion:'p1'},bounds:b};
}
function placeLabel(route,label,nodes,occupied,{fontSize=11,maxWidth=145}={}){
 const m=E.wrapText(label,{fontSize,maxWidth,maxLines:2}),base=route.labelPoint,dx=route.t.x-route.s.x,dy=route.t.y-route.s.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 const candidates=[18,-18,34,-34,50,-50,66,-66,82,-82,0].map(k=>({x:base.x+nx*k,y:base.y+ny*k}));
 let best=null,score=Infinity;
 for(const p of candidates){const box={x:p.x,y:p.y,width:m.width+18,height:m.height+12};let s=Math.hypot(p.x-base.x,p.y-base.y);for(const n of nodes)if(E.rectOverlap(box,n,10))s+=1800;for(const o of occupied)if(E.rectOverlap(box,o,8))s+=2400;if(s<score){score=s;best={...p,box,measure:m,score:s};}}
 return best;
}
function render(data,width,height,style,{centerId=null,directed=true,maxNodeWidth=220}={}){
 const L=spreadNetwork(data,{centerId,maxNodeWidth}),svg=make('svg',{xmlns:NS,width,height,viewBox:`0 0 ${width} ${height}`}),defs=make('defs'),marker=make('marker',{id:'vcNetworkArrowP1',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});
 marker.append(make('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:style.muted}));defs.append(marker);svg.append(defs);svg.append(make('rect',{width,height,fill:style.bg}));
 const fit=E.fitBounds(L.bounds,width,height,36),g=make('g',{transform:`translate(${fit.tx} ${fit.ty}) scale(${fit.scale})`});svg.append(g);
 const byId=new Map(L.nodes.map(n=>[n.id,n])),occupied=[],palette=window.VCStyle?.palette?.()||['#1F4E79'];
 L.edges.forEach((e,i)=>{const route=E.routeNetworkEdge(byId.get(e.source),byId.get(e.target),{curve:i%2?.22:-.22}),stroke=e.kind==='cause'?style.accent:style.muted;g.append(make('path',{d:route.d,fill:'none',stroke,'stroke-width':e.kind==='cause'?2.5:1.8,'stroke-opacity':.66,'stroke-linecap':'round','marker-end':e.directed!==false&&directed?'url(#vcNetworkArrowP1)':''}));if(e.label){const p=placeLabel(route,e.label,L.nodes,occupied),m=p.measure;occupied.push(p.box);g.append(make('rect',{x:p.x-m.width/2-7,y:p.y-m.height/2-4,width:m.width+14,height:m.height+8,rx:7,fill:style.bg,'fill-opacity':.97,stroke:style.grid,'stroke-width':.6,'data-edge-label-box':'1'}));const t=make('text',{x:p.x,y:p.y-m.height/2+m.lineHeight*.8,'text-anchor':'middle','font-family':style.fontFamily,'font-size':11,fill:style.muted});m.lines.forEach((line,j)=>t.append(make('tspan',{x:p.x,dy:j?m.lineHeight:0},line)));g.append(t);}});
 for(const n of L.nodes){const hub=n.id===L.meta.hub,color=hub?style.accent:palette[n.index%palette.length],fill=hub?style.accent:style.surface,ink=hub?(window.VCStyle?.inkOn?.(fill)||'#fff'):style.fg;g.append(make('rect',{x:n.x-n.width/2,y:n.y-n.height/2,width:n.width,height:n.height,rx:hub?16:12,fill,stroke:color,'stroke-width':hub?0:2,'data-node':'1','data-node-id':n.id}));const box=n.text,t=make('text',{x:n.x,y:n.y-(box.lines.length-1)*box.lineHeight/2+5,'text-anchor':'middle','font-family':hub?style.titleFamily:style.fontFamily,'font-size':hub?16:14,'font-weight':hub?700:550,fill:ink});box.lines.forEach((line,j)=>t.append(make('tspan',{x:n.x,dy:j?box.lineHeight:0},line)));g.append(t);}
 svg.dataset.engine='vc-diagram-network-v1';svg.dataset.layoutVersion='p1';svg.dataset.hubSafeRadius=String(L.meta.hubSafeRadius);return svg;
}
E.renderNetworkSVG=render;window.VCResearchNetworkP1={VERSION,spreadNetwork,placeLabel};
})();