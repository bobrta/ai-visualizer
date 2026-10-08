const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/diagram-engine.js','extensions/diagram-network-p1.js','extensions/diagram-tree-p1.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const E=ctx.VCDiagramEngine,N=ctx.VCResearchNetworkP1,T=ctx.VCResearchTreeP1;
assert(E&&N&&T,'P1 relation layout modules exposed');

const nodes=Array.from({length:18},(_,i)=>({id:'n'+i,name:i===0?'核心概念':'節點 '+i+' 的較長說明'}));
const links=[];
for(let i=1;i<18;i++)links.push({source:'n0',target:'n'+i,relation:'關係 '+i});
for(let i=1;i<10;i++)links.push({source:'n'+i,target:'n'+(i+8),relation:'延伸 '+i});
const L=N.spreadNetwork({nodes,links},{centerId:'n0'});
assert.equal(L.meta.hub,'n0');
assert.equal(L.meta.layoutVersion,'p3','third-batch network layout active');
assert(L.meta.ringGap>=300,'dense network expands base ring gap');
assert(L.meta.ringRadii[1]>=L.meta.ringGap,'first ring respects density-aware radius');
assert(L.meta.nodeGap>=40,'dense network expands node gap');
assert(L.meta.maxNodeWidth>=220,'network reports adaptive node width');
const hub=L.nodes.find(n=>n.id==='n0');
for(const n of L.nodes){
 if(n.id==='n0')continue;
 const d=Math.hypot(n.x-hub.x,(n.y-hub.y)/.84);
 assert(d>=L.meta.hubSafeRadius-2,'node violates hub safety radius');
}
let overlaps=0;
for(let i=0;i<L.nodes.length;i++)for(let j=i+1;j<L.nodes.length;j++)if(E.rectOverlap(L.nodes[i],L.nodes[j],4))overlaps++;
assert.equal(overlaps,0,'network nodes should not overlap');

const firstRing=L.nodes.filter(n=>n.level===1),quadrants=new Set(firstRing.map(n=>{
 const dx=n.x-hub.x,dy=n.y-hub.y;return (dx>=0?'R':'L')+(dy>=0?'B':'T');
}));
assert.equal(quadrants.size,4,'first ring spans all four quadrants / full 360 degrees');

const a=L.nodes[1],b=L.nodes[2],route=N.routeEdge(a,b,1);
const first=N.placeLabel(route,'第一個關係詞',L.nodes,[]);
const second=N.placeLabel(route,'第二個關係詞',L.nodes,[first.box]);
assert(first.box&&second.box,'edge label boxes returned');
assert(!E.rectOverlap(first.box,second.box,2),'occupied relation labels avoid each other');

const longData={nodes:[{id:'hub',name:'中央核心概念：高密度研究架構'},...Array.from({length:20},(_,i)=>({id:'d'+i,name:'很長的概念節點 '+(i+1)+'：自動換行並增寬以維持可讀性'}))],links:Array.from({length:20},(_,i)=>({source:'hub',target:'d'+i,relation:'關係 '+(i+1)}))};
const dense=N.spreadNetwork(longData,{centerId:'hub',maxNodeWidth:240});
assert(dense.meta.ringRadii[1]>dense.meta.ringGap,'high-density first ring grows beyond base ring gap');
assert(dense.meta.maxNodeWidth>=270,'long node text increases maximum node width');
const denseHub=dense.nodes.find(n=>n.id==='hub');
for(const n of dense.nodes.filter(n=>n.id!=='hub')){
 const d=Math.hypot(n.x-denseHub.x,(n.y-denseHub.y)/.84);
 assert(d>=dense.meta.hubSafeRadius-2,'dense node violates center safety radius');
}
for(let i=0;i<dense.nodes.length;i++)for(let j=i+1;j<dense.nodes.length;j++)assert(!E.rectOverlap(dense.nodes[i],dense.nodes[j],4),`dense network overlap: ${dense.nodes[i].id}/${dense.nodes[j].id}`);

const routeHub=N.spreadNetwork({nodes:[
 {id:'hub',name:'中心'},{id:'left',name:'左側節點'},{id:'right',name:'右側節點'},{id:'top',name:'上方節點'}
],links:[
 {source:'hub',target:'left',relation:'A'},{source:'hub',target:'right',relation:'B'},
 {source:'hub',target:'top',relation:'C'},{source:'left',target:'right',relation:'跨中心'}
]},{centerId:'hub'});
const routeMap=new Map(routeHub.nodes.map(n=>[n.id,n])),cross=N.chooseRoute(routeMap.get('left'),routeMap.get('right'),routeHub.nodes,routeMap.get('hub'),routeHub.meta.hubSafeRadius,3);
assert(cross&&cross.control&&Number.isFinite(cross.control.x)&&Number.isFinite(cross.control.y),'obstacle-aware cross-link route returned');
assert(['clear','fallback'].includes(cross.mode),'route mode is reported');

const tree={name:'這是一個很長的核心研究問題文字',children:[
 {name:'第一條可能原因與說明',children:[{name:'次層原因 A'},{name:'次層原因 B'}]},
 {name:'第二條可能原因與說明'},
 {name:'第三條可能原因與說明'},
 {name:'第四條可能原因與說明'},
 {name:'第五條可能原因與說明'}
]};
const p=T.plan(tree,{maxNodeWidth:290});
assert(p.levelGap>120,'long tree labels expand level gap');
assert(p.siblingGap>=46,'five siblings expand sibling gap');
assert(p.maxNodeWidth>=330,'long labels expand node width');
assert.equal(T.stats(tree).count,8);

const denseTree={name:'問題：高密度 Why 分析與長文字節點排版',children:Array.from({length:5},(_,i)=>({name:'主要原因 '+(i+1)+'：需要足夠層級間距與文字寬度',children:Array.from({length:3},(_,j)=>({name:'次要原因 '+(i+1)+'-'+(j+1)+'：較長文字用來驗證 sibling gap'}))}))};
const dp=T.plan(denseTree,{maxNodeWidth:300});
assert(dp.levelGap>p.levelGap,'dense Why tree increases level gap');
assert(dp.siblingGap>p.siblingGap,'dense Why tree increases sibling gap');
assert(dp.maxNodeWidth>=370,'dense long Why labels widen nodes');
const treeLayout=E.layoutTree(denseTree,{direction:'LR',fontSize:15,maxNodeWidth:dp.maxNodeWidth,levelGap:dp.levelGap,siblingGap:dp.siblingGap,padding:40});
const rootNode=treeLayout.nodes.find(n=>n.level===0),children=treeLayout.nodes.filter(n=>n.level===1);
const fanYs=children.map((n,i)=>T.routeTreeEdge(rootNode,n,{index:i,total:children.length,direction:'LR'}).sourcePoint.y);
assert(new Set(fanYs.map(x=>Math.round(x))).size>=Math.min(3,children.length),'dense Why branches fan out from distinct source points');

console.log('PASS: P3 weighted 360 network, obstacle-aware routing, relation-label avoidance and adaptive Why fan-out.');
