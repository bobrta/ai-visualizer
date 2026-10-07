const assert=require('assert'),path=require('path');
const E=require(path.resolve(__dirname,'../extensions/diagram-engine.js'));

const wrapped=E.wrapText('資料來源格式不一致導致報告延遲，需要重新整理與驗證',{fontSize:14,maxWidth:120,maxLines:4});
assert(wrapped.lines.length>=2,'long CJK text should wrap');
assert(wrapped.lines.length<=4,'wrap respects max lines');
assert(wrapped.width<=120,'wrapped line width stays inside limit');

const root={name:'問題：報告延遲',children:[
  {name:'為何？資料整理未完成',children:[
    {name:'為何？來源格式不一致',children:[{name:'待驗證：缺少統一模板'}]}
  ]},
  {name:'其他可能：時間估計不足'},
  {name:'其他可能：需求反覆變更造成工作重做'}
]};
const layout=E.layoutTree(root,{direction:'LR',fontSize:15,maxNodeWidth:260,levelGap:100,siblingGap:24,padding:32});
assert.equal(layout.nodes.length,6,'tree node count');
assert.equal(layout.edges.length,5,'tree edge count');
assert(layout.bounds.width>0&&layout.bounds.height>0,'tree bounds are valid');

for(let i=0;i<layout.nodes.length;i++){
  const a=layout.nodes[i];
  assert(a.width>=92&&a.height>20,'node has measured box');
  const left=a.x-a.width/2,top=a.y-a.height/2,right=a.x+a.width/2,bottom=a.y+a.height/2;
  assert(left>=layout.bounds.x-1&&right<=layout.bounds.right+1,'node inside horizontal bounds');
  assert(top>=layout.bounds.y-1&&bottom<=layout.bounds.bottom+1,'node inside vertical bounds');
  for(let j=i+1;j<layout.nodes.length;j++){
    const b=layout.nodes[j];
    assert(!E.rectOverlap(a,b,8),`nodes overlap: ${a.label} / ${b.label}`);
  }
}

const byId=new Map(layout.nodes.map(n=>[n.id,n]));
for(const edge of layout.edges){
  const r=E.routeEdge(byId.get(edge.source),byId.get(edge.target),{style:'curved',direction:'LR'});
  assert(/^M /.test(r.d)&&r.d.includes(' C '),'curved edge path');
  assert(Number.isFinite(r.labelPoint.x)&&Number.isFinite(r.labelPoint.y),'edge label point');
}
const ortho=E.routeEdge(layout.nodes[0],layout.nodes[1],{style:'orthogonal',direction:'LR'});
assert(ortho.d.split(' L ').length>=3,'orthogonal route has bends');

const fit=E.fitBounds(layout.bounds,1200,800,30);
assert(fit.scale>0&&fit.scale<=1,'fit scale valid');
assert(Number.isFinite(fit.tx)&&Number.isFinite(fit.ty),'fit translation valid');

const ir=E.normalizeIR({nodes:[{id:'a',label:'A'},{id:'b',label:'B'}],edges:[{source:'a',target:'b',label:'關係'}]});
assert.equal(ir.nodes.length,2);assert.equal(ir.edges[0].label,'關係');

const networkData={nodes:[
{id:'concept',name:'概念圖'},{id:'node',name:'知識概念節點'},{id:'arrow',name:'箭頭連線'},
{id:'relation',name:'關係連接詞'},{id:'proposition',name:'有邏輯的命題'},{id:'mindmap',name:'心智圖'},
{id:'network',name:'網狀／多對多連結'},{id:'logic',name:'因果、演變、系統邏輯'}
],links:[
{source:'concept',target:'node',relation:'整理'},{source:'concept',target:'arrow',relation:'用箭頭連接'},
{source:'arrow',target:'relation',relation:'在線上標示'},{source:'node',target:'proposition',relation:'＋關係詞組成'},
{source:'relation',target:'proposition',relation:'說明彼此關係'},{source:'concept',target:'network',relation:'著重'},
{source:'concept',target:'logic',relation:'可呈現'},{source:'mindmap',target:'network',relation:'對照'}
]};
const net=E.layoutNetwork(networkData,{centerId:'concept',ringGap:170,nodeGap:24,padding:36});
assert.equal(net.meta.hub,'concept','explicit network hub is preserved');
assert.equal(net.nodes.length,8,'network node count');
assert(net.bounds.width>0&&net.bounds.height>0,'network bounds valid');
const hub=net.nodes.find(n=>n.id==='concept');
assert(hub.level===0,'hub is level zero');
for(let i=0;i<net.nodes.length;i++)for(let j=i+1;j<net.nodes.length;j++)assert(!E.rectOverlap(net.nodes[i],net.nodes[j],6),`network nodes overlap: ${net.nodes[i].id}/${net.nodes[j].id}`);
const netMap=new Map(net.nodes.map(n=>[n.id,n]));
for(const e of net.edges){
 const r=E.routeNetworkEdge(netMap.get(e.source),netMap.get(e.target));
 assert(r.d.includes(' Q '),'network uses quadratic curved routes');
 const lp=E.placeEdgeLabel(r,e.label,net.nodes,{fontSize:11,maxWidth:130});
 assert(Number.isFinite(lp.x)&&Number.isFinite(lp.y),'network label point valid');
 for(const n of net.nodes)assert(!E.nodeContainsPoint(n,{x:lp.x,y:lp.y},-2),'edge label center should avoid node body');
}
const a=netMap.get('concept'),b=netMap.get('network');
const r1=E.routeNetworkEdge(a,b,{index:0,total:2}),r2=E.routeNetworkEdge(b,a,{index:1,total:2});
assert(r1.d!==r2.d,'parallel/opposite routes are separated');

const flowCode='flowchart TD\n A[提出研究問題] --> B[蒐集資料]\n B --> C{資料足夠？}\n C -->|是| D[分析與解釋]\n C -->|否| B\n D --> E[撰寫報告]';
const parsedFlow=E.parseFlowchart(flowCode);
assert.equal(parsedFlow.direction,'TD','flow direction parsed');
assert.equal(parsedFlow.nodes.length,5,'flow node count');
assert.equal(parsedFlow.edges.length,5,'flow edge count');
assert.equal(parsedFlow.nodes.find(n=>n.id==='C').shape,'diamond','decision node parsed as diamond');
assert.equal(parsedFlow.edges.find(e=>e.source==='C'&&e.target==='B').label,'否','branch label parsed');

const flow=E.layoutFlow(flowCode,{rankGap:120,siblingGap:44,padding:52,maxNodeWidth:250});
assert(flow.bounds.width>0&&flow.bounds.height>0,'flow bounds valid');
const flowMap=new Map(flow.nodes.map(n=>[n.id,n]));
for(let i=0;i<flow.nodes.length;i++)for(let j=i+1;j<flow.nodes.length;j++)assert(!E.rectOverlap(flow.nodes[i],flow.nodes[j],6),`flow nodes overlap: ${flow.nodes[i].id}/${flow.nodes[j].id}`);
const decision=flowMap.get('C');
for(const side of ['top','bottom','left','right']){const p=E.flowPort(decision,side);assert(Number.isFinite(p.x)&&Number.isFinite(p.y),'diamond port '+side);}
const backEdge=flow.edges.find(e=>e.source==='C'&&e.target==='B'),forwardEdge=flow.edges.find(e=>e.source==='C'&&e.target==='D');
assert(flow.edgeMeta.get(backEdge.id).back===true,'loop edge detected as back edge');
assert(flow.edgeMeta.get(forwardEdge.id).back===false,'forward branch remains forward');
const backRoute=E.routeFlowEdge(flowMap.get(backEdge.source),flowMap.get(backEdge.target),{direction:'TD',back:true,lane:0,canvasBounds:flow.bounds});
assert(backRoute.back&&backRoute.d.split(' L ').length>=3,'loop edge routes outside with orthogonal bends');
assert(backRoute.labelAnchor==='end'||backRoute.labelAnchor==='start','loop label is anchored outside');
const forwardRoute=E.routeFlowEdge(flowMap.get(forwardEdge.source),flowMap.get(forwardEdge.target),{direction:'TD',back:false,canvasBounds:flow.bounds});
assert(!forwardRoute.back&&forwardRoute.d.split(' L ').length>=3,'forward edge uses orthogonal routing');

console.log('PASS: Diagram Engine v1 tree + network + flow layout, collisions, bounds, ports, routing and labels.');
