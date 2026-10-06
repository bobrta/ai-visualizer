const fs=require('fs'),vm=require('vm'),assert=require('assert');
const folder=require('path').resolve(__dirname,'..');
const node=()=>({children:[],value:'',style:{},classList:{toggle(){}},setAttribute(){},replaceChildren(){this.children=[]},append(...v){this.children.push(...v)}});
const hosts=new Map();const ctx={window:{},structuredClone,document:{createElement:node},$:id=>{if(!hosts.has(id))hosts.set(id,node());return hosts.get(id);},VCStyle:{state:()=>({background:'white',bg:'#ffffff',fg:'#243449',muted:'#64748b',grid:'#e5e7eb',surface:'#fff'}),palette:()=>['#0072B2','#D55E00','#009E73','#AA5388','#56B4E9','#7C8F41'],inkOn:()=> '#fff'}};
vm.createContext(ctx);
for(const path of ['charts.js','extensions/learning-charts/catalog.js','extensions/learning-charts/adapters.js'])vm.runInContext(fs.readFileSync(folder+'/'+path,'utf8'),ctx);
// Use the exact production form readers and style wrapper in the regression check.
vm.runInContext(fs.readFileSync(folder+'/builder.js','utf8').split('const originalGenerate')[0],ctx);
const style=fs.readFileSync(folder+'/extensions/professional.js','utf8');vm.runInContext(style,ctx);
const ids=vm.runInContext('CHARTS.map(c=>c[0])',ctx);assert.equal(ids.length,50);assert.equal(new Set(ids).size,50);
const examples=[],configs=[];
for(const id of ids){ctx.id=id;const original=vm.runInContext('chartExample(id)',ctx);vm.runInContext('fillForm(chartExample(id))',ctx);const d=vm.runInContext('collectForm()',ctx);assert.equal(JSON.stringify(d),JSON.stringify(original),id+' form round trip');examples.push(d);if(id!=='mindmap'){ctx.doc=d;const c=vm.runInContext('chartConfig(doc)',ctx);assert(c.traces.length,id+' needs traces');const serialized=JSON.stringify(c);assert(!serialized.includes('null,null'),id+' invalid coordinate');configs.push({type:id,...c});}
}
const bad=[
 {type:'concept_map',edit:d=>d.relations[0].to='missing'},
 {type:'concept_map',edit:d=>d.nodes[1].id=d.nodes[0].id},
 {type:'comparison_matrix',edit:d=>d.rows[0].values.pop()},
 {type:'decision_tree',edit:d=>d.root=null},
 {type:'fishbone',edit:d=>d.categories=[]},
 {type:'venn',edit:d=>d.sets.push(d.sets[0])},
 {type:'quadrant',edit:d=>d.points[0].x=101},
 {type:'kwl',edit:d=>d.columns.pop()},
 {type:'spaced_repetition',edit:d=>d.topics[0].days=[1,1]},
 {type:'study_gantt',edit:d=>d.tasks[0].duration=-1},
 {type:'retrieval_cards',edit:d=>d.cards[0].answer=''}
];
for(const b of bad){const d=structuredClone(examples.find(x=>x.type===b.type));b.edit(d);ctx.doc=d;assert.throws(()=>vm.runInContext('chartConfig(doc)',ctx),b.type+' rejects malformed data');}
// Black background and all 20 new types retain visible labels and finite ranges.
ctx.VCStyle.state=()=>({background:'black',bg:'#000000',fg:'#f1f5f9',muted:'#bac5d4',grid:'#374151',surface:'#101722'});
for(const d of examples.slice(30)){ctx.doc=d;const c=vm.runInContext('chartConfig(doc)',ctx);assert.equal(c.layout.paper_bgcolor,'#000000');assert.equal(c.layout.font.color,'#f1f5f9');for(const key of ['xaxis','yaxis'])if(c.layout[key]?.range)assert(c.layout[key].range.every(Number.isFinite));}
fs.writeFileSync(folder+'/examples/charts-50.json',JSON.stringify(examples,null,2));if(process.env.KSS_CONFIG_PATH)fs.writeFileSync(process.env.KSS_CONFIG_PATH,JSON.stringify(configs));
console.log('PASS: 50 unique types, 50 exact form round trips, 49 Plotly configurations, 11 invalid-data checks, 20 dark-background checks. Browser rendering/export not tested.');
