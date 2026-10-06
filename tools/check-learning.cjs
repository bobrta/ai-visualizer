const fs=require('fs'),vm=require('vm'),assert=require('assert');
const folder=require('path').resolve(__dirname,'..');
const node=()=>({children:[],value:'',style:{},classList:{toggle(){}},setAttribute(){},replaceChildren(){this.children=[]},append(...v){this.children.push(...v)}});
const hosts=new Map();const ctx={window:{},structuredClone,document:{createElement:node},$:id=>{if(!hosts.has(id))hosts.set(id,node());return hosts.get(id);},VCStyle:{state:()=>({background:'white',bg:'#ffffff',fg:'#243449',muted:'#64748b',grid:'#e5e7eb',surface:'#fff'}),palette:()=>['#0072B2','#D55E00','#009E73','#AA5388','#56B4E9','#7C8F41'],inkOn:()=> '#fff'}};
vm.createContext(ctx);
for(const path of ['charts.js','extensions/learning-charts/catalog.js','extensions/learning-charts/adapters.js','extensions/flow-time/catalog.js','extensions/flow-time/adapters.js','extensions/strategy/charts.js','extensions/strategy/business.js','extensions/engineering/charts.js','extensions/engineering/calculators.js'])vm.runInContext(fs.readFileSync(folder+'/'+path,'utf8'),ctx);
// Use the exact production form readers and style wrapper in the regression check.
vm.runInContext(fs.readFileSync(folder+'/builder.js','utf8').split('const originalGenerate')[0],ctx);
const style=fs.readFileSync(folder+'/extensions/professional.js','utf8');vm.runInContext(style,ctx);
const ids=vm.runInContext('CHARTS.map(c=>c[0])',ctx);assert.equal(ids.length,90);assert.equal(new Set(ids).size,90);
const examples=[],configs=[];
for(const id of ids){ctx.id=id;const original=vm.runInContext('chartExample(id)',ctx);vm.runInContext('fillForm(chartExample(id))',ctx);const d=vm.runInContext('collectForm()',ctx);assert.equal(JSON.stringify(d),JSON.stringify(original),id+' form round trip');examples.push(d);if(id!=='mindmap'){ctx.doc=d;const c=vm.runInContext('chartConfig(doc)',ctx);assert(c.traces.length,id+' needs traces');const serialized=JSON.stringify(c);assert(!serialized.includes('null,null')||id==='study_calendar',id+' invalid coordinate');configs.push({type:id,...c});}
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
 {type:'retrieval_cards',edit:d=>d.cards[0].answer=''},
 {type:'swimlane',edit:d=>d.steps[0].lane=99},
 {type:'sequence_diagram',edit:d=>d.messages[0].from=99},
 {type:'loop_flow',edit:d=>d.repeat_to=d.repeat_from},
 {type:'study_calendar',edit:d=>d.entries[0].date='2026-02-30'},
 {type:'weekly_timetable',edit:d=>d.blocks[0].end=d.blocks[0].start},
 {type:'review_timeline',edit:d=>d.sessions[0].status='bad'},
 {type:'time_distribution',edit:d=>d.minutes.pop()},
 {type:'schedule_dependencies',edit:d=>d.tasks[0].depends=['missing']},
 {type:'engineering_pareto',edit:d=>d.counts[0]=-1},
 {type:'process_capability',edit:d=>d.lsl=d.usl},
 {type:'process_capability',edit:d=>d.within_sigma=-1},
 {type:'swot_analysis',edit:d=>d.strengths=[]},
 {type:'prep_framework',edit:d=>d.reason=''},
 {type:'business_model_canvas',edit:d=>d.key_partners=[]},
 {type:'value_proposition_canvas',edit:d=>d.pains=['']},
 {type:'pestel_analysis',edit:d=>d.legal=null},
 {type:'porter_five_forces',edit:d=>d.rivalry=[]},
 {type:'aida_framework',edit:d=>d.action=''},
 {type:'okr_framework',edit:d=>d.key_results[0].target=d.key_results[0].baseline},
 {type:'okr_framework',edit:d=>d.key_results[0].current=NaN}
];
for(const b of bad){const d=structuredClone(examples.find(x=>x.type===b.type));b.edit(d);ctx.doc=d;assert.throws(()=>vm.runInContext('chartConfig(doc)',ctx),b.type+' rejects malformed data');}
const pareto=examples.find(d=>d.type==='engineering_pareto');ctx.doc={...pareto,labels:['A','B','C'],counts:[10,60,30]};const pc=vm.runInContext('chartConfig(doc)',ctx);assert.equal(JSON.stringify(pc.traces[0].y),'[60,30,10]');assert.equal(JSON.stringify(pc.traces[1].y),'[60,90,100]');
ctx.doc={...examples.find(d=>d.type==='process_capability'),values:[9,10,11],lsl:7,usl:13,target:10,within_sigma:1};const cap=vm.runInContext('chartConfig(doc)',ctx);assert(cap.layout.annotations.some(a=>a.text.includes('Cp = 1.000')&&a.text.includes('Cpk = 1.000')));assert.equal(cap.traces[0].y.reduce((a,b)=>a+b,0),3);
assert.equal(ctx.window.VC_BUSINESS_TYPES.length,10);ctx.doc={...examples.find(d=>d.type==='okr_framework'),key_results:[{title:'增加',baseline:0,current:5,target:10,unit:'件',direction:'increase'},{title:'降低',baseline:100,current:75,target:50,unit:'秒',direction:'decrease'}]};const okr=vm.runInContext('chartConfig(doc)',ctx);assert.equal(JSON.stringify(okr.traces[0].cells.values[4]),'["50.0%","50.0%"]');
// Black background and all 40 new types retain visible labels and finite ranges.
ctx.VCStyle.state=()=>({background:'black',bg:'#000000',fg:'#f1f5f9',muted:'#bac5d4',grid:'#374151',surface:'#101722'});
for(const d of examples.slice(30)){ctx.doc=d;const c=vm.runInContext('chartConfig(doc)',ctx);assert.equal(c.layout.paper_bgcolor,'#000000');assert.equal(c.layout.font.color,'#f1f5f9');for(const key of ['xaxis','yaxis'])if(c.layout[key]?.range)assert(c.layout[key].range.every(Number.isFinite));}
fs.writeFileSync(folder+'/examples/charts-90.json',JSON.stringify(examples,null,2));if(process.env.KSS_CONFIG_PATH)fs.writeFileSync(process.env.KSS_CONFIG_PATH,JSON.stringify(configs));
console.log('PASS: 90 unique types, 90 exact form round trips, 89 Plotly configurations, 31 invalid-data checks, 60 dark-background checks. Browser rendering/export not tested.');
