(()=>{'use strict';
const E=window.VCDiagramEngine;if(!E)return;
const VERSION='1.5',NS='http://www.w3.org/2000/svg',clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const make=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
function spreadNetwork(data,{centerId=null,maxNodeWidth=220}={}){
 const longest=Math.max(0,...(data.nodes||[]).map(n=>Array.from(String(n.name??n.label??n.id??'')).length));
 const adaptiveWidth=Math.max(maxNodeWidth,longest>28?300:longest>18?270:maxNodeWidth);
 const ir=E.networkToIR(data,{fontSize:14,maxNodeWidth:adaptiveWidth}),deg=E.degreeMap(ir);
 if(!ir.nodes.length)return {...ir,bounds:{x:0,y:0,width:0,height:0,right:0,bottom:0}};
 const hub=centerId&&ir.nodes.some(n=>n.id===centerId)?centerId:[...ir.nodes].sort((a,b)=>(deg.get(b.id)||0)-(deg.get(a.id)||0)||a.index-b.index)[0].id;
 const levels=E.bfsLevels(ir,hub),groups=new Map(),hubNode=ir.nodes.find(n=>n.id===hub);
 for(const n of ir.nodes){const lv=levels.get(n.id)||0;(groups.get(lv)||groups.set(lv,[]).get(lv)).push(n);}
 hubNode.x=0;hubNode.y=0;hubNode.level=0;
 const total=ir.nodes.length,baseRingGap=210+Math.min(140,total*6),nodeGap=total>20?48:total>16?42:total>10?36:32,hubSafe=Math.max(175,Math.max(hubNode.width,hubNode.height)+104),ringRadii={};
 for(const [lv,arr] of [...groups.entries()].sort((a,b)=>a[0]-b[0])){
   if(lv===0)continue;
   arr.sort((a,b)=>(deg.get(b.id)||0)-(deg.get(a.id)||0)||a.index-b.index);
   const weights=arr.map(n=>Math.max(n.width*.94,n.height)+nodeGap*1.55),circumferenceNeed=weights.reduce((a,b)=>a+b,0);
   const densityRadius=circumferenceNeed/(Math.PI*2*.74);
   const radius=Math.max(hubSafe+86+(lv-1)*baseRingGap*.7,baseRingGap*lv,densityRadius+(lv-1)*baseRingGap*.75);
   ringRadii[lv]=radius;
   const phase=-Math.PI/2+(lv%2?Math.PI/Math.max(4,arr.length):0),totalWeight=Math.max(1,circumferenceNeed);
   let used=0;
   arr.forEach((n,i)=>{const w=weights[i],a=phase+Math.PI*2*((used+w/2)/totalWeight);used+=w;n.x=Math.cos(a)*radius;n.y=Math.sin(a)*radius*.84;n.level=lv;});
 }
 let nodes=E.avoidCollisions(ir.nodes,{gap:nodeGap,iterations:260,axis:'both'});
 const moved=nodes.find(n=>n.id===hub);nodes=nodes.map(n=>({...n,x:n.x-moved.x,y:n.y-moved.y}));
 nodes=nodes.map(n=>{if(n.id===hub)return n;const dx=n.x,dy=n.y/.84,dist=Math.hypot(dx,dy)||1,min=hubSafe+Math.hypot(n.width,n.height)/2+36;if(dist>=min)return n;const k=min/dist;return {...n,x:dx*k,y:dy*k*.84};});
 nodes=E.avoidCollisions(nodes,{gap:nodeGap,iterations:160,axis:'both'});
 const h2=nodes.find(n=>n.id===hub);nodes=nodes.map(n=>({...n,x:n.x-h2.x,y:n.y-h2.y}));
 let b=E.bounds(nodes,58),sx=58-b.x,sy=58-b.y;nodes=nodes.map(n=>({...n,x:n.x+sx,y:n.y+sy}));b=E.bounds(nodes,58);
 return {...ir,nodes,meta:{...ir.meta,hub,ringGap:baseRingGap,ringRadii,nodeGap,hubSafeRadius:hubSafe,maxNodeWidth:adaptiveWidth,layoutVersion:'p6'},bounds:b};
}
function placeLabel(route,label,nodes,occupied,{fontSize=11,maxWidth=155}={}){
 const m=E.wrapText(label,{fontSize,maxWidth,maxLines:2}),base=route.labelPoint,dx=route.t.x-route.s.x,dy=route.t.y-route.s.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,nx=-uy,ny=ux;
 const candidates=[];
 for(const normal of [20,-20,36,-36,54,-54,72,-72,92,-92,0])for(const along of [0,18,-18])candidates.push({x:base.x+nx*normal+ux*along,y:base.y+ny*normal+uy*along});
 let best=null,score=Infinity;
 for(const p of candidates){const box={x:p.x,y:p.y,width:m.width+20,height:m.height+14};let s=Math.hypot(p.x-base.x,p.y-base.y);for(const n of nodes)if(E.rectOverlap(box,n,10))s+=2400;for(const o of occupied)if(E.rectOverlap(box,o,8))s+=3200;if(s<score){score=s;best={...p,box,measure:m,score:s};}}
 return best;
}
function routeEdge(source,target,polarity=1,{bendScale=1,bend=null}={}){
 const dx=target.x-source.x,dy=target.y-source.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
 const sx=source.x+ux*source.width*.48,sy=source.y+uy*source.height*.42,tx=target.x-ux*target.width*.48,ty=target.y-uy*target.height*.42,nx=-uy,ny=ux,bendMag=bend==null?clamp(len*.18*bendScale,24,160):Math.abs(bend),bendValue=polarity*bendMag,cx=(sx+tx)/2+nx*bendValue,cy=(sy+ty)/2+ny*bendValue;
 return {d:`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`,s:{x:sx,y:sy},t:{x:tx,y:ty},control:{x:cx,y:cy},labelPoint:{x:(sx+2*cx+tx)/4,y:(sy+2*cy+ty)/4},polarity,bendScale,bend:bendMag};
}
function quadPoint(route,t){const u=1-t;return{x:u*u*route.s.x+2*u*t*route.control.x+t*t*route.t.x,y:u*u*route.s.y+2*u*t*route.control.y+t*t*route.t.y};}
function routeSamples(route){return [.22,.34,.46,.58,.7,.82].map(t=>quadPoint(route,t));}
function priorRoutePenalty(route,priorPlans,source,target){
 const pts=routeSamples(route);let score=0;
 for(const plan of priorPlans||[]){
   if(!plan?.route||!plan?.edge)continue;
   const shared=plan.edge.source===source.id||plan.edge.target===source.id||plan.edge.source===target.id||plan.edge.target===target.id;
   const prior=routeSamples(plan.route);
   for(const a of pts)for(const b of prior){
     const d=Math.hypot(a.x-b.x,a.y-b.y);
     if(d<24)score+=(shared?28:1100)*(1-d/24);
   }
 }
 return score;
}
function routePenalty(route,nodes,source,target,hub,hubSafe,priorPlans=[]){
 let score=priorRoutePenalty(route,priorPlans,source,target);
 for(const t of [.18,.32,.5,.68,.82]){
   const p=quadPoint(route,t);
   for(const n of nodes)if(n.id!==source.id&&n.id!==target.id&&E.nodeContainsPoint(n,p,12))score+=5000;
   if(hub&&source.id!==hub.id&&target.id!==hub.id){
     const d=Math.hypot(p.x-hub.x,(p.y-hub.y)/.84);
     if(d<hubSafe+26)score+=(hubSafe+26-d)*28;
   }
 }
 return score;
}
function chooseRoute(source,target,nodes,hub,hubSafe,edgeIndex=0,priorPlans=[]){
 const base=edgeIndex%2?-1:1,candidates=[];
 for(const scale of [1,.72,1.35,1.8])for(const sign of [base,-base])candidates.push(routeEdge(source,target,sign,{bendScale:scale}));
 if(hub&&source.id!==hub.id&&target.id!==hub.id){
   const mx=(source.x+target.x)/2,my=(source.y+target.y)/2,midDist=Math.hypot(mx-hub.x,(my-hub.y)/.84);
   if(midDist<hubSafe+60){
     const detour=Math.min(480,Math.max(180,2*(hubSafe+54)));
     candidates.push(routeEdge(source,target,1,{bend:detour}),routeEdge(source,target,-1,{bend:detour}));
   }
 }
 let best=candidates[0],bestScore=Infinity;
 for(const r of candidates){
   let s=routePenalty(r,nodes,source,target,hub,hubSafe,priorPlans);
   if(hub&&source.id!==hub.id&&target.id!==hub.id){
     const c1=routeEdge(source,target,1,{bend:r.bend}),c2=routeEdge(source,target,-1,{bend:r.bend});
     const d1=Math.hypot(c1.control.x-hub.x,(c1.control.y-hub.y)/.84),d2=Math.hypot(c2.control.x-hub.x,(c2.control.y-hub.y)/.84);
     const outward=d1>=d2?1:-1;if(r.polarity!==outward)s+=420;
   }
   if(s<bestScore){bestScore=s;best={...r,score:s,mode:s<5000?'clear':'fallback'};}
 }
 return best;
}
function contentBounds(layout,plans,padding=24){
 let left=layout.bounds.x,top=layout.bounds.y,right=layout.bounds.right,bottom=layout.bounds.bottom;
 const include=(x,y,w=0,h=0)=>{left=Math.min(left,x-w/2);right=Math.max(right,x+w/2);top=Math.min(top,y-h/2);bottom=Math.max(bottom,y+h/2);};
 for(const p of plans){include(p.route.control.x,p.route.control.y,8,8);if(p.label)include(p.label.box.x,p.label.box.y,p.label.box.width,p.label.box.height);}
 return {x:left-padding,y:top-padding,width:right-left+padding*2,height:bottom-top+padding*2,right:right+padding,bottom:bottom+padding};
}
function render(data,width,height,style,{centerId=null,directed=true,maxNodeWidth=220}={}){
 const L=spreadNetwork(data,{centerId,maxNodeWidth}),svg=make('svg',{xmlns:NS,width,height,viewBox:`0 0 ${width} ${height}`}),defs=make('defs'),marker=make('marker',{id:'vcNetworkArrowP1',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});
 marker.append(make('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:style.muted}));defs.append(marker);svg.append(defs);svg.append(make('rect',{width,height,fill:style.bg}));
 const byId=new Map(L.nodes.map(n=>[n.id,n])),hub=byId.get(L.meta.hub),plans=[];
 L.edges.forEach((e,i)=>{const route=chooseRoute(byId.get(e.source),byId.get(e.target),L.nodes,hub,L.meta.hubSafeRadius,i,plans);plans.push({edge:e,route,label:null,index:i});});
 const roleOf=e=>e.kind==='cause'?'cause':(e.source===L.meta.hub||e.target===L.meta.hub)?'spoke':'cross',priority={cause:0,spoke:1,cross:2},occupied=[];
 for(const p of [...plans].sort((a,b)=>priority[roleOf(a.edge)]-priority[roleOf(b.edge)]||a.index-b.index)){if(p.edge.label){p.label=placeLabel(p.route,p.edge.label,L.nodes,occupied);if(p.label)occupied.push(p.label.box);}}
 const fit=E.fitBounds(contentBounds(L,plans,18),width,height,36),g=make('g',{transform:`translate(${fit.tx} ${fit.ty}) scale(${fit.scale})`});svg.append(g);
 const palette=window.VCStyle?.palette?.()||['#1F4E79'],degrees=E.degreeMap(L),dense=L.nodes.length>=16,renderPlans=[...plans].sort((a,b)=>priority[roleOf(b.edge)]-priority[roleOf(a.edge)]||a.index-b.index);
 renderPlans.forEach(({edge:e,route,label})=>{
   const spoke=e.source===L.meta.hub||e.target===L.meta.hub,cause=e.kind==='cause',role=cause?'cause':spoke?'spoke':'cross',stroke=cause?style.accent:spoke?style.muted:style.grid,width=cause?2.7:spoke?2.15:dense?1.1:1.35,opacity=cause?.86:spoke?.72:dense?.32:.44;
   g.append(make('path',{d:route.d,fill:'none',stroke,'stroke-width':width,'stroke-opacity':opacity,'stroke-linecap':'round','marker-end':e.directed!==false&&directed?'url(#vcNetworkArrowP1)':'','data-edge-role':role,'data-route-mode':route.mode,'data-route-score':Math.round(route.score||0)}));
   if(label){const p=label,m=p.measure;g.append(make('rect',{x:p.x-m.width/2-7,y:p.y-m.height/2-4,width:m.width+14,height:m.height+8,rx:7,fill:style.bg,'fill-opacity':spoke?.98:.94,stroke:spoke?style.grid:'none','stroke-width':spoke?.65:0,'data-edge-label-box':'1','data-edge-label-role':role}));const t=make('text',{x:p.x,y:p.y-m.height/2+m.lineHeight*.8,'text-anchor':'middle','font-family':style.fontFamily,'font-size':spoke?11.2:dense?10.2:10.8,'font-weight':spoke?600:500,fill:spoke?style.fg:style.muted});m.lines.forEach((line,j)=>t.append(make('tspan',{x:p.x,dy:j?m.lineHeight:0},line)));g.append(t);}
 });
 for(const n of L.nodes){
   const isHub=n.id===L.meta.hub,primary=!isHub&&n.level===1,color=isHub?style.accent:palette[n.index%palette.length],fill=isHub?style.accent:primary?(E.mixHex?.(style.surface,color,.08)||style.surface):style.surface,ink=isHub?(window.VCStyle?.inkOn?.(fill)||'#fff'):style.fg,role=isHub?'hub':primary?'primary':'secondary',degree=degrees.get(n.id)||0;
   g.append(make('rect',{x:n.x-n.width/2,y:n.y-n.height/2,width:n.width,height:n.height,rx:isHub?16:primary?13:11,fill,stroke:color,'stroke-width':isHub?0:primary?2.2:1.35,'stroke-opacity':isHub?1:primary?.92:.66,'data-node':'1','data-node-id':n.id,'data-node-role':role,'data-node-degree':degree}));
   const box=n.text,t=make('text',{x:n.x,y:n.y-(box.lines.length-1)*box.lineHeight/2+5,'text-anchor':'middle','font-family':isHub?style.titleFamily:style.fontFamily,'font-size':isHub?16:primary?14.2:dense?12.8:13.6,'font-weight':isHub?700:primary?620:520,fill:ink});box.lines.forEach((line,j)=>t.append(make('tspan',{x:n.x,dy:j?box.lineHeight:0},line)));g.append(t);
 }
 svg.dataset.engine='vc-diagram-network-v1';svg.dataset.layoutVersion='p6';svg.dataset.densityMode=dense?'dense':'normal';svg.dataset.hubSafeRadius=String(L.meta.hubSafeRadius);svg.dataset.fitScale=String(fit.scale);svg.dataset.routeFallbacks=String(plans.filter(p=>p.route.mode==='fallback').length);return svg;
}
E.renderNetworkSVG=render;window.VCResearchNetworkP1={VERSION,spreadNetwork,placeLabel,routeEdge,chooseRoute,contentBounds,routeSamples,priorRoutePenalty};
})();