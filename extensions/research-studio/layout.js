/* Research Figure Layout Engine v1
   Separates output page size from actual figure-content height. */
(()=>{'use strict';
const VERSION='1.0';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function mermaidStats(code=''){
 const lines=String(code).split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
 const sections=lines.filter(x=>/^section\s+/i.test(x)).length;
 const directives=lines.filter(x=>!/^(gantt|dateFormat|axisFormat|tickInterval|excludes|todayMarker|title|section)\b/i.test(x)&&/:/.test(x));
 return {sections,tasks:directives.length};
}
function nodeCount(d){
 if(Array.isArray(d?.data?.nodes))return d.data.nodes.length;
 let n=0;const walk=x=>{if(!x)return;n++;(x.children||[]).forEach(walk);};if(d?.data?.root)walk(d.data.root);return n;
}
function plan(d,basePreview,outputWidth){
 const width=basePreview.width,maxH=basePreview.height,type=d.type;
 let height=maxH,reason='default';
 if(type==='gantt'){
   const s=mermaidStats(d.data?.code||'');
   height=clamp(230+s.tasks*42+s.sections*22,330,620);reason='gantt-content';
 }else if(['why','argument'].includes(type)){
   const n=nodeCount(d);height=clamp(300+n*24,390,560);reason='tree-content';
 }else if(['concept','causal','exchange','network'].includes(type)){
   const n=nodeCount(d);height=clamp(390+n*12,480,650);reason='network-content';
 }else if(['flowchart','state','class','er'].includes(type)){
   height=clamp(Math.round(width*.52),420,610);reason='diagram-content';
 }else if(type==='concept_lesson'){
   height=Math.min(maxH,720);reason='lesson-fixed';
 }
 height=Math.min(height,maxH);
 const scale=width/outputWidth;
 const outputHeight=Math.max(320,Math.round(height/Math.max(scale,.001)));
 return {version:VERSION,width,height,outputHeight,reason};
}
function ganttConfig(d){
 const s=mermaidStats(d?.data?.code||''),tasks=Math.max(1,s.tasks);
 return {
   useMaxWidth:true,
   barHeight:tasks<=5?34:tasks<=9?28:24,
   barGap:tasks<=5?12:tasks<=9?9:7,
   topPadding:42,
   leftPadding:110,
   gridLineStartPadding:28,
   fontSize:tasks<=5?14:tasks<=9?13:12,
   sectionFontSize:tasks<=5?14:13,
   numberSectionStyles:4
 };
}
window.VCResearchLayout={VERSION,plan,ganttConfig,mermaidStats,nodeCount};
})();