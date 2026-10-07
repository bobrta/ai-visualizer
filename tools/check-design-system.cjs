const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const root=path.resolve(__dirname,'..');
const ctx={console,structuredClone};ctx.window=ctx;
vm.createContext(ctx);
for(const f of ['extensions/appearance.js','charts.js','extensions/professional.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const themeIds=['executive','consulting','strategy','premium','mono'];
function rgb(hex){return hex.slice(1).match(/../g).map(x=>parseInt(x,16));}
function lum(hex){const a=rgb(hex).map(v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const x=lum(a),y=lum(b),hi=Math.max(x,y),lo=Math.min(x,y);return (hi+.05)/(lo+.05);}
for(const id of themeIds){
  ctx.VCStyle.set({theme:id});
  const s=ctx.VCStyle.state(),p=ctx.VCStyle.palette();
  assert.equal(p.length,6,id+' has six presentation colors');
  assert.equal(new Set(p).size,6,id+' palette colors are distinct');
  assert(s.fontFamily.includes('PingFang TC'),id+' supports Traditional Chinese typography');
  assert(s.titleFamily.includes('SF Pro Display'),id+' has display-title stack');
  assert(/^#[0-9A-F]{6}$/i.test(s.positive)&&/^#[0-9A-F]{6}$/i.test(s.negative),id+' semantic colors');
  assert(contrast(s.fg,s.bg)>=7,id+' body text contrast');
  assert(contrast(s.muted,s.bg)>=3,id+' muted text contrast');
}
ctx.VCStyle.set({theme:'executive'});
ctx.doc=ctx.chartExample('bar');let c=ctx.chartConfig(ctx.doc);
assert.equal(c.layout.title.font.size,28);assert.equal(c.layout.font.size,12);
assert.equal(c.layout.xaxis.tickfont.size,11);assert.equal(c.layout.legend.orientation,'h');
assert.equal(c.traces[0].marker.line.width,0);
ctx.doc=ctx.chartExample('waterfall');c=ctx.chartConfig(ctx.doc);
const s=ctx.VCStyle.state();assert.equal(c.traces[0].increasing.marker.color,s.positive);assert.equal(c.traces[0].decreasing.marker.color,s.negative);
ctx.doc=ctx.chartExample('parallel');c=ctx.chartConfig(ctx.doc);
assert(c.traces[0].labelfont.family.includes('PingFang TC'));assert(c.traces[0].labelfont.size<=14);
ctx.doc=ctx.chartExample('table');c=ctx.chartConfig(ctx.doc);
assert.equal(c.traces[0].header.font.size,13);assert.equal(c.traces[0].cells.font.size,12);
console.log('PASS: 5 presentation themes, contrast, typography hierarchy, semantic colors, and chart styling.');
