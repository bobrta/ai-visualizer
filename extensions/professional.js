/* Presentation-grade chart styling. No data transformations. */
(()=>{'use strict';const base=chartConfig;
chartConfig=function(d){
 const r=base(d),s=VCStyle.state(),palette=VCStyle.palette(),types=r.traces.map(t=>t.type),
 cartesian=types.some(t=>['scatter','bar','histogram','box','violin','heatmap','contour','waterfall','funnel','candlestick'].includes(t)),
 polar=types.includes('scatterpolar');
 const compact=types.some(t=>['pie','treemap','sunburst','sankey','table','parcoords'].includes(t));
 r.layout={
   ...r.layout,
   paper_bgcolor:s.bg,plot_bgcolor:s.bg,colorway:palette,
   font:{family:s.fontFamily,size:12,color:s.fg},
   title:{...r.layout.title,x:.045,xanchor:'left',y:.965,yanchor:'top',font:{family:s.titleFamily,size:28,color:s.fg}},
   legend:{...r.layout.legend,bgcolor:'rgba(0,0,0,0)',orientation:'h',x:0,xanchor:'left',y:-.14,yanchor:'top',font:{family:s.fontFamily,size:11,color:s.muted}},
   margin:{t:compact?92:100,l:cartesian?86:56,r:54,b:compact?64:96,...r.layout.margin}
 };
 if(cartesian||r.layout.xaxis||r.layout.yaxis){
   for(const key of ['xaxis','yaxis']){
     r.layout[key]={
       ...r.layout[key],showline:false,zeroline:false,gridcolor:s.grid,gridwidth:1,automargin:true,
       tickfont:{...(r.layout[key]?.tickfont||{}),family:s.fontFamily,size:11,color:s.muted},
       title:{...(r.layout[key]?.title||{}),font:{...(r.layout[key]?.title?.font||{}),family:s.fontFamily,size:12,color:s.fg},standoff:12}
     };
   }
 }
 if(r.layout.scene){
   for(const k of ['xaxis','yaxis','zaxis'])r.layout.scene[k]={
     ...(r.layout.scene[k]||{}),showbackground:false,gridcolor:s.grid,zerolinecolor:s.grid,
     tickfont:{...(r.layout.scene[k]?.tickfont||{}),family:s.fontFamily,color:s.muted},
     title:{...(r.layout.scene[k]?.title||{}),font:{...(r.layout.scene[k]?.title?.font||{}),family:s.fontFamily,color:s.fg}}
   };
 }
 if(polar||r.layout.polar)r.layout.polar={
   ...r.layout.polar,bgcolor:s.bg,
   radialaxis:{...(r.layout.polar?.radialaxis||{}),gridcolor:s.grid,linecolor:s.grid,tickfont:{...(r.layout.polar?.radialaxis?.tickfont||{}),family:s.fontFamily,color:s.muted}},
   angularaxis:{...(r.layout.polar?.angularaxis||{}),gridcolor:s.grid,linecolor:s.grid,tickfont:{...(r.layout.polar?.angularaxis?.tickfont||{}),family:s.fontFamily,color:s.muted}}
 };
 // Standard analytical charts intentionally stay on the 6-color theme palette; the 40-color library is for controlled overrides and grouped diagrams.
 r.traces.forEach((t,i)=>{
   const color=palette[i%palette.length];
   if(t.type==='mesh3d')t.color=color;
   if(t.type==='scatter'&&t.mode?.includes('lines'))t.line={...t.line,color,width:3,dash:['solid','dash','dot','dashdot'][i%4]};
   if(t.type==='scatter'&&t.mode?.includes('markers'))t.marker={...t.marker,color,size:typeof t.marker?.size==='number'?Math.max(7,t.marker.size):t.marker?.size,line:{color:s.bg,width:1.2}};
   if(['bar','scatterpolar','scatter3d','funnel'].includes(t.type))t.marker={...t.marker,color,line:{...(t.marker?.line||{}),color:s.bg,width:t.type==='bar'?0:1}};
   if(t.type==='bar')t.marker={...t.marker,color,line:{width:0}};
   if(t.type==='parcoords'){t.line={...t.line,color};t.labelfont={...(t.labelfont||{}),family:s.titleFamily,color:s.fg,size:Math.min(t.labelfont?.size||13,14)};t.tickfont={...(t.tickfont||{}),family:s.fontFamily,color:s.muted,size:Math.min(t.tickfont?.size||10,11)};t.rangefont={...(t.rangefont||{}),family:s.fontFamily,color:s.muted,size:Math.min(t.rangefont?.size||10,11)};}
   if(t.type==='sankey'){t.node={...t.node,color:palette,pad:24,thickness:18,line:{color:s.bg,width:1}};t.link={...t.link,color:'rgba(99,115,129,.22)'};}
   if(t.type==='pie'){t.marker={...t.marker,colors:palette,line:{color:s.bg,width:3}};t.textfont={...(t.textfont||{}),family:s.fontFamily,color:s.fg};}
   if(['heatmap','contour','surface'].includes(t.type))t.colorscale=[[0,s.background==='black'?'#16202B':'#EFF3F6'],[1,palette[0]]];
   if(t.type==='table'){t.header={...t.header,fill:{color:palette[0]},font:{...t.header?.font,family:s.titleFamily,size:13,color:VCStyle.inkOn(palette[0])},line:{color:s.bg,width:1}};t.cells={...t.cells,fill:{color:s.surface},font:{...t.cells?.font,family:s.fontFamily,size:12,color:s.fg},line:{color:s.grid,width:1}};}
   if(t.type==='waterfall'){t.increasing={marker:{color:s.positive}};t.decreasing={marker:{color:s.negative}};t.totals={marker:{color:s.accent}};}
 });
 return r;
};})();