const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const ctx={console};ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../extensions/research-studio/layout.js'),'utf8'),ctx);
const L=ctx.VCResearchLayout;
assert(L&&L.VERSION==='1.0','Research Layout engine exposed');

const base={width:1075,height:760};
let d={type:'gantt',data:{code:`gantt
 dateFormat YYYY-MM-DD
 section 研究規劃
 文獻閱讀 :a, 2026-10-01, 7d
 方法設計 :b, after a, 5d
 section 執行
 資料蒐集 :c, after b, 7d
 報告撰寫 :after c, 5d`}};
let p=L.plan(d,base,3508);
assert(p.height>=360&&p.height<=500,'4-task gantt uses content-sized preview height');
assert(p.height<base.height*.75,'gantt no longer consumes full A4 preview height');
assert(p.outputHeight<1900,'gantt export figure height is smaller than full A4 page height');
let g=L.ganttConfig(d);
assert(g.barHeight>=34,'few gantt tasks use thicker bars');
assert(g.fontSize>=14,'few gantt tasks keep readable font');
assert(g.barGap>=10,'few gantt tasks keep breathing room');

const many=`gantt
 dateFormat YYYY-MM-DD
 section A
 ${Array.from({length:14},(_,i)=>`任務${i+1} :t${i}, 2026-10-${String((i%20)+1).padStart(2,'0')}, 2d`).join('\n')}`;
d={type:'gantt',data:{code:many}};
p=L.plan(d,base,3508);
assert(p.height<=620,'many-task gantt is capped');
g=L.ganttConfig(d);
assert(g.barHeight<=24&&g.fontSize<=12,'dense gantt compacts bars and text');

d={type:'why',data:{root:{name:'問題',children:[{name:'A',children:[{name:'A1'}]},{name:'B'}]}}};
p=L.plan(d,base,3508);
assert(p.height>=390&&p.height<=500,'small Why tree uses compact content height');

d={type:'concept',data:{nodes:Array.from({length:18},(_,i)=>({id:String(i),name:'N'+i})),links:[]}};
p=L.plan(d,base,3508);
assert(p.height>=500&&p.height<=650,'concept network gets bounded research height');

d={type:'why',data:{root:{name:'問題',children:Array.from({length:4},(_,i)=>({name:'原因 '+i,children:Array.from({length:3},(_,j)=>({name:'子原因 '+i+'-'+j}))}))}}};
p=L.plan(d,base,3508);
assert(p.height>=650&&p.height<=690,'dense Why tree receives extra vertical space');

d={type:'concept',data:{nodes:Array.from({length:24},(_,i)=>({id:String(i),name:'密集概念 '+i})),links:[]}};
p=L.plan(d,base,3508);
assert(p.height>=680&&p.height<=700,'dense concept network receives extra vertical space');

const stats=L.mermaidStats(many);
assert(stats.tasks===14,'gantt task count parsed');
assert(stats.sections===1,'gantt section count parsed');
console.log('PASS: Research Figure Layout v1 adaptive heights and gantt typography.');
