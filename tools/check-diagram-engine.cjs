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
const r1=E.routeNetworkEdge(a,b,{index:0,total:2,edgeIndex:0}),r2=E.routeNetworkEdge(b,a,{index:1,total:2,edgeIndex:1});
assert(r1.d!==r2.d,'parallel/opposite routes are separated');
const levelOne=net.nodes.filter(n=>n.level===1),quadrants=new Set(levelOne.map(n=>`${Math.sign(n.x-hub.x)}:${Math.sign(n.y-hub.y)}`));
assert(quadrants.size>=4,'small first ring uses the full 360-degree circle');

const denseNetwork={nodes:[{id:'concept',name:'中央核心概念：高密度研究架構'},...Array.from({length:20},(_,i)=>({id:'d'+i,name:'很長的概念節點 '+(i+1)+'：需要自動換行並保持安全距離'}))],links:Array.from({length:20},(_,i)=>({source:'concept',target:'d'+i,relation:'關係詞 '+(i+1)}))};
const denseNet=E.layoutNetwork(denseNetwork,{centerId:'concept',ringGap:170,nodeGap:30,padding:42,maxNodeWidth:280});
assert(denseNet.meta.ringRadii[1]>170,'dense first ring expands beyond the base ring gap');
const denseHub=denseNet.nodes.find(n=>n.id==='concept');
for(const n of denseNet.nodes.filter(n=>n.id!=='concept')){
  const dist=Math.hypot(n.x-denseHub.x,n.y-denseHub.y);
  assert(dist>=denseNet.meta.coreSafetyRadius-2,'dense nodes respect the center safety radius');
}
for(let i=0;i<denseNet.nodes.length;i++)for(let j=i+1;j<denseNet.nodes.length;j++)assert(!E.rectOverlap(denseNet.nodes[i],denseNet.nodes[j],6),`dense network nodes overlap: ${denseNet.nodes[i].id}/${denseNet.nodes[j].id}`);

const sameRoute=E.routeNetworkEdge(denseHub,denseNet.nodes.find(n=>n.id==='d0'),{edgeIndex:0});
const label1=E.placeEdgeLabel(sameRoute,'第一個很長的關係詞',denseNet.nodes,{fontSize:11,maxWidth:130,occupied:[]});
const label2=E.placeEdgeLabel(sameRoute,'第二個很長的關係詞',denseNet.nodes,{fontSize:11,maxWidth:130,occupied:[label1.box]});
assert(!E.rectOverlap(label1.box,label2.box,2),'edge labels avoid each other when candidate space exists');

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

const stakeholderData={center:'銀髮藥動脈雲端平台',groups:[
{id:'admin',name:'Admin',relation:'治理',items:['法規遵循與資料安全監控','財務與帳務結算系統','客貨共載排程最佳化演算法','ESG 碳足跡減少追蹤儀表板']},
{id:'elder',name:'長者與家屬',relation:'使用',items:['慢性病處方與領藥提醒','配送進度與到貨通知','家屬照護與異常提醒']},
{id:'driver',name:'客運司機／配送員',relation:'執行',items:['客貨共載任務清單','定點交付與簽收確認','配送異常回報']},
{id:'pharmacy',name:'在地藥師／醫療機構',relation:'供應',items:['處方與藥品準備','藥品交付核對','殘藥盤點與回收']}
]};
const stake=E.layoutStakeholder(stakeholderData,{groupRadius:260,itemRadius:220,padding:48,maxItemWidth:230});
assert.equal(stake.nodes.filter(n=>n.level===0).length,1,'stakeholder one core');
assert.equal(stake.nodes.filter(n=>n.level===1).length,4,'stakeholder group count');
assert.equal(stake.nodes.filter(n=>n.level===2).length,13,'stakeholder capability count');
assert.equal(stake.edges.length,17,'stakeholder edge count');
assert(stake.nodes.every(n=>n.text&&Array.isArray(n.text.lines)&&n.text.lines.length>0),'stakeholder IR preserves measured text boxes');
for(let i=0;i<stake.nodes.length;i++)for(let j=i+1;j<stake.nodes.length;j++)assert(!E.rectOverlap(stake.nodes[i],stake.nodes[j],4),`stakeholder nodes overlap: ${stake.nodes[i].id}/${stake.nodes[j].id}`);
for(const n of stake.nodes){const left=n.x-n.width/2,top=n.y-n.height/2,right=n.x+n.width/2,bottom=n.y+n.height/2;assert(left>=stake.bounds.x-1&&right<=stake.bounds.right+1,'stakeholder node horizontal bounds');assert(top>=stake.bounds.y-1&&bottom<=stake.bounds.bottom+1,'stakeholder node vertical bounds');}
const sf16=E.fitBounds(stake.bounds,1180,664,30),sfa4=E.fitBounds(stake.bounds,1120,792,30);
assert(sf16.scale>0&&sf16.scale<=1,'stakeholder 16:9 fit');
assert(sfa4.scale>0&&sfa4.scale<=1,'stakeholder A4 fit');
const stakeMap=new Map(stake.nodes.map(n=>[n.id,n]));
for(const e of stake.edges){const r=E.routeStakeholderEdge(stakeMap.get(e.source),stakeMap.get(e.target));assert(r.d.includes(' Q '),'stakeholder curved route');}
assert(/^#[0-9a-f]{6}$/i.test(E.mixHex('#1F4E79','#ffffff',.8)),'stakeholder color mix');

console.log('PASS: Diagram Engine v1 tree + network + flow + stakeholder layouts, collisions, bounds, ports, routing and labels.');
