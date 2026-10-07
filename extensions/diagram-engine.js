/* Visual Canvas Diagram Engine v1
   Shared layout primitives for trees, networks, flows and stakeholder diagrams. */
(()=>{'use strict';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const cjk=/[\u2e80-\u9fff\uf900-\ufaff]/;
function charWidth(ch,fontSize=14){if(cjk.test(ch))return fontSize;if(/\s/.test(ch))return fontSize*.34;if(/[A-Z0-9]/.test(ch))return fontSize*.62;return fontSize*.54;}
function lineWidth(s,fontSize=14){return Array.from(String(s)).reduce((n,ch)=>n+charWidth(ch,fontSize),0);}
function wrapText(text,{fontSize=14,maxWidth=240,maxLines=6}={}){
 const source=String(text??'').trim(),lines=[];if(!source)return {lines:[''],width:0,height:fontSize*1.35,lineHeight:fontSize*1.35};
 let line='',width=0;
 for(const ch of Array.from(source)){
   if(ch==='\n'){lines.push(line);line='';width=0;if(lines.length>=maxLines)break;continue;}
   const w=charWidth(ch,fontSize);
   if(line&&width+w>maxWidth){lines.push(line);line=ch;width=w;if(lines.length>=maxLines)break;}
   else{line+=ch;width+=w;}
 }
 if(lines.length<maxLines&&line)lines.push(line);
 if(lines.length===maxLines){
   const consumed=lines.join('').length;if(consumed<source.replace(/\n/g,'').length){let last=lines[maxLines-1];while(last&&lineWidth(last+'…',fontSize)>maxWidth)last=last.slice(0,-1);lines[maxLines-1]=last+'…';}
 }
 const widths=lines.map(x=>lineWidth(x,fontSize)),lineHeight=fontSize*1.42;
 return {lines,width:Math.max(0,...widths),height:Math.max(lineHeight,lines.length*lineHeight),lineHeight};
}
function textBox(text,{fontSize=14,maxWidth=240,minWidth=92,padX=18,padY=12,maxLines=6}={}){
 const m=wrapText(text,{fontSize,maxWidth:maxWidth-padX*2,maxLines});
 return {width:clamp(m.width+padX*2,minWidth,maxWidth),height:m.height+padY*2,lines:m.lines,lineHeight:m.lineHeight,fontSize,padX,padY};
}
function normalizeIR(ir){
 if(!ir||!Array.isArray(ir.nodes)||!Array.isArray(ir.edges))throw Error('Diagram IR 需要 nodes 與 edges。');
 const seen=new Set(),nodes=ir.nodes.map((n,i)=>{const id=String(n.id??'').trim();if(!id||seen.has(id))throw Error('Diagram node id 必須唯一且非空。');seen.add(id);return {id,label:String(n.label??n.name??id),shape:n.shape||'rounded',group:n.group??null,level:Number.isFinite(n.level)?n.level:0,x:Number.isFinite(n.x)?n.x:0,y:Number.isFinite(n.y)?n.y:0,width:Number.isFinite(n.width)?n.width:0,height:Number.isFinite(n.height)?n.height:0,text:n.text||null,style:n.style||{},data:n.data||null,index:i};});
 const edges=ir.edges.map((e,i)=>{const source=String(e.source??''),target=String(e.target??'');if(!seen.has(source)||!seen.has(target))throw Error('Diagram edge 必須連到既有節點。');return {id:String(e.id||('e'+i)),source,target,label:String(e.label??e.relation??''),kind:e.kind||'relation',directed:e.directed!==false,routeStyle:e.routeStyle||'curved',style:e.style||{}};});
 return {nodes,edges,meta:{layout:'free',direction:'LR',padding:32,levelGap:96,siblingGap:24,...(ir.meta||{})}};
}
function bounds(nodes,padding=0){
 if(!nodes.length)return {x:0,y:0,width:0,height:0,right:0,bottom:0};
 let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
 for(const n of nodes){const w=n.width||0,h=n.height||0;left=Math.min(left,n.x-w/2);right=Math.max(right,n.x+w/2);top=Math.min(top,n.y-h/2);bottom=Math.max(bottom,n.y+h/2);}
 return {x:left-padding,y:top-padding,width:right-left+padding*2,height:bottom-top+padding*2,right:right+padding,bottom:bottom+padding};
}
function rectOverlap(a,b,gap=0){return Math.abs(a.x-b.x)<(a.width+b.width)/2+gap&&Math.abs(a.y-b.y)<(a.height+b.height)/2+gap;}
function avoidCollisions(nodes,{gap=18,iterations=80,axis='both'}={}){
 const out=nodes.map(n=>({...n}));
 for(let it=0;it<iterations;it++){
   let moved=false;
   for(let i=0;i<out.length;i++){
     for(let j=i+1;j<out.length;j++){
       const a=out[i],b=out[j];
       if(!rectOverlap(a,b,gap))continue;
       const dx=b.x-a.x,dy=b.y-a.y;
       const ox=(a.width+b.width)/2+gap-Math.abs(dx),oy=(a.height+b.height)/2+gap-Math.abs(dy);
       if((axis==='x'||(axis==='both'&&ox<oy))&&ox>0){
         const sign=dx>=0?1:-1;a.x-=sign*ox/2;b.x+=sign*ox/2;
       }else if(axis!=='x'&&oy>0){
         const sign=dy>=0?1:-1;a.y-=sign*oy/2;b.y+=sign*oy/2;
       }
       moved=true;
     }
   }
   if(!moved)break;
 }
 return out;
}
function treeToIR(root,{fontSize=15,maxNodeWidth=290}={}){
 let seq=0;const nodes=[],edges=[];
 function walk(node,depth,parent=null){const id='n'+seq++;const box=textBox(node.name??node.label??'',{fontSize,maxWidth:maxNodeWidth,minWidth:118,padX:18,padY:11,maxLines:5});nodes.push({id,label:String(node.name??node.label??''),level:depth,width:box.width,height:box.height,text:box,shape:depth===0?'rounded-strong':'rounded',data:node});if(parent)edges.push({id:'e'+edges.length,source:parent,target:id,label:String(node.relation??''),routeStyle:'curved',directed:true});for(const child of node.children||[])walk(child,depth+1,id);return id;}
 walk(root,0);return normalizeIR({nodes,edges,meta:{layout:'tree',direction:'LR'}});
}
function layoutTree(root,{direction='LR',fontSize=15,maxNodeWidth=290,levelGap=110,siblingGap=26,padding=36}={}){
 const ir=treeToIR(root,{fontSize,maxNodeWidth}),byId=new Map(ir.nodes.map(n=>[n.id,n])),children=new Map(ir.nodes.map(n=>[n.id,[]]));
 for(const e of ir.edges)children.get(e.source).push(e.target);
 const maxDepth=Math.max(...ir.nodes.map(n=>n.level)),levelWidths=Array(maxDepth+1).fill(0);
 for(const n of ir.nodes)levelWidths[n.level]=Math.max(levelWidths[n.level],n.width);
 const xByDepth=[];let cursor=padding;for(let d=0;d<=maxDepth;d++){xByDepth[d]=cursor+levelWidths[d]/2;cursor+=levelWidths[d]+levelGap;}
 const span=new Map();
 function calc(id){const n=byId.get(id),kids=children.get(id);if(!kids.length){span.set(id,n.height);return n.height;}const total=kids.reduce((sum,k,i)=>sum+calc(k)+(i?siblingGap:0),0);const v=Math.max(n.height,total);span.set(id,v);return v;}
 const rootId=ir.nodes.find(n=>n.level===0).id;calc(rootId);
 function place(id,top){const n=byId.get(id),kids=children.get(id),total=kids.reduce((sum,k,i)=>sum+span.get(k)+(i?siblingGap:0),0);n.x=xByDepth[n.level];n.y=top+span.get(id)/2;if(kids.length){let childTop=n.y-total/2;for(const k of kids){place(k,childTop);childTop+=span.get(k)+siblingGap;}}}
 place(rootId,padding);
 let nodes=avoidCollisions(ir.nodes,{gap:14,iterations:30,axis:'y'});
 let b=bounds(nodes,padding);const shiftX=padding-b.x,shiftY=padding-b.y;nodes=nodes.map(n=>({...n,x:n.x+shiftX,y:n.y+shiftY}));b=bounds(nodes,padding);
 if(direction==='RL')nodes=nodes.map(n=>({...n,x:b.width-n.x}));
 if(direction==='TB'||direction==='BT'){nodes=nodes.map(n=>({...n,x:n.y,y:n.x,width:n.height,height:n.width}));if(direction==='BT'){const bb=bounds(nodes,padding);nodes=nodes.map(n=>({...n,y:bb.height-n.y}));}}
 return {...ir,nodes,meta:{...ir.meta,direction,levelGap,siblingGap,padding},bounds:bounds(nodes,padding)};
}
function anchor(node,side){if(side==='left')return{x:node.x-node.width/2,y:node.y};if(side==='right')return{x:node.x+node.width/2,y:node.y};if(side==='top')return{x:node.x,y:node.y-node.height/2};return{x:node.x,y:node.y+node.height/2};}
function routeEdge(source,target,{style='curved',direction='LR',bend=0.5}={}){
 const horizontal=direction==='LR'||direction==='RL',s=anchor(source,horizontal?(direction==='LR'?'right':'left'):(direction==='TB'?'bottom':'top')),t=anchor(target,horizontal?(direction==='LR'?'left':'right'):(direction==='TB'?'top':'bottom'));
 if(style==='straight')return {style,s,t,d:`M ${s.x} ${s.y} L ${t.x} ${t.y}`,labelPoint:{x:(s.x+t.x)/2,y:(s.y+t.y)/2}};
 if(style==='orthogonal'){if(horizontal){const mx=s.x+(t.x-s.x)*bend;return {style,s,t,d:`M ${s.x} ${s.y} L ${mx} ${s.y} L ${mx} ${t.y} L ${t.x} ${t.y}`,labelPoint:{x:mx,y:(s.y+t.y)/2}};}const my=s.y+(t.y-s.y)*bend;return {style,s,t,d:`M ${s.x} ${s.y} L ${s.x} ${my} L ${t.x} ${my} L ${t.x} ${t.y}`,labelPoint:{x:(s.x+t.x)/2,y:my}};}
 if(horizontal){const dx=(t.x-s.x)*bend;return {style,s,t,d:`M ${s.x} ${s.y} C ${s.x+dx} ${s.y}, ${t.x-dx} ${t.y}, ${t.x} ${t.y}`,labelPoint:{x:(s.x+t.x)/2,y:(s.y+t.y)/2-10}};}
 const dy=(t.y-s.y)*bend;return {style,s,t,d:`M ${s.x} ${s.y} C ${s.x} ${s.y+dy}, ${t.x} ${t.y-dy}, ${t.x} ${t.y}`,labelPoint:{x:(s.x+t.x)/2+10,y:(s.y+t.y)/2}};
}

function networkToIR(data,{fontSize=14,maxNodeWidth=220}={}){
 const nodes=(data.nodes||[]).map((n,i)=>{const box=textBox(n.name??n.label??n.id,{fontSize,maxWidth:maxNodeWidth,minWidth:96,padX:16,padY:10,maxLines:4});return {id:String(n.id),label:String(n.name??n.label??n.id),width:box.width,height:box.height,text:box,group:n.group??null,style:n.style||{},data:n,index:i};});
 const edges=(data.links||[]).map((e,i)=>({id:String(e.id||('e'+i)),source:String(e.source),target:String(e.target),label:String(e.relation??e.label??''),kind:e.kind||'relation',directed:e.directed!==false,routeStyle:'curved',style:e.style||{}}));
 return normalizeIR({nodes,edges,meta:{layout:'network',direction:'radial'}});
}
function degreeMap(ir){
 const d=new Map(ir.nodes.map(n=>[n.id,0]));
 for(const e of ir.edges){d.set(e.source,(d.get(e.source)||0)+1);d.set(e.target,(d.get(e.target)||0)+1);}
 return d;
}
function bfsLevels(ir,rootId){
 const adj=new Map(ir.nodes.map(n=>[n.id,[]]));
 for(const e of ir.edges){adj.get(e.source).push(e.target);adj.get(e.target).push(e.source);}
 const level=new Map([[rootId,0]]),q=[rootId];
 while(q.length){const id=q.shift(),next=level.get(id)+1;for(const n of adj.get(id)||[])if(!level.has(n)){level.set(n,next);q.push(n);}}
 let max=Math.max(0,...level.values());
 for(const n of ir.nodes)if(!level.has(n.id))level.set(n.id,++max);
 return level;
}
function layoutNetwork(data,{fontSize=14,maxNodeWidth=220,ringGap=190,nodeGap=28,padding=44,centerId=null}={}){
 const ir=networkToIR(data,{fontSize,maxNodeWidth}),deg=degreeMap(ir);
 if(!ir.nodes.length)return {...ir,bounds:{x:0,y:0,width:0,height:0,right:0,bottom:0}};
 const hub=centerId&&ir.nodes.some(n=>n.id===centerId)?centerId:[...ir.nodes].sort((a,b)=>(deg.get(b.id)||0)-(deg.get(a.id)||0)||a.index-b.index)[0].id;
 const levels=bfsLevels(ir,hub),groups=new Map();
 for(const n of ir.nodes){const lv=levels.get(n.id)||0;(groups.get(lv)||groups.set(lv,[]).get(lv)).push(n);}
 const center={x:0,y:0},hubNode=ir.nodes.find(n=>n.id===hub);hubNode.x=0;hubNode.y=0;hubNode.level=0;
 const golden=Math.PI*(3-Math.sqrt(5));
 for(const [lv,arr] of [...groups.entries()].sort((a,b)=>a[0]-b[0])){
   if(lv===0)continue;
   const radius=ringGap*lv;
   const count=arr.length;
   const phase=(lv%2?-.18:.18)*Math.PI;
   arr.sort((a,b)=>(deg.get(b.id)||0)-(deg.get(a.id)||0)||a.index-b.index);
   for(let i=0;i<count;i++){
     const angle=count<=5?phase-0.78*Math.PI+(1.56*Math.PI)*(i/(Math.max(1,count-1))):phase+i*golden;
     arr[i].x=center.x+Math.cos(angle)*radius;
     arr[i].y=center.y+Math.sin(angle)*radius*.78;
     arr[i].level=lv;
   }
 }
 let nodes=avoidCollisions(ir.nodes,{gap:nodeGap,iterations:120,axis:'both'});
 // keep hub stable after collision pass
 const movedHub=nodes.find(n=>n.id===hub);const dx=movedHub.x,dy=movedHub.y;
 nodes=nodes.map(n=>({...n,x:n.x-dx,y:n.y-dy}));
 let b=bounds(nodes,padding),shiftX=padding-b.x,shiftY=padding-b.y;
 nodes=nodes.map(n=>({...n,x:n.x+shiftX,y:n.y+shiftY}));
 b=bounds(nodes,padding);
 return {...ir,nodes,meta:{...ir.meta,padding,ringGap,nodeGap,hub},bounds:b};
}
function nodeContainsPoint(n,p,pad=8){return p.x>n.x-n.width/2-pad&&p.x<n.x+n.width/2+pad&&p.y>n.y-n.height/2-pad&&p.y<n.y+n.height/2+pad;}
function routeNetworkEdge(source,target,{curve=.18,index=0,total=1}={}){
 const dx=target.x-source.x,dy=target.y-source.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
 const sx=source.x+ux*source.width*.48,sy=source.y+uy*source.height*.42;
 const tx=target.x-ux*target.width*.48,ty=target.y-uy*target.height*.42;
 const nx=-uy,ny=ux,spread=(index-(total-1)/2)*12,offset=clamp(len*curve+spread,18,70);
 const cx=(sx+tx)/2+nx*offset,cy=(sy+ty)/2+ny*offset;
 return {d:`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`,s:{x:sx,y:sy},t:{x:tx,y:ty},control:{x:cx,y:cy},labelPoint:{x:(sx+2*cx+tx)/4,y:(sy+2*cy+ty)/4}};
}
function placeEdgeLabel(route,label,nodes,{fontSize=11,maxWidth=150}={}){
 const m=wrapText(label,{fontSize,maxWidth,maxLines:2}),base={x:route.labelPoint.x,y:route.labelPoint.y};
 const dx=route.t.x-route.s.x,dy=route.t.y-route.s.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len;
 const candidates=[0,16,-16,28,-28,40,-40].map(k=>({x:base.x+nx*k,y:base.y+ny*k}));
 let best=candidates[0],score=Infinity;
 for(const p of candidates){let s=0;for(const n of nodes)if(nodeContainsPoint(n,p,Math.max(m.width/2,m.height/2)+6))s+=1000;s+=Math.abs(p.x-base.x)+Math.abs(p.y-base.y);if(s<score){score=s;best=p;}}
 return {...best,measure:m};
}
function renderNetworkSVG(data,width,height,style,{centerId=null,directed=true,maxNodeWidth=220}={}){
 if(typeof document==='undefined')throw Error('renderNetworkSVG 需要瀏覽器 DOM。');
 const layout=layoutNetwork(data,{centerId,maxNodeWidth,fontSize:14,ringGap:190,nodeGap:30,padding:44}),NS='http://www.w3.org/2000/svg',make=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
 const svg=make('svg',{xmlns:NS,width,height,viewBox:`0 0 ${width} ${height}`}),defs=make('defs'),marker=make('marker',{id:'vcNetworkArrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(make('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:style.muted}));defs.append(marker);svg.append(defs);svg.append(make('rect',{width,height,fill:style.bg}));
 const f=fitBounds(layout.bounds,width,height,30),g=make('g',{transform:`translate(${f.tx} ${f.ty}) scale(${f.scale})`});svg.append(g);
 const byId=new Map(layout.nodes.map(n=>[n.id,n])),pairCount=new Map();
 for(const e of layout.edges){const key=[e.source,e.target].sort().join('|');pairCount.set(key,(pairCount.get(key)||0)+1);}
 const pairSeen=new Map(),palette=typeof VCStyle!=='undefined'?VCStyle.palette():['#1F4E79'];
 for(const e of layout.edges){
   const key=[e.source,e.target].sort().join('|'),idx=pairSeen.get(key)||0;pairSeen.set(key,idx+1);
   const route=routeNetworkEdge(byId.get(e.source),byId.get(e.target),{index:idx,total:pairCount.get(key)||1});
   const stroke=e.kind==='cause'?style.accent:style.muted;
   g.append(make('path',{d:route.d,fill:'none',stroke,'stroke-width':e.kind==='cause'?2.5:1.8,'stroke-opacity':.72,'marker-end':e.directed!==false&&directed?'url(#vcNetworkArrow)':''}));
   if(e.label){
     const p=placeEdgeLabel(route,e.label,layout.nodes,{fontSize:11,maxWidth:150}),m=p.measure;
     g.append(make('rect',{x:p.x-m.width/2-7,y:p.y-m.height/2-4,width:m.width+14,height:m.height+8,rx:7,fill:style.bg,'fill-opacity':.94}));
     const t=make('text',{x:p.x,y:p.y-m.height/2+m.lineHeight*.8,'text-anchor':'middle','font-family':style.fontFamily,'font-size':11,fill:style.muted});
     m.lines.forEach((line,i)=>t.append(make('tspan',{x:p.x,dy:i?m.lineHeight:0},line)));g.append(t);
   }
 }
 for(const n of layout.nodes){
   const isHub=n.id===layout.meta.hub,color=isHub?style.accent:palette[n.index%palette.length],fill=isHub?style.accent:style.surface,ink=isHub?(typeof VCStyle!=='undefined'?VCStyle.inkOn(fill):'#fff'):style.fg;
   g.append(make('rect',{x:n.x-n.width/2,y:n.y-n.height/2,width:n.width,height:n.height,rx:isHub?16:12,fill,stroke:color,'stroke-width':isHub?0:2}));
   const box=n.text||textBox(n.label,{fontSize:14,maxWidth:n.width});
   const t=make('text',{x:n.x,y:n.y-(box.lines.length-1)*box.lineHeight/2+5,'text-anchor':'middle','font-family':isHub?style.titleFamily:style.fontFamily,'font-size':isHub?16:14,'font-weight':isHub?700:550,fill:ink});
   box.lines.forEach((line,i)=>t.append(make('tspan',{x:n.x,dy:i?box.lineHeight:0},line)));g.append(t);
 }
 svg.dataset.engine='vc-diagram-network-v1';return svg;
}



function stakeholderToIR(data,{fontSize=14,maxItemWidth=250}={}){
 if(!data||typeof data.center!=='string'||!data.center.trim())throw Error('Stakeholder Map 需要 center。');
 if(!Array.isArray(data.groups)||data.groups.length<2||data.groups.length>10)throw Error('Stakeholder Map 需要 2–10 個角色群組。');
 const nodes=[],edges=[],centerBox=textBox(data.center,{fontSize:17,maxWidth:280,minWidth:170,padX:24,padY:17,maxLines:4});
 nodes.push({id:'center',label:data.center,shape:'core',level:0,width:centerBox.width,height:centerBox.height,text:centerBox,group:null,index:0});
 const ids=new Set(['center']);
 data.groups.forEach((g,gi)=>{
   const id=String(g.id||('group'+gi));if(ids.has(id))throw Error('Stakeholder group id 不可重複。');ids.add(id);
   if(typeof g.name!=='string'||!g.name.trim())throw Error('每個角色群組需要 name。');
   if(!Array.isArray(g.items)||!g.items.length||g.items.length>10)throw Error('每個角色需要 1–10 個功能。');
   const box=textBox(g.name,{fontSize:15,maxWidth:220,minWidth:120,padX:19,padY:12,maxLines:3});
   nodes.push({id,label:g.name,shape:'stakeholder',level:1,width:box.width,height:box.height,text:box,group:id,index:nodes.length,data:{groupIndex:gi}});
   edges.push({id:'sg'+gi,source:'center',target:id,label:String(g.relation||''),kind:'stakeholder',directed:false,style:{groupIndex:gi}});
   g.items.forEach((item,ii)=>{
     const obj=typeof item==='string'?{name:item}:item,name=String(obj.name||obj.label||'').trim();if(!name)throw Error('角色功能名稱不可空白。');
     const iid=id+'-item'+ii,ibox=textBox(name,{fontSize,maxWidth:maxItemWidth,minWidth:118,padX:16,padY:10,maxLines:4});
     nodes.push({id:iid,label:name,shape:'capability',level:2,width:ibox.width,height:ibox.height,text:ibox,group:id,index:nodes.length,data:{groupIndex:gi,itemIndex:ii}});
     edges.push({id:'si'+gi+'-'+ii,source:id,target:iid,label:String(obj.relation||''),kind:'capability',directed:false,style:{groupIndex:gi}});
   });
 });
 return normalizeIR({nodes,edges,meta:{layout:'stakeholder',direction:'radial'}});
}
function layoutStakeholder(data,{groupRadius=270,itemRadius=235,padding=54,maxItemWidth=250}={}){
 const ir=stakeholderToIR(data,{maxItemWidth}),center=ir.nodes.find(n=>n.id==='center'),groups=ir.nodes.filter(n=>n.level===1),items=ir.nodes.filter(n=>n.level===2);
 center.x=0;center.y=0;
 const n=groups.length,groupAngles=new Map();
 groups.forEach((g,i)=>{
   const angle=-Math.PI/2+i*(Math.PI*2/n);groupAngles.set(g.id,angle);
   g.x=Math.cos(angle)*groupRadius;g.y=Math.sin(angle)*groupRadius*.76;
 });
 for(const g of groups){
   const angle=groupAngles.get(g.id),children=items.filter(x=>x.group===g.id),count=children.length;
   const spread=Math.min(.82,Math.max(.28,.16*count));
   children.forEach((child,i)=>{
     const offset=count===1?0:(i-(count-1)/2)*(spread/Math.max(1,count-1));
     const a=angle+offset,radial=itemRadius+(count>5?25:0);
     child.x=g.x+Math.cos(a)*radial;
     child.y=g.y+Math.sin(a)*radial*.82;
   });
 }
 let nodes=avoidCollisions(ir.nodes,{gap:22,iterations:180,axis:'both'});
 const movedCenter=nodes.find(n=>n.id==='center'),dx=movedCenter.x,dy=movedCenter.y;
 nodes=nodes.map(n=>({...n,x:n.x-dx,y:n.y-dy}));
 let b=bounds(nodes,padding),sx=padding-b.x,sy=padding-b.y;
 nodes=nodes.map(n=>({...n,x:n.x+sx,y:n.y+sy}));b=bounds(nodes,padding);
 return {...ir,nodes,meta:{...ir.meta,groupRadius,itemRadius,padding,groupAngles:Object.fromEntries(groupAngles)},bounds:b};
}
function mixHex(a,b,t=.5){
 const pa=String(a).replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)),pb=String(b).replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16));if(!pa||!pb)return a;
 return '#'+pa.map((v,i)=>Math.round(v+(pb[i]-v)*t).toString(16).padStart(2,'0')).join('');
}
function routeStakeholderEdge(source,target,{curve=.12}={}){
 const dx=target.x-source.x,dy=target.y-source.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
 const sw=Math.min(source.width,source.height)*.48,tw=Math.min(target.width,target.height)*.48;
 const s={x:source.x+ux*sw,y:source.y+uy*sw},t={x:target.x-ux*tw,y:target.y-uy*tw},nx=-uy,ny=ux,bend=Math.min(44,len*curve),cx=(s.x+t.x)/2+nx*bend,cy=(s.y+t.y)/2+ny*bend;
 return {d:`M ${s.x} ${s.y} Q ${cx} ${cy} ${t.x} ${t.y}`,s,t,labelPoint:{x:(s.x+2*cx+t.x)/4,y:(s.y+2*cy+t.y)/4}};
}
function renderStakeholderSVG(data,width,height,style,{maxItemWidth=250}={}){
 if(typeof document==='undefined')throw Error('renderStakeholderSVG 需要瀏覽器 DOM。');
 const layout=layoutStakeholder(data,{maxItemWidth}),NS='http://www.w3.org/2000/svg',make=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
 const svg=make('svg',{xmlns:NS,width,height,viewBox:`0 0 ${width} ${height}`});svg.append(make('rect',{width,height,fill:style.bg}));
 const f=fitBounds(layout.bounds,width,height,34),g=make('g',{transform:`translate(${f.tx} ${f.ty}) scale(${f.scale})`});svg.append(g);
 const byId=new Map(layout.nodes.map(n=>[n.id,n])),groupCount=layout.nodes.filter(n=>n.level===1).length,palette=typeof VCStyle!=='undefined'&&VCStyle.groupPalette?VCStyle.groupPalette(groupCount):['#1F4E79','#176B69','#8B6F47','#806293','#B24A4A','#64748B','#315DA8','#7C8F41','#8F5F86','#287C99'],white=style.bg||'#fff';
 for(const e of layout.edges){
   const s=byId.get(e.source),t=byId.get(e.target),gi=e.style?.groupIndex||0,color=palette[gi%palette.length],route=routeStakeholderEdge(s,t,{curve:e.kind==='stakeholder'?.08:.13});
   g.append(make('path',{d:route.d,fill:'none',stroke:color,'stroke-width':e.kind==='stakeholder'?3:2,'stroke-opacity':e.kind==='stakeholder'?.78:.58,'stroke-linecap':'round'}));
   if(e.label){const p=placeEdgeLabel(route,e.label,layout.nodes,{fontSize:10,maxWidth:120}),m=p.measure;g.append(make('rect',{x:p.x-m.width/2-5,y:p.y-m.height/2-3,width:m.width+10,height:m.height+6,rx:6,fill:white,'fill-opacity':.96}));const tx=make('text',{x:p.x,y:p.y-m.height/2+m.lineHeight*.8,'text-anchor':'middle','font-family':style.fontFamily,'font-size':10,fill:style.muted});m.lines.forEach((line,i)=>tx.append(make('tspan',{x:p.x,dy:i?m.lineHeight:0},line)));g.append(tx);}
 }
 for(const n of layout.nodes){
   const core=n.level===0,group=n.level===1,gi=n.data?.groupIndex||0,base=palette[gi%palette.length];
   const fill=core?style.accent:group?base:(typeof VCStyle!=='undefined'&&VCStyle.tone?VCStyle.tone(base,'faint'):mixHex(base,style.bg,.86)),stroke=core?style.accent:base,ink=core||group?(typeof VCStyle!=='undefined'?VCStyle.inkOn(fill):'#fff'):style.fg;
   const rx=core?20:group?15:11;
   g.append(make('rect',{x:n.x-n.width/2,y:n.y-n.height/2,width:n.width,height:n.height,rx,fill,stroke,'stroke-width':core?0:group?0:1.6}));
   const box=n.text,t=make('text',{x:n.x,y:n.y-(box.lines.length-1)*box.lineHeight/2+5,'text-anchor':'middle','font-family':core||group?style.titleFamily:style.fontFamily,'font-size':core?17:group?15:13.5,'font-weight':core?750:group?700:520,fill:ink});
   box.lines.forEach((line,i)=>t.append(make('tspan',{x:n.x,dy:i?box.lineHeight:0},line)));g.append(t);
 }
 svg.dataset.engine='vc-diagram-stakeholder-v1';return svg;
}

function parseFlowchart(code){
 const text=String(code||'').replace(/\r/g,''),lines=text.split('\n').map(x=>x.trim()).filter(Boolean);
 if(!lines.length||!/^\s*(flowchart|graph)\b/i.test(lines[0]))throw Error('Flow Engine 需要 Mermaid flowchart / graph 語法。');
 const direction=(lines[0].match(/\b(TD|TB|BT|LR|RL)\b/i)?.[1]||'TD').toUpperCase(),nodes=new Map(),edges=[];
 function nodeSpec(token){
   const raw=String(token||'').trim();
   const m=raw.match(/^([A-Za-z0-9_.-]+)\s*(?:\(\[([\s\S]*?)\]\)|\[\[([\s\S]*?)\]\]|\[([\s\S]*?)\]|\{([\s\S]*?)\}|\(([\s\S]*?)\))?$/);
   if(!m)return null;
   const id=m[1],label=(m[2]??m[3]??m[4]??m[5]??m[6]??id).trim(),shape=m[5]!==undefined?'diamond':m[2]!==undefined?'terminator':m[3]!==undefined?'subprocess':m[6]!==undefined?'rounded':'rect';
   const existing=nodes.get(id);if(!existing||existing.label===id)nodes.set(id,{id,label,shape});return id;
 }
 const edgeRe=/^(.+?)\s*--+>|^(.+?)\s*-\.->/;
 for(let i=1;i<lines.length;i++){
   const line=lines[i];if(/^%%/.test(line))continue;
   let srcPart='',rest='',dashed=false;
   const arrow=line.match(/^(.*?)\s*(-\.->|--+>)\s*(.*)$/);
   if(!arrow)continue;
   srcPart=arrow[1].trim();dashed=arrow[2].includes('.');rest=arrow[3].trim();
   const source=nodeSpec(srcPart);if(!source)continue;
   let label='',targetPart=rest;
   const lm=rest.match(/^\|([^|]{0,80})\|\s*(.+)$/);if(lm){label=lm[1].trim();targetPart=lm[2].trim();}
   const target=nodeSpec(targetPart);if(!target)continue;
   edges.push({id:'f'+edges.length,source,target,label,directed:true,kind:'flow',routeStyle:'orthogonal',style:{dashed}});
 }
 if(!nodes.size)throw Error('流程圖沒有可解析的節點。');
 if(!edges.length)throw Error('流程圖沒有可解析的連線。');
 return {direction,nodes:[...nodes.values()],edges};
}
function flowToIR(input,{fontSize=15,maxNodeWidth=260}={}){
 const parsed=typeof input==='string'?parseFlowchart(input):input;
 const nodes=(parsed.nodes||[]).map((n,i)=>{const max=n.shape==='diamond'?210:maxNodeWidth,box=textBox(n.label,{fontSize,maxWidth:max,minWidth:n.shape==='diamond'?130:120,padX:20,padY:13,maxLines:4});const side=n.shape==='diamond'?Math.max(120,Math.min(210,Math.max(box.width,box.height*1.35))):null;return {id:String(n.id),label:String(n.label||n.id),shape:n.shape||'rect',width:side||box.width,height:side||box.height,text:box,index:i,style:n.style||{}};});
 const edges=(parsed.edges||[]).map((e,i)=>({id:String(e.id||('f'+i)),source:String(e.source),target:String(e.target),label:String(e.label||''),directed:e.directed!==false,kind:'flow',routeStyle:'orthogonal',style:e.style||{}}));
 return normalizeIR({nodes,edges,meta:{layout:'flow',direction:parsed.direction||'TD'}});
}
function flowRanks(ir){
 const indeg=new Map(ir.nodes.map(n=>[n.id,0])),out=new Map(ir.nodes.map(n=>[n.id,[]]));
 for(const e of ir.edges){indeg.set(e.target,(indeg.get(e.target)||0)+1);out.get(e.source).push(e.target);}
 let roots=ir.nodes.filter(n=>(indeg.get(n.id)||0)===0).map(n=>n.id);if(!roots.length)roots=[ir.nodes[0].id];
 const rank=new Map(),q=roots.map(id=>(rank.set(id,0),id));
 while(q.length){const id=q.shift(),r=rank.get(id);for(const to of out.get(id)||[])if(!rank.has(to)){rank.set(to,r+1);q.push(to);}}
 // attach unreachable/cyclic nodes by local propagation
 for(let pass=0;pass<ir.nodes.length;pass++)for(const e of ir.edges){if(rank.has(e.source)&&!rank.has(e.target))rank.set(e.target,rank.get(e.source)+1);}
 let max=Math.max(0,...rank.values());for(const n of ir.nodes)if(!rank.has(n.id))rank.set(n.id,++max);
 return rank;
}
function layoutFlow(input,{rankGap=120,siblingGap=44,padding=52,maxNodeWidth=260}={}){
 const ir=flowToIR(input,{maxNodeWidth}),rank=flowRanks(ir),direction=ir.meta.direction||'TD',vertical=direction==='TD'||direction==='TB'||direction==='BT';
 const groups=new Map();for(const n of ir.nodes){n.level=rank.get(n.id)||0;(groups.get(n.level)||groups.set(n.level,[]).get(n.level)).push(n);}
 const ranks=[...groups.keys()].sort((a,b)=>a-b),rankSizes=new Map();
 for(const r of ranks){const arr=groups.get(r),cross=arr.reduce((sum,n,i)=>sum+(vertical?n.width:n.height)+(i?siblingGap:0),0),main=Math.max(...arr.map(n=>vertical?n.height:n.width));rankSizes.set(r,{cross,main});}
 let cursor=padding;
 for(const r of ranks){
   const arr=groups.get(r),rs=rankSizes.get(r);let cross=-rs.cross/2;
   for(const n of arr){const crossSize=vertical?n.width:n.height;if(vertical){n.x=cross+crossSize/2;n.y=cursor+rs.main/2;}else{n.x=cursor+rs.main/2;n.y=cross+crossSize/2;}cross+=crossSize+siblingGap;}
   cursor+=rs.main+rankGap;
 }
 // center each rank and separate nodes
 let nodes=avoidCollisions(ir.nodes,{gap:18,iterations:80,axis:'both'});
 let b=bounds(nodes,padding),sx=padding-b.x,sy=padding-b.y;nodes=nodes.map(n=>({...n,x:n.x+sx,y:n.y+sy}));b=bounds(nodes,padding);
 if(direction==='BT')nodes=nodes.map(n=>({...n,y:b.height-n.y}));
 if(direction==='RL')nodes=nodes.map(n=>({...n,x:b.width-n.x}));
 const map=new Map(nodes.map(n=>[n.id,n])),edgeMeta=new Map();
 for(const e of ir.edges){const s=map.get(e.source),t=map.get(e.target),back=(t.level??0)<=(s.level??0);edgeMeta.set(e.id,{back});}
 return {...ir,nodes,meta:{...ir.meta,rankGap,siblingGap,padding},edgeMeta,bounds:bounds(nodes,padding)};
}
function flowPort(node,side){
 if(node.shape==='diamond'){const half=node.width/2;return side==='top'?{x:node.x,y:node.y-half}:side==='bottom'?{x:node.x,y:node.y+half}:side==='left'?{x:node.x-half,y:node.y}:{x:node.x+half,y:node.y};}
 return anchor(node,side);
}
function routeFlowEdge(source,target,{direction='TD',back=false,lane=0,canvasBounds=null}={}){
 const vertical=direction==='TD'||direction==='TB'||direction==='BT';
 if(!back){
   const s=flowPort(source,vertical?(direction==='BT'?'top':'bottom'):(direction==='RL'?'left':'right'));
   const t=flowPort(target,vertical?(direction==='BT'?'bottom':'top'):(direction==='RL'?'right':'left'));
   if(vertical){const my=(s.y+t.y)/2;return {d:`M ${s.x} ${s.y} L ${s.x} ${my} L ${t.x} ${my} L ${t.x} ${t.y}`,s,t,labelPoint:{x:(s.x+t.x)/2,y:my-10},back:false};}
   const mx=(s.x+t.x)/2;return {d:`M ${s.x} ${s.y} L ${mx} ${s.y} L ${mx} ${t.y} L ${t.x} ${t.y}`,s,t,labelPoint:{x:mx,y:(s.y+t.y)/2-10},back:false};
 }
 const b=canvasBounds||bounds([source,target],40);
 if(vertical){
   const side=(lane%2===0?'left':'right'),x=side==='left'?b.x-34-lane*16:b.right+34+lane*16,s=flowPort(source,side),t=flowPort(target,side);
   return {d:`M ${s.x} ${s.y} L ${x} ${s.y} L ${x} ${t.y} L ${t.x} ${t.y}`,s,t,labelPoint:{x:x+(side==='left'?-8:8),y:(s.y+t.y)/2},back:true,labelAnchor:side==='left'?'end':'start'};
 }
 const side=(lane%2===0?'top':'bottom'),y=side==='top'?b.y-34-lane*16:b.bottom+34+lane*16,s=flowPort(source,side),t=flowPort(target,side);
 return {d:`M ${s.x} ${s.y} L ${s.x} ${y} L ${t.x} ${y} L ${t.x} ${t.y}`,s,t,labelPoint:{x:(s.x+t.x)/2,y:y+(side==='top'?-8:8)},back:true,labelAnchor:'middle'};
}
function diamondPoints(n){const hw=n.width/2,hh=n.height/2;return `${n.x},${n.y-hh} ${n.x+hw},${n.y} ${n.x},${n.y+hh} ${n.x-hw},${n.y}`;}
function renderFlowSVG(input,width,height,style,{maxNodeWidth=260}={}){
 if(typeof document==='undefined')throw Error('renderFlowSVG 需要瀏覽器 DOM。');
 const layout=layoutFlow(input,{maxNodeWidth,rankGap:118,siblingGap:48,padding:56}),NS='http://www.w3.org/2000/svg',make=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
 const svg=make('svg',{xmlns:NS,width,height,viewBox:`0 0 ${width} ${height}`}),defs=make('defs'),marker=make('marker',{id:'vcFlowArrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(make('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:style.accent}));defs.append(marker);svg.append(defs);svg.append(make('rect',{width,height,fill:style.bg}));
 const f=fitBounds(layout.bounds,width,height,34),g=make('g',{transform:`translate(${f.tx} ${f.ty}) scale(${f.scale})`});svg.append(g);const byId=new Map(layout.nodes.map(n=>[n.id,n]));
 let backLane=0;
 for(const e of layout.edges){
   const meta=layout.edgeMeta.get(e.id)||{},route=routeFlowEdge(byId.get(e.source),byId.get(e.target),{direction:layout.meta.direction,back:meta.back,lane:meta.back?backLane++:0,canvasBounds:layout.bounds});
   g.append(make('path',{d:route.d,fill:'none',stroke:style.accent,'stroke-width':2.2,'stroke-linejoin':'round','stroke-linecap':'round','stroke-dasharray':e.style?.dashed?'6 5':'','marker-end':'url(#vcFlowArrow)'}));
   if(e.label){
     const m=wrapText(e.label,{fontSize:12,maxWidth:100,maxLines:2}),x=route.labelPoint.x,y=route.labelPoint.y;
     g.append(make('rect',{x:x-m.width/2-6,y:y-m.height/2-4,width:m.width+12,height:m.height+8,rx:6,fill:style.bg,'fill-opacity':.96}));
     const t=make('text',{x,y:y-m.height/2+m.lineHeight*.8,'text-anchor':route.labelAnchor||'middle','font-family':style.fontFamily,'font-size':12,'font-weight':650,fill:style.fg});m.lines.forEach((line,i)=>t.append(make('tspan',{x,dy:i?m.lineHeight:0},line)));g.append(t);
   }
 }
 const palette=typeof VCStyle!=='undefined'?VCStyle.palette():[style.accent];
 for(const n of layout.nodes){
   const stroke=style.accent,fill=style.surface;
   if(n.shape==='diamond')g.append(make('polygon',{points:diamondPoints(n),fill,stroke,'stroke-width':2}));
   else g.append(make('rect',{x:n.x-n.width/2,y:n.y-n.height/2,width:n.width,height:n.height,rx:n.shape==='terminator'?n.height/2:n.shape==='rounded'?14:5,fill,stroke,'stroke-width':2}));
   const box=n.text||textBox(n.label,{fontSize:15,maxWidth:n.width}),t=make('text',{x:n.x,y:n.y-(box.lines.length-1)*box.lineHeight/2+5,'text-anchor':'middle','font-family':style.fontFamily,'font-size':15,'font-weight':600,fill:style.fg});box.lines.forEach((line,i)=>t.append(make('tspan',{x:n.x,dy:i?box.lineHeight:0},line)));g.append(t);
 }
 svg.dataset.engine='vc-diagram-flow-v1';return svg;
}

function fitBounds(b,width,height,padding=24){const usableW=Math.max(1,width-padding*2),usableH=Math.max(1,height-padding*2),scale=Math.min(1,usableW/Math.max(1,b.width),usableH/Math.max(1,b.height));return {scale,tx:padding+(usableW-b.width*scale)/2-b.x*scale,ty:padding+(usableH-b.height*scale)/2-b.y*scale};}
function renderTreeSVG(root,width,height,style,{direction='LR',accent,edgeColor,maxNodeWidth=290}={}){
 if(typeof document==='undefined')throw Error('renderTreeSVG 需要瀏覽器 DOM。');
 const layout=layoutTree(root,{direction,fontSize:15,maxNodeWidth,levelGap:110,siblingGap:28,padding:36}),NS='http://www.w3.org/2000/svg',make=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
 const svg=make('svg',{xmlns:NS,width,height,viewBox:`0 0 ${width} ${height}`}),defs=make('defs'),marker=make('marker',{id:'vcDiagramArrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});marker.append(make('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:edgeColor||style.muted}));defs.append(marker);svg.append(defs);svg.append(make('rect',{width,height,fill:style.bg}));
 const f=fitBounds(layout.bounds,width,height,28),g=make('g',{transform:`translate(${f.tx} ${f.ty}) scale(${f.scale})`});svg.append(g);const byId=new Map(layout.nodes.map(n=>[n.id,n]));
 for(const e of layout.edges){const r=routeEdge(byId.get(e.source),byId.get(e.target),{style:e.routeStyle,direction});g.append(make('path',{d:r.d,fill:'none',stroke:edgeColor||style.grid,'stroke-width':2.2,'marker-end':'url(#vcDiagramArrow)'}));if(e.label){const m=wrapText(e.label,{fontSize:11,maxWidth:140,maxLines:2}),bg=make('rect',{x:r.labelPoint.x-m.width/2-6,y:r.labelPoint.y-m.height/2-4,width:m.width+12,height:m.height+8,rx:6,fill:style.bg});g.append(bg);const t=make('text',{x:r.labelPoint.x,y:r.labelPoint.y-m.height/2+m.lineHeight*.8,'text-anchor':'middle','font-family':style.fontFamily,'font-size':11,fill:style.muted});m.lines.forEach((line,i)=>t.append(make('tspan',{x:r.labelPoint.x,dy:i?m.lineHeight:0},line)));g.append(t);}}
 const palette=typeof VCStyle!=='undefined'?VCStyle.palette():[accent||'#1F4E79'];
 for(const n of layout.nodes){const strong=n.level===0,color=strong?(accent||style.accent):style.grid,fill=strong?(accent||style.accent):style.surface,ink=strong?(typeof VCStyle!=='undefined'?VCStyle.inkOn(fill):'#fff'):style.fg;g.append(make('rect',{x:n.x-n.width/2,y:n.y-n.height/2,width:n.width,height:n.height,rx:strong?14:11,fill,stroke:color,'stroke-width':strong?0:1.4}));const box=n.text||textBox(n.label,{fontSize:15,maxWidth:n.width});const t=make('text',{x:n.x,y:n.y-(box.lines.length-1)*box.lineHeight/2+5,'text-anchor':'middle','font-family':strong?style.titleFamily:style.fontFamily,'font-size':strong?16:14,'font-weight':strong?700:500,fill:ink});box.lines.forEach((line,i)=>t.append(make('tspan',{x:n.x,dy:i?box.lineHeight:0},line)));g.append(t);}
 svg.dataset.engine='vc-diagram-v1';return svg;
}
const API={charWidth,lineWidth,wrapText,textBox,normalizeIR,bounds,rectOverlap,avoidCollisions,treeToIR,layoutTree,routeEdge,networkToIR,degreeMap,bfsLevels,layoutNetwork,nodeContainsPoint,routeNetworkEdge,placeEdgeLabel,stakeholderToIR,layoutStakeholder,mixHex,routeStakeholderEdge,parseFlowchart,flowToIR,flowRanks,layoutFlow,flowPort,routeFlowEdge,diamondPoints,fitBounds,renderTreeSVG,renderNetworkSVG,renderStakeholderSVG,renderFlowSVG};
if(typeof window!=='undefined')window.VCDiagramEngine=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})();