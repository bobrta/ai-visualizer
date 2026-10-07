const fs=require('fs'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const researchHtml=read('extensions/research-studio/index.html');
const researchJs=read('extensions/research-studio/studio.js');
const researchThinking=read('extensions/research-studio/thinking.js');
const researchAdapters=read('extensions/research-studio/adapters.js');
const handbook=read('guides/chart-handbook/index.html');
const handbookData=read('guides/chart-handbook/data.js');
const appearance=read('extensions/appearance.js');

assert(!researchHtml.includes('id="theme"'),'Research Studio must not keep the legacy theme selector');
assert(researchHtml.includes('id="appearance"'),'Research Studio uses shared appearance panel');
assert(researchHtml.includes('../diagram-engine.js?v=1'),'Research Studio loads Diagram Engine v1');
assert(!researchJs.includes("el('theme')"),'Research Studio JS must not depend on legacy theme control');
assert(researchJs.includes('previewSize(width,height)'),'Research Studio must decouple preview and export size');
assert(researchJs.includes("['why','argument'].includes(d.type)"),'Why and argument diagrams use Diagram Engine v1');
assert(researchJs.includes("['concept','causal','exchange','network'].includes(d.type)"),'Relationship networks use Diagram Engine network layout');
assert(researchJs.includes("d.type==='flowchart'"),'Flowcharts use Diagram Engine flow layout');
assert(researchJs.includes("d.type==='stakeholder_system_map'"),'Stakeholder system map uses Diagram Engine');
assert(researchJs.includes('Flow Engine fallback to Mermaid'),'Complex flowcharts keep Mermaid compatibility fallback');
for(const [name,src] of [['studio',researchJs],['thinking',researchThinking],['adapters',researchAdapters]]){
  assert(!src.includes('Arial, Noto Sans TC'),name+' must not hardcode the old font stack');
}
assert(researchThinking.includes('style.fontFamily'),'Native research diagrams use shared font');
assert(researchAdapters.includes("st?.fontFamily"),'ECharts configs use shared font');
assert(handbook.includes('src="data.js"'),'Handbook data must be externalized');
assert(!handbook.includes('id="data" type="application/json"'),'Handbook must not embed the full 100-chart dataset');
assert(handbook.includes('../../extensions/appearance.js'),'Handbook uses shared appearance module');
assert(handbookData.startsWith('window.VC_HANDBOOK_DATA='),'Handbook data module shape');
assert(appearance.includes("visual-canvas-style-v1"),'Theme/font state persists across interfaces');
assert(appearance.includes('fontPresets'),'Shared font presets exist');
console.log('PASS: Research Studio and handbook share design state, fonts, and modular data.');
