/* Shared presentation design system. No document contents are persisted. */
(()=>{'use strict';
const colorFamilies={
 blue:[['深海藍','#24476A'],['高階海軍藍','#1F4E79'],['顧問藍','#2F5D8A'],['鈷藍','#315DA8'],['學術藍','#0072B2'],['孔雀藍','#287C99'],['灰藍','#647C95'],['天藍','#56B4E9']],
 teal:[['深青綠','#176B69'],['青綠','#238B8D'],['翠綠','#009E73'],['海松綠','#3D7F70'],['灰翠綠','#587A72'],['草綠','#5B9957'],['橄欖','#7C8F41'],['鼠尾草','#86A08D']],
 warm:[['酒紅','#8F3F4A'],['磚紅','#B34D48'],['朱紅','#D55E00'],['暖橘','#D79045'],['琥珀','#C58B20'],['金黃','#E0AF32'],['古銅','#9A7445'],['可可','#8A6854']],
 purple:[['深靛紫','#4F4A78'],['靛藍','#5552A3'],['紫羅蘭','#8561A9'],['紫灰','#806293'],['梅紫','#8F5F86'],['紫紅','#AA5388'],['玫瑰','#C45D7A'],['藕粉','#B88791']],
 neutral:[['炭黑','#2D3740'],['石墨','#3F4852'],['石板灰','#64748B'],['冷灰','#7D8790'],['中性灰','#8B929A'],['暖灰','#8A8178'],['灰褐','#8C7867'],['銀灰','#A3ABB2']]
};
const familyLabels={blue:'藍系',teal:'青綠系',warm:'暖色系',purple:'紫紅系',neutral:'中性色'};
const colors=Object.values(colorFamilies).flat();
const GROUP_BUSINESS=['#1F4E79','#176B69','#8B6F47','#806293','#B24A4A','#64748B','#315DA8','#7C8F41','#8F5F86','#287C99'];
const themes={
 executive:{name:'Executive Navy｜高階主管',desc:'深海軍藍＋冷灰，適合策略、財務、決策簡報。',background:'white',color:'#1F4E79',palette:['#1F4E79','#4F81BD','#70AD47','#A5A5A5','#ED7D31','#8064A2'],fg:'#172B3A',muted:'#617181',grid:'#E8EDF2',surface:'#FFFFFF',accent:'#1F4E79',positive:'#2E7D32',negative:'#C64B3C',warning:'#D28A16'},
 consulting:{name:'Consulting Blue｜顧問簡報',desc:'清爽藍灰、資訊層級強，適合分析與提案。',background:'white',color:'#2F5D8A',palette:['#2F5D8A','#7FA6C9','#264653','#5C946E','#D79045','#9A6FB0'],fg:'#1D2A36',muted:'#697886',grid:'#E6EBF0',surface:'#FFFFFF',accent:'#2F5D8A',positive:'#3A7D44',negative:'#B24A4A',warning:'#C6892D'},
 strategy:{name:'Strategy Teal｜策略科技',desc:'深青綠＋海軍藍，適合創新、科技、營運企劃。',background:'white',color:'#176B69',palette:['#176B69','#2F4858','#4E8D7C','#86B6A2','#D2A65A','#9A6570'],fg:'#1C2D31',muted:'#66787C',grid:'#E4ECEA',surface:'#FFFFFF',accent:'#176B69',positive:'#3D7F58',negative:'#B14E54',warning:'#BF8B3E'},
 premium:{name:'Premium Warm｜精品商務',desc:'墨黑、米金、暖灰，適合品牌、競賽封面與高質感提案。',background:'white',color:'#7A5B2E',palette:['#2D3740','#8B6F47','#B79B6C','#687078','#A76B5B','#587A72'],fg:'#272B2F',muted:'#74716C',grid:'#ECE8E2',surface:'#FFFFFF',accent:'#7A5B2E',positive:'#55745F',negative:'#A55D54',warning:'#B3833C'},
 mono:{name:'Monochrome｜黑白列印',desc:'灰階層級清楚，適合正式文件與列印。',background:'white',color:'#3F4852',palette:['#27313A','#59636D','#7D8790','#A3ABB2','#C4C9CD','#E1E4E7'],fg:'#20262C',muted:'#6E7780',grid:'#E5E7E9',surface:'#FFFFFF',accent:'#3F4852',positive:'#4E6354',negative:'#775454',warning:'#78684B'}
};
const fontPresets={
 modern:{name:'現代黑體',body:'-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", Arial, sans-serif',title:'-apple-system, BlinkMacSystemFont, "SF Pro Display", "PingFang TC", "Noto Sans TC", "Microsoft JhengHei", Arial, sans-serif'},
 jhenghei:{name:'微軟正黑體',body:'"Microsoft JhengHei", "PingFang TC", "Noto Sans TC", Arial, sans-serif',title:'"Microsoft JhengHei", "PingFang TC", "Noto Sans TC", Arial, sans-serif'},
 ming:{name:'新細明體',body:'"PMingLiU", "MingLiU", "Noto Serif TC", "Songti TC", serif',title:'"PMingLiU", "MingLiU", "Noto Serif TC", "Songti TC", serif'},
 song:{name:'宋體',body:'"Songti TC", "SimSun", "Noto Serif TC", "PMingLiU", serif',title:'"Songti TC", "SimSun", "Noto Serif TC", "PMingLiU", serif'},
 doll:{name:'娃娃體',body:'"Hannotate TC", "Yuanti TC", "DFKai-SB", "Microsoft JhengHei", "PingFang TC", sans-serif',title:'"Hannotate TC", "Yuanti TC", "DFKai-SB", "Microsoft JhengHei", "PingFang TC", sans-serif'}
};
const STORE='visual-canvas-style-v1';
let theme='executive',color=themes.executive.color,background=themes.executive.background,custom=false,font='modern';
try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');if(saved){if(themes[saved.theme])theme=saved.theme;if(fontPresets[saved.font])font=saved.font;if(['white','black'].includes(saved.background))background=saved.background;if(colors.some(c=>c[1]===saved.color))color=saved.color;custom=Boolean(saved.custom);}}catch{}
function persist(){try{localStorage.setItem(STORE,JSON.stringify({theme,font,color,background,custom}));}catch{}}
function state(){
 const base=themes[theme]||themes.executive,dark=background==='black';
 if(dark)return {theme,font,color,background,bg:'#0B0F14',fg:'#F3F6F8',muted:'#B7C0C8',grid:'#2B343D',surface:'#111820',accent:visible(color),positive:'#76B982',negative:'#E07B72',warning:'#D8B45C',fontFamily:fontPresets[font].body,titleFamily:fontPresets[font].title};
 if(custom)return {theme:'custom',font,color,background,bg:'#FFFFFF',fg:'#1D2A36',muted:'#697886',grid:'#E6EBF0',surface:'#FFFFFF',accent:color,positive:'#3A7D44',negative:'#B24A4A',warning:'#C6892D',fontFamily:fontPresets[font].body,titleFamily:fontPresets[font].title};
 return {...base,theme,font,color:base.color,bg:base.surface,fontFamily:fontPresets[font].body,titleFamily:fontPresets[font].title};
}
function visible(hex){if(background!=='black')return hex;const v=hex.slice(1).match(/../g).map(x=>parseInt(x,16));if((.2126*v[0]+.7152*v[1]+.0722*v[2])<105)return '#'+v.map(n=>Math.round(n+(255-n)*.4).toString(16).padStart(2,'0')).join('');return hex;}
function palette(){const base=themes[theme]||themes.executive;if(!custom)return base.palette.map(visible);const i=colors.findIndex(c=>c[1]===color),offsets=[0,9,18,27,34,14];return offsets.map(n=>visible(colors[(i+n+colors.length)%colors.length][1]));}
function groupPalette(count=10){const n=Math.max(1,Math.min(10,Number(count)||10));if(theme==='mono')return Array.from({length:n},(_,i)=>visible(['#27313A','#3F4852','#59636D','#6E7780','#7D8790','#90979D','#A3ABB2','#B4BAC0','#C4C9CD','#D2D6DA'][i]));const base=GROUP_BUSINESS.map(visible),accent=visible(state().accent),idx=base.findIndex(x=>x.toLowerCase()===accent.toLowerCase());const ordered=idx>0?[...base.slice(idx),...base.slice(0,idx)]:base;return ordered.slice(0,n);}
function mix(a,b,t=.5){const pa=String(a).replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16)),pb=String(b).replace('#','').match(/.{2}/g)?.map(x=>parseInt(x,16));if(!pa||!pb)return a;return '#'+pa.map((v,i)=>Math.round(v+(pb[i]-v)*Math.max(0,Math.min(1,t))).toString(16).padStart(2,'0')).join('');}
function tone(hex,level='base'){const target=background==='black'?'#0B0F14':'#FFFFFF',amount={strong:0,base:.12,soft:.72,faint:.88}[level]??.12;return level==='strong'?visible(hex):mix(visible(hex),target,amount);}
function set(next){
 if(next.theme&&themes[next.theme]){theme=next.theme;color=themes[theme].color;background=themes[theme].background;custom=false;}
 if(next.color&&colors.some(c=>c[1]===next.color)){color=next.color;custom=true;}
 if(['white','black'].includes(next.background))background=next.background;
 if(next.font&&fontPresets[next.font])font=next.font;
 persist();
}
function mount(host,onchange){
 host.classList.add('appearance-panel');
 const legacyColors=[
  ['學術藍','#0072B2'],['鈷藍','#315DA8'],['靛藍','#5552A3'],['紫羅蘭','#8561A9'],['紫紅','#AA5388'],
  ['玫瑰','#C45D7A'],['磚紅','#B34D48'],['朱紅','#D55E00'],['琥珀','#C58B20'],['金黃','#E0AF32'],
  ['橄欖','#7C8F41'],['草綠','#5B9957'],['翠綠','#009E73'],['青綠','#238B8D'],['孔雀藍','#287C99'],
  ['天藍','#56B4E9'],['灰藍','#647C95'],['深海藍','#24476A'],['可可','#8A6854'],['石板灰','#64748B']
 ];
 const colorLabel=document.createElement('strong');colorLabel.textContent='圖表主色 · 20 色';host.append(colorLabel);
 const grid=document.createElement('div');grid.className='color-grid';const buttons=[];
 for(const [name,hex]of legacyColors){const b=document.createElement('button');b.type='button';b.className='color-chip';b.style.backgroundColor=hex;b.title=name+' '+hex;b.setAttribute('aria-label',name+' '+hex);b.onclick=()=>{set({color:hex});refresh();onchange?.();};buttons.push([b,hex]);grid.append(b);}
 host.append(grid);
 const fontRow=document.createElement('label');fontRow.className='appearance-simple-row';fontRow.textContent='圖表字體 ';
 const fontSelect=document.createElement('select');fontSelect.className='font-select';fontSelect.setAttribute('aria-label','圖表字體');
 for(const [id,f] of Object.entries(fontPresets)){const o=document.createElement('option');o.value=id;o.textContent=f.name;fontSelect.append(o);}
 fontSelect.onchange=()=>{set({font:fontSelect.value});refresh();onchange?.();};fontRow.append(fontSelect);host.append(fontRow);
 const bgRow=document.createElement('label');bgRow.className='appearance-simple-row';bgRow.textContent='圖表背景 ';
 const bgSelect=document.createElement('select');bgSelect.setAttribute('aria-label','圖表背景');
 for(const [value,name]of [['white','白色'],['black','黑色']]){const o=document.createElement('option');o.value=value;o.textContent=name;bgSelect.append(o);}
 bgSelect.onchange=()=>{set({background:bgSelect.value});refresh();onchange?.();};bgRow.append(bgSelect);host.append(bgRow);
 const info=document.createElement('small');info.textContent='主色帶動配色；字體只改作品，不改工作台介面。匯出會保留字體與底色。';host.append(info);
 function refresh(){fontSelect.value=font;bgSelect.value=background;buttons.forEach(([b,hex])=>b.setAttribute('aria-pressed',String(custom&&hex===color)));}
 refresh();return {refresh};
}
function inkOn(hex){const a=hex.slice(1).match(/../g).map(x=>parseInt(x,16));return (.2126*a[0]+.7152*a[1]+.0722*a[2])>145?'#111827':'#ffffff';}
window.VCStyle={colors,colorFamilies,familyLabels,themes,fontPresets,state,palette,groupPalette,tone,mix,set,mount,inkOn};
})();