(()=>{'use strict';
const E=window.VCDiagramEngine;if(!E)return;
const VERSION='1.0';
function stats(root){let count=0,maxDepth=0,maxLabel=0,maxChildren=0;const walk=(n,d)=>{count++;maxDepth=Math.max(maxDepth,d);maxLabel=Math.max(maxLabel,String(n?.name??n?.label??'').length);maxChildren=Math.max(maxChildren,(n?.children||[]).length);for(const c of n?.children||[])walk(c,d+1);};walk(root,0);return{count,maxDepth,maxLabel,maxChildren};}
const base=E.renderTreeSVG;
function render(root,width,height,style,opts={}){
 const s=stats(root),levelGap=Math.max(120,110+Math.min(70,s.maxLabel*2.4)+Math.min(30,s.maxDepth*6)),siblingGap=Math.max(30,s.maxChildren>=5?46:s.maxChildren>=3?38:32),maxNodeWidth=Math.max(opts.maxNodeWidth||290,s.maxLabel>24?360:s.maxLabel>16?330:300);
 const originalLayout=E.layoutTree;
 E.layoutTree=function(r,o={}){return originalLayout(r,{...o,levelGap,siblingGap,maxNodeWidth});};
 try{const svg=base(root,width,height,style,{...opts,maxNodeWidth});svg.dataset.layoutVersion='p1';svg.dataset.treeLevelGap=String(levelGap);svg.dataset.treeSiblingGap=String(siblingGap);return svg;}
 finally{E.layoutTree=originalLayout;}
}
E.renderTreeSVG=render;window.VCResearchTreeP1={VERSION,stats};
})();