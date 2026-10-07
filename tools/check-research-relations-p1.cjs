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
assert(L.meta.ringGap>=300,'dense network expands ring gap');
assert(L.meta.nodeGap>=40,'dense network expands node gap');
const hub=L.nodes.find(n=>n.id==='n0');
for(const n of L.nodes){
 if(n.id==='n0')continue;
 const d=Math.hypot(n.x-hub.x,(n.y-hub.y)/.84);
 assert(d>=L.meta.hubSafeRadius-2,'node violates hub safety radius');
}
let overlaps=0;
for(let i=0;i<L.nodes.length;i++)for(let j=i+1;j<L.nodes.length;j++)if(E.rectOverlap(L.nodes[i],L.nodes[j],4))overlaps++;
assert.equal(overlaps,0,'network nodes should not overlap');

const a=L.nodes[1],b=L.nodes[2],route=N.routeEdge(a,b,1);
const first=N.placeLabel(route,'第一個關係詞',L.nodes,[]);
const second=N.placeLabel(route,'第二個關係詞',L.nodes,[first.box]);
assert(first.box&&second.box,'edge label boxes returned');
assert(!E.rectOverlap(first.box,second.box,6)||second.score>=first.score,'second label considers occupied labels');

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

console.log('PASS: P1 network hub safety, collision avoidance, edge-label occupancy and adaptive Why spacing.');
