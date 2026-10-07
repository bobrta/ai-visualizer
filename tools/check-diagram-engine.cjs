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

console.log('PASS: Diagram Engine v1 text measurement, tree layout, collision, bounds and edge routing.');
