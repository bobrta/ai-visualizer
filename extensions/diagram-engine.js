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
 const seen=new Set(),nodes=ir.nodes.map((n,i)=>{const id=String(n.id??'').trim();if(!id||seen.has(id))throw Error('Diagram node id 必須唯一且非空。');seen.add(id);return {id,label:String(n.label??n.name??id),shape:n.shape||'rounded',group:n.group??null,level:Number.isFinite(n.level)?n.level:0,x:Number.isFinite(n.x)?n.x:0,y:Number.isFinite(n.y)?n.y:0,width:Number.isFinite(n.width)?n.width:0,height:Number.isFinite(n.height)?n.height:0,style:n.style||{},data:n.data||null,index:i};});
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
 function walk(node,depth,parent=null){const id='n'+seq++;const box=textBox(node.name??node.label??'',{fontSize,maxWidth:maxNodeWidth,minWidth:118,padX:18,padY:11,maxLines:4});nodes.push({id,label:String(node.name??node.label??''),level:depth,width:box.width,height:box.height,text:box,shape:depth===0?'rounded-strong':'rounded',data:node});if(parent)edges.push({id:'e'+edges.length,source:parent,target:id,label:String(node.relation??''),routeStyle:'curved',directed:true});for(const child of node.children||[])walk(child,depth+1,id);return id;}
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
const API={charWidth,lineWidth,wrapText,textBox,normalizeIR,bounds,rectOverlap,avoidCollisions,treeToIR,layoutTree,routeEdge,fitBounds,renderTreeSVG};
if(typeof window!=='undefined')window.VCDiagramEngine=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})();