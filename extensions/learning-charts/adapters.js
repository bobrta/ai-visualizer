/* Twenty learning layouts on the existing Plotly engine. No eval or AI calls. */
(()=>{
'use strict';
const templates=window.VC_LEARNING_TEMPLATES;
const baseExample=chartExample,baseConfig=chartConfig;
chartExample=function(type){const t=templates.find(t=>t.id===type);return t?structuredClone(t.data):baseExample(type);};
const fail=m=>{throw Error(m);};
const text=(v,name,max=200)=>{if(typeof v!=='string'||!v.trim()||v.length>max)fail(name+' 需為 1–'+max+' 字的文字。');};
const list=(a,name,max=24)=>{if(!Array.isArray(a)||!a.length||a.length>max)fail(name+' 需為 1–'+max+' 個項目的陣列。');return a;};
const strings=(a,name,max=24)=>list(a,name,max).forEach(v=>text(v,name));
function check(d){
 text(d.title,'title');const t=d.type;
 // Keep diagram text and geometry bounded; malformed JSON fails before plotting.
 let total=0;function walk(v,depth=0){if(depth>18||++total>4000)fail('結構過大，請拆成多張圖。');if(typeof v==='string'&&v.length>500)fail('單一文字欄位最多 500 字。');if(typeof v==='number'&&!Number.isFinite(v))fail('數字必須有限。');if(Array.isArray(v)){if(v.length>100)fail('單一陣列最多 100 個項目。');v.forEach(x=>walk(x,depth+1));}else if(v&&typeof v==='object')Object.values(v).forEach(x=>walk(x,depth+1));}walk(d);
 function tree(root,binary=false){let count=0;function visit(n,depth){if(!n||typeof n!=='object'||Array.isArray(n))fail('root／子節點需為物件。');if(++count>80||depth>8)fail('樹圖最多 80 節點、8 層。');text(n.title,'節點 title');if(binary){if(n.yes)visit(n.yes,depth+1);if(n.no)visit(n.no,depth+1);}else if(n.children!==undefined){if(!Array.isArray(n.children))fail('children 需為陣列。');n.children.forEach(c=>visit(c,depth+1));}}visit(root,0);}
 if(['hierarchy_map','argument_map'].includes(t))tree(d.root);
 else if(t==='decision_tree')tree(d.root,true);
 else if(t==='concept_map'){list(d.nodes,'nodes',40).forEach(n=>{text(n.id,'id');text(n.title,'節點 title');});if(new Set(d.nodes.map(n=>n.id)).size!==d.nodes.length)fail('nodes 的 id 不可重複。');if(!Array.isArray(d.relations)||d.relations.length>80)fail('relations 需為最多 80 條的陣列。');const ids=new Set(d.nodes.map(n=>n.id));d.relations.forEach(r=>{if(!ids.has(r.from)||!ids.has(r.to))fail('關係端點需指向既有 id。');text(r.label,'關係 label');});}
 else if(['cause_chain','process_flow','cycle_map'].includes(t))list(d.steps,'steps',20).forEach(s=>text(s.title,'步驟 title'));
 else if(t==='comparison_matrix'){strings(d.columns,'columns',8);list(d.rows,'rows',30).forEach(r=>{text(r.label,'row label');if(!Array.isArray(r.values)||r.values.length!==d.columns.length||r.values.some(v=>!['string','number'].includes(typeof v)))fail('每列 values 的欄數需與 columns 一致，只接受文字或數字。');});}
 else if(t==='formula_map')list(d.formulas,'formulas',12).forEach(f=>{text(f.name,'name');text(f.formula,'formula');});
 else if(t==='exam_overview')list(d.sections,'sections',16).forEach(s=>{text(s.title,'section title');strings(s.items,'items',12);});
 else if(t==='fishbone'){text(d.effect,'effect');list(d.categories,'categories',8).forEach(c=>{text(c.title,'category title');strings(c.causes,'causes',6);});}
 else if(t==='venn'){if(list(d.sets,'sets',2).length!==2)fail('重疊圖需要兩個 sets。');d.sets.forEach(s=>{text(s.title,'set title');strings(s.items,'items',6);});strings(d.intersection,'intersection',6);}
 else if(t==='quadrant'){text(d.x_label,'x_label');text(d.y_label,'y_label');if(list(d.quadrants,'quadrants',4).length!==4)fail('quadrants 需為四個名稱。');strings(d.quadrants,'quadrants',4);list(d.points,'points',30).forEach(p=>{text(p.title,'point title');if([p.x,p.y].some(v=>typeof v!=='number'||!Number.isFinite(v)||v<0||v>100))fail('象限 x/y 需在 0–100 之間。');});}
 else if(t==='timeline')list(d.events,'events',20).forEach(e=>{text(e.date,'date');text(e.title,'event title');});
 else if(t==='pyramid')list(d.levels,'levels',8).forEach(l=>{text(l.title,'level title');strings(l.items,'items',8);});
 else if(t==='cornell_notes'){strings(d.cues,'cues',12);strings(d.notes,'notes',12);text(d.summary,'summary',500);}
 else if(t==='kwl'){if(list(d.columns,'columns',3).length!==3)fail('KWL 需有三欄。');d.columns.forEach(c=>{text(c.title,'column title');strings(c.items,'items',12);});}
 else if(t==='retrieval_cards')list(d.cards,'cards',24).forEach(c=>{text(c.question,'question');text(c.answer,'answer',500);});
 else if(t==='spaced_repetition')list(d.topics,'topics',20).forEach(s=>{text(s.title,'topic title');list(s.days,'days',20);if(s.days.some(x=>!Number.isInteger(x)||x<0||x>365)||new Set(s.days).size!==s.days.length)fail('days 需為 0–365 的不重複整數。');});
 else if(t==='study_gantt')list(d.tasks,'tasks',30).forEach(s=>{text(s.title,'task title');if(!Number.isFinite(s.start)||s.start<0||!Number.isFinite(s.duration)||s.duration<=0||s.start+s.duration>365)fail('start 需非負、duration 需正數，終點不可超過 365。');});
}
chartConfig=function(d){
 if(!templates.some(t=>t.id===d?.type))return baseConfig(d);
 check(d);const st=VCStyle.state(),colors=VCStyle.palette(),annotations=[],shapes=[],traces=[];let xmin=Infinity,xmax=-Infinity,ymin=Infinity,ymax=-Infinity;
 const C=i=>colors[((i%colors.length)+colors.length)%colors.length];
 const escape=s=>safeText(String(s??''));
 const lines=(s,width=16)=>String(s??'').split('\n').map(part=>{const a=Array.from(part),ls=[];while(a.length)ls.push(escape(a.splice(0,width).join('')));return ls.join('<br>');}).join('<br>');
 function bound(x,y,w=0,h=0){xmin=Math.min(xmin,x-w/2);xmax=Math.max(xmax,x+w/2);ymin=Math.min(ymin,y-h/2);ymax=Math.max(ymax,y+h/2);}
 function label(x,y,s,color=st.fg,size=14,w=220){annotations.push({x,y,xref:'x',yref:'y',text:lines(s,Math.max(4,Math.floor(w/14))),showarrow:false,font:{color,size},align:'center'});const h=String(s).split('\n').reduce((n,l)=>n+Math.max(1,Math.ceil(Array.from(l).length/Math.max(4,Math.floor(w/14)))),0)*23;bound(x,y,w,h);}
 function box(x,y,heading,body='',i=0,w=210){const full=heading+(body?'\n'+body:''),rows=full.split('\n').reduce((n,s)=>n+Math.max(1,Math.ceil(Array.from(s).length/Math.floor(w/14))),0),h=Math.max(64,rows*23+25);shapes.push({type:'rect',x0:x-w/2,x1:x+w/2,y0:y-h/2,y1:y+h/2,line:{color:C(i),width:2},fillcolor:st.surface,layer:'below'});annotations.push({x,y,xref:'x',yref:'y',text:'<b>'+lines(heading,Math.floor(w/14))+'</b>'+(body?'<br>'+lines(body,Math.floor(w/14)):''),showarrow:false,font:{color:st.fg,size:14},align:'center',hovertext:escape(body||heading),captureevents:true});bound(x,y,w,h);return {x,y,w,h};}
 function arrow(a,b,s='',i=0){const dx=b.x-a.x,dy=b.y-a.y,horizontal=Math.abs(dx)>Math.abs(dy),start={x:a.x+(horizontal?Math.sign(dx)*(a.w||0)/2:0),y:a.y+(!horizontal?Math.sign(dy)*(a.h||0)/2:0)},end={x:b.x-(horizontal?Math.sign(dx)*(b.w||0)/2:0),y:b.y-(!horizontal?Math.sign(dy)*(b.h||0)/2:0)};annotations.push({x:end.x,y:end.y,ax:start.x,ay:start.y,xref:'x',yref:'y',axref:'x',ayref:'y',text:'',showarrow:true,arrowhead:2,arrowsize:1,arrowwidth:2,arrowcolor:C(i)});if(s)label((start.x+end.x)/2,(start.y+end.y)/2-22,s,C(i),12,180);bound(start.x,start.y);bound(end.x,end.y);}
 function rule(x0,y0,x1,y1,color=st.grid,width=2){shapes.push({type:'line',x0,y0,x1,y1,line:{color,width},layer:'below'});bound(x0,y0);bound(x1,y1);}
 function panels(items,cols=2){let y=0;for(let j=0;j<items.length;j+=cols){const row=items.slice(j,j+cols),boxes=row.map((s,i)=>box(i*390,y,s.title,(s.items||[]).map(v=>'• '+v).join('\n'),j+i,340)),height=Math.max(...boxes.map(b=>b.h));y+=height+65;}}
 const t=d.type;
 if(t==='concept_map'){
  const m=new Map(),count=d.nodes.length,cols=Math.min(3,count);d.nodes.forEach((n,i)=>m.set(n.id,box((i%cols)*370,Math.floor(i/cols)*240,n.title,n.description||'',i,240)));d.relations.forEach((r,i)=>arrow(m.get(r.from),m.get(r.to),r.label,i));
 }else if(['hierarchy_map','argument_map','decision_tree'].includes(t)){
  let leaf=0;const positions=[],edges=[];function place(n,depth,parent,relation){const children=t==='decision_tree'?[...(n.yes?[{...n.yes,_rel:'是'}]:[]),...(n.no?[{...n.no,_rel:'否'}]:[])]:n.children||[],p={n,y:depth*180};positions.push(p);if(parent)edges.push([parent,p,relation]);const xs=children.map(c=>place(c,depth+1,p,c._rel||c.relation||''));p.x=xs.length?xs.reduce((s,v)=>s+v,0)/xs.length:leaf++*300;return p.x;}place(d.root,0);positions.forEach((p,i)=>p.b=box(p.x,p.y,p.n.title,p.n.description||'',i,220));edges.forEach(([a,b,s],i)=>arrow(a.b,b.b,s,i));
 }else if(['cause_chain','process_flow'].includes(t)){
  let prev,y=0;d.steps.forEach((s,i)=>{const b=box((i%3)*330,y,s.title,s.description||'',i,240);if(prev)arrow(prev,b,t==='cause_chain'?(s.relation||'導致／促成'):'',i);prev=b;if(i%3===2)y+=260;});
 }else if(t==='cycle_map'){
  const radius=Math.max(330,d.steps.length*70),bs=d.steps.map((s,i)=>{const a=2*Math.PI*i/d.steps.length-Math.PI/2;return box(Math.cos(a)*radius,Math.sin(a)*radius,s.title,s.description||'',i,210);});bs.forEach((b,i)=>arrow(b,bs[(i+1)%bs.length],'',i));
 }else if(t==='comparison_matrix'){
  traces.push({type:'table',header:{values:['比較維度',...d.columns].map(escape),height:36},cells:{values:[d.rows.map(r=>escape(r.label)),...d.columns.map((_,i)=>d.rows.map(r=>escape(r.values[i])))],height:44,align:'left'}});
 }else if(t==='formula_map'){
  let y=0;d.formulas.forEach((f,i)=>{const b=box(0,y,f.name,f.formula+(f.note?'\n'+f.note:''),i,560);y+=b.h+65;});
 }else if(t==='exam_overview')panels(d.sections);
 else if(t==='fishbone'){
  rule(-180,0,850,0,C(0),3);box(1000,0,d.effect,'',0,240);d.categories.forEach((c,i)=>{const side=i%2===0?-1:1,x=Math.floor(i/2)*290,b=box(x,side*240,c.title,c.causes.map(v=>'• '+v).join('\n'),i+1,240);arrow(b,{x:x+80,y:0},'',i+1);});
 }else if(t==='venn'){
  shapes.push(...[-160,160].map((x,i)=>({type:'circle',x0:x-310,x1:x+310,y0:-250,y1:250,line:{color:C(i),width:3},fillcolor:C(i),opacity:.12,layer:'below'})));d.sets.forEach((s,i)=>label(i===0?-280:280,0,s.title+'\n'+s.items.join('\n'),C(i),16,220));label(0,0,'交集\n'+d.intersection.join('\n'),st.fg,14,180);bound(0,0,980,520);
 }else if(t==='quadrant'){
  const positions=[[0,50],[50,50],[0,0],[50,0]],quad=i=>(d.points[i].y>=50?0:2)+(d.points[i].x>=50?1:0);
  positions.forEach(([x,y],i)=>{shapes.push({type:'rect',x0:x,x1:x+50,y0:y,y1:y+50,fillcolor:C(i),opacity:st.background==='black'?.13:.055,line:{width:0},layer:'below'});});
  shapes.push({type:'line',x0:50,x1:50,y0:0,y1:100,line:{color:st.muted,width:1.5,dash:'dash'},layer:'below'},{type:'line',x0:0,x1:100,y0:50,y1:50,line:{color:st.muted,width:1.5,dash:'dash'},layer:'below'});
  // Headings live above/below the chart, separate from point labels and axis titles.
  const headings=[[.175,1.06],[.525,1.06],[.175,-.12],[.525,-.12]];
  headings.forEach(([x,y],i)=>annotations.push({xref:'paper',yref:'paper',x,y,text:'<b>'+lines(d.quadrants[i],12)+'</b>',showarrow:false,xanchor:'center',font:{size:13,color:C(i)},bgcolor:st.surface,borderpad:5}));
  // Points use numbered markers. Full names move to a separate, wrapped key;
  // close or identical coordinates stay legible in the key instead of colliding.
  traces.push({type:'scatter',mode:'markers+text',x:d.points.map(p=>p.x),y:d.points.map(p=>p.y),text:d.points.map((_,i)=>String(i+1)),textposition:'middle center',textfont:{size:11,color:VCStyle.inkOn(C(0))},marker:{size:24,color:C(0),line:{color:st.bg,width:2}},customdata:d.points.map((p,i)=>[escape(p.title),escape(p.description||''),escape(d.quadrants[quad(i)])]),hovertemplate:'<b>%{customdata[0]}</b><br>%{customdata[2]}<br>X: %{x} / Y: %{y}<br>%{customdata[1]}<extra></extra>'});
  annotations.push({xref:'paper',yref:'paper',x:.75,y:1,xanchor:'left',yanchor:'top',text:'<b>項目索引</b>',showarrow:false,font:{size:13,color:st.fg}});
  d.points.slice(0,16).forEach((p,i)=>annotations.push({xref:'paper',yref:'paper',x:.75,y:.93-i*(.88/Math.max(6,Math.min(16,d.points.length))),xanchor:'left',yanchor:'top',align:'left',text:'<b>'+String(i+1).padStart(2,'0')+'</b>　'+lines(Array.from(p.title).slice(0,26).join('')+(p.title.length>26?'…':''),13),showarrow:false,font:{size:d.points.length>16?10:12,color:st.fg},hovertext:escape(p.description||p.title),captureevents:true}));
  if(d.points.length>16)annotations.push({xref:'paper',yref:'paper',x:.75,y:-.02,xanchor:'left',text:'另有 '+(d.points.length-16)+' 項；移到資料點查看名稱。',showarrow:false,font:{size:10,color:st.muted}});
  return {traces,layout:{title:{text:escape(d.title)},annotations,shapes,showlegend:false,dragmode:'pan',hovermode:'closest',xaxis:{visible:true,domain:[0,.70],range:[-3,103],tickvals:[0,25,50,75,100],showgrid:false,zeroline:false,title:{text:escape(d.x_label),standoff:62}},yaxis:{visible:true,range:[-3,103],tickvals:[0,25,50,75,100],showgrid:false,zeroline:false,title:{text:escape(d.y_label),standoff:14}},margin:{t:115,l:85,r:35,b:125}}};
 }else if(t==='timeline'){
  d.events.forEach((e,i)=>{const b=box(i*300,i%2?200:-200,e.date,e.title+(e.description?'\n'+e.description:''),i,240);rule(i*300,0,i*300,b.y-Math.sign(b.y)*b.h/2,C(i));});rule(0,0,(d.events.length-1)*300,0,st.muted,3);
 }else if(t==='pyramid'){
  let y=0;d.levels.forEach((l,i)=>{const w=280+i*130,h=Math.max(115,75+l.items.length*25);shapes.push({type:'path',path:`M ${-w/2} ${y+h} L ${w/2} ${y+h} L ${(w-90)/2} ${y} L ${-(w-90)/2} ${y} Z`,line:{color:C(i),width:2},fillcolor:st.surface,layer:'below'});label(0,y+h/2,l.title+'\n'+l.items.join(' · '),C(i),15,w-90);bound(0,y+h/2,w,h);y+=h+10;});
 }else if(t==='cornell_notes'){
  const a=box(-200,0,'提示／自問',d.cues.map(x=>'• '+x).join('\n'),0,260),b=box(240,0,'內容筆記',d.notes.map(x=>'• '+x).join('\n'),1,520);box(40,Math.max(a.h,b.h)/2+160,'自己的摘要',d.summary,2,830);
 }else if(t==='kwl')panels(d.columns,3);
 else if(t==='retrieval_cards'){
  d.cards.forEach((c,i)=>{const b=box((i%3)*350,Math.floor(i/3)*260,'問題 '+(i+1),c.question+'\n（滑鼠停留查看答案）',i,280);const a=annotations[annotations.length-1];a.hovertext='<b>答案</b><br>'+lines(c.answer,25)+(c.hint?'<br>提示：'+lines(c.hint,25):'');a.hoverlabel={bgcolor:st.surface,font:{color:st.fg,size:15},bordercolor:C(i)};});
 }else if(t==='spaced_repetition'){
  const max=Math.max(...d.topics.flatMap(s=>s.days));d.topics.forEach((s,i)=>{const sorted=[...s.days].sort((a,b)=>a-b);traces.push({type:'scatter',mode:'markers',name:escape(s.title),x:sorted,y:sorted.map(()=>i),marker:{size:14},hovertemplate:escape(s.title)+'：第 %{x} 天<extra></extra>'});});return {traces,layout:{title:{text:escape(d.title)},xaxis:{title:{text:'從開始日算起的天數'},range:[-1,max+1],dtick:max<=30?1:undefined},yaxis:{tickvals:d.topics.map((_,i)=>i),ticktext:d.topics.map(s=>escape(s.title)),autorange:'reversed'},annotations:d.note?[{text:escape(d.note),xref:'paper',yref:'paper',x:0,y:-.12,showarrow:false,xanchor:'left'}]:[],margin:{b:110},showlegend:false}};
 }else if(t==='study_gantt'){
  traces.push({type:'bar',orientation:'h',y:d.tasks.map(s=>escape(s.title)),x:d.tasks.map(s=>s.duration),base:d.tasks.map(s=>s.start),customdata:d.tasks.map(s=>s.start),hovertemplate:'%{y}<br>開始：%{customdata}<br>持續：%{x}<extra></extra>'});return {traces,layout:{title:{text:escape(d.title)},xaxis:{title:{text:'時間（'+escape(d.unit||'天')+'）'},range:[0,Math.max(...d.tasks.map(s=>s.start+s.duration))]},yaxis:{autorange:'reversed'},showlegend:false}};
 }
 if(!traces.length)traces.push({type:'scatter',x:[Number.isFinite(xmin)?xmin:0],y:[Number.isFinite(ymin)?ymin:0],mode:'markers',marker:{opacity:0,size:1},hoverinfo:'skip',showlegend:false});
 const host=typeof document.getElementById==='function'?document.getElementById('plot'):null;const rect=host?.parentElement?.getBoundingClientRect?.()||{width:1000,height:700};const pw=Math.max(240,rect.width-130),ph=Math.max(260,rect.height-235),gw=xmax-xmin+140,gh=ymax-ymin+140,scale=Math.min(pw/gw,ph/gh);if(Number.isFinite(scale)){annotations.forEach(a=>{a.font={color:st.fg,...a.font,size:Math.max(10,(a.font?.size||14)*scale)};});}const rx=Number.isFinite(gw)?Math.max(gw,gh*pw/ph):1,ry=Number.isFinite(gh)?Math.max(gh,gw*ph/pw):1,cx=(xmin+xmax)/2,cy=(ymin+ymax)/2;const axes=t==='comparison_matrix'?{}:{xaxis:{visible:false,range:[cx-rx/2,cx+rx/2],fixedrange:false},yaxis:{visible:false,range:[cy+ry/2,cy-ry/2],fixedrange:false}};
 return {traces,layout:{title:{text:escape(d.title)},annotations,shapes,...axes,showlegend:false,hovermode:'closest',dragmode:'pan',margin:{t:85,l:40,r:40,b:50}}};
};
window.VCLearning={validate:check,types:templates.map(t=>t.id)};
})();
