(()=>{'use strict';
const E=window.VCDiagramEngine;if(!E)return;
const VERSION='1.3',NS='http://www.w3.org/2000/svg';
const make=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
function stats(root){let count=0,maxDepth=0,maxLabel=0,maxChildren=0;const walk=(n,d)=>{count++;maxDepth=Math.max(maxDepth,d);maxLabel=Math.max(maxLabel,String(n?.name??n?.label??'').length);maxChildren=Math.max(maxChildren,(n?.children||[]).length);for(const c of n?.children||[])walk(c,d+1);};walk(root,0);return{count,maxDepth,maxLabel,maxChildren};}
function plan(root,opts={}){const s=stats(root),density=Math.min(42,Math.max(0,s.count-8)*2.5);return{...s,levelGap:Math.max(130,118+Math.min(84,s.maxLabel*2.6)+Math.min(36,s.maxDepth*7)+density*.35),siblingGap:Math.max(34,(s.maxChildren>=5?52:s.maxChildren>=3?42:36)+density*.28),maxNodeWidth:Math.max(opts.maxNodeWidth||300,s.maxLabel>30?390:s.maxLabel>22?370:s.maxLabel>14?340:310)};}
function routeTreeEdge(source,target,{index=0,total=1,direction='LR'}={}){
 if(direction!=='LR')return E.routeEdge(source,target,{style:'curved',direction});
 const range=Math.min(source.height*.34,32),offset=total<=1?0:(index-(total-1)/2)*(range/Math.max(1,total-1));
 const sx=source.x+source.width/2,sy=source.y+offset,tx=target.x-target.width/2,ty=target.y,dx=Math.max(36,(tx-sx)*.42);
 return {d:`M ${sx} ${sy} C ${sx+dx} ${sy}, ${tx-dx} ${ty}, ${tx} ${ty}`,labelPoint:{x:(sx+tx)/2,y:(sy+ty)/2-8},sourcePoint:{x:sx,y:sy},targetPoint:{x:tx,y:ty}};
}
function render(root,width,height,style,{direction='LR',accent,edgeColor,maxNodeWidth=290}={}){
 const p=plan(root,{maxNodeWidth}),L=E.layoutTree(root,{direction,fontSize:15,maxNodeWidth:p.maxNodeWidth,levelGap:p.levelGap,siblingGap:p.siblingGap,padding:40});
 const svg=make('svg',{xmlns:NS,width,height,viewBox:`0 0 ${width} ${height}`}),defs=make('defs'),marker=make('marker',{id:'vcTreeArrowP1',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto-start-reverse'});
 marker.append(make('path',{d:'M 0 0 L 10 5 L 0 10 z',fill:edgeColor||style.muted}));defs.append(marker);svg.append(defs);svg.append(make('rect',{width,height,fill:style.bg}));
 const fit=E.fitBounds(L.bounds,width,height,34),g=make('g',{transform:`translate(${fit.tx} ${fit.ty}) scale(${fit.scale})`});svg.append(g);const byId=new Map(L.nodes.map(n=>[n.id,n])),siblings=new Map();
 for(const e of L.edges){const a=siblings.get(e.source)||[];a.push(e);siblings.set(e.source,a);}
 for(const e of L.edges){const group=siblings.get(e.source)||[e],idx=group.indexOf(e),r=routeTreeEdge(byId.get(e.source),byId.get(e.target),{index:idx,total:group.length,direction});g.append(make('path',{d:r.d,fill:'none',stroke:edgeColor||style.grid,'stroke-width':2.1,'stroke-linecap':'round','marker-end':'url(#vcTreeArrowP1)','data-tree-edge':'1','data-edge-source':e.source,'data-edge-target':e.target,'data-source-y':r.sourcePoint?.y??''}));if(e.label){const m=E.wrapText(e.label,{fontSize:11,maxWidth:140,maxLines:2});g.append(make('rect',{x:r.labelPoint.x-m.width/2-6,y:r.labelPoint.y-m.height/2-4,width:m.width+12,height:m.height+8,rx:6,fill:style.bg,'fill-opacity':.97}));const t=make('text',{x:r.labelPoint.x,y:r.labelPoint.y-m.height/2+m.lineHeight*.8,'text-anchor':'middle','font-family':style.fontFamily,'font-size':11,fill:style.muted});m.lines.forEach((line,i)=>t.append(make('tspan',{x:r.labelPoint.x,dy:i?m.lineHeight:0},line)));g.append(t);}}
 for(const n of L.nodes){const strong=n.level===0,fill=strong?(accent||style.accent):style.surface,ink=strong?(window.VCStyle?.inkOn?.(fill)||'#fff'):style.fg;g.append(make('rect',{x:n.x-n.width/2,y:n.y-n.height/2,width:n.width,height:n.height,rx:strong?14:11,fill,stroke:strong?(accent||style.accent):style.grid,'stroke-width':strong?0:1.4,'data-node':'1','data-node-id':n.id,'data-node-level':n.level}));const b=n.text,t=make('text',{x:n.x,y:n.y-(b.lines.length-1)*b.lineHeight/2+5,'text-anchor':'middle','font-family':strong?style.titleFamily:style.fontFamily,'font-size':strong?16:14,'font-weight':strong?700:500,fill:ink});b.lines.forEach((line,i)=>t.append(make('tspan',{x:n.x,dy:i?b.lineHeight:0},line)));g.append(t);}
 svg.dataset.engine='vc-diagram-v1';svg.dataset.layoutVersion='p3';svg.dataset.treeLevelGap=String(p.levelGap);svg.dataset.treeSiblingGap=String(p.siblingGap);return svg;
}
E.renderTreeSVG=render;window.VCResearchTreeP1={VERSION,stats,plan,routeTreeEdge};
})();