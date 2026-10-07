/* Executive Layout Quality Control v3
   Preflights layout pressure, safely downgrades risky variants, then fits text/legend after v2 composition. */
(()=>{'use strict';
const VERSION='3.0',base=chartConfig;
const len=v=>Array.from(String(v??'')).length;
const esc=v=>window.VCExecutiveSummary?.escapeHtml?VCExecutiveSummary.escapeHtml(v):String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function workMode(){try{return localStorage.getItem('visual-canvas-work-mode-v1')||'business';}catch{return'business';}}
function outputId(){try{return window.VCOutputFormat?.current?.().id||localStorage.getItem('visual-canvas-output-format-v1')||'slide_16_9';}catch{return'slide_16_9';}}
function seriesCount(d){return Array.isArray(d.series)?d.series.length:1;}
function headlineSeed(d){return String(d.presentation?.headline||d.headline||d.title||'');}
function wrap(v,max=26,lines=2){
 const chars=Array.from(String(v??'')),out=[];while(chars.length&&out.length<lines)out.push(chars.splice(0,max).join(''));
 if(chars.length&&out.length){let last=Array.from(out.at(-1));if(last.length>=max)last=last.slice(0,Math.max(1,max-1));out[out.length-1]=last.join('')+'…';}
 return out;
}
function preflight(d){
 const format=outputId(),requested=window.VCExecutiveSummary?.resolveLayout?.(d)||'top_kpi',headLen=len(headlineSeed(d)),sourceLen=len(d.report?.source||d.source||''),series=seriesCount(d);
 let final=requested;const fixes=[],warnings=[];
 const compact=['slide_16_9','slide_4_3','square'].includes(format),portrait=format==='a4_portrait';
 if(requested==='split_compare'&&(series>6||portrait)){final='top_kpi';fixes.push({code:'safe-layout',label:series>6?'系列過多，雙欄比較改為 KPI 上排':'直式頁面將雙欄比較改為 KPI 上排'});}
 if(['left_kpi','trend_focus'].includes(requested)&&portrait){final='top_kpi';fixes.push({code:'portrait-layout',label:'A4 直式改用 KPI 上排，保留主圖寬度'});}
 if(requested==='left_kpi'&&compact&&headLen>58){final='top_kpi';fixes.push({code:'headline-layout',label:'長結論標題改用 KPI 上排，避免左側資訊欄過度壓縮'});}
 if(series>12)warnings.push({code:'many-series',label:'系列超過 12 組，建議先聚合或只保留主要系列。'});
 if(sourceLen>160)warnings.push({code:'long-source',label:'資料來源過長，簡報頁將顯示縮寫版本。'});
 if(headLen>72)warnings.push({code:'long-headline',label:'結論標題過長，已自動縮排；建議人工濃縮結論。'});
 return {format,requested,final,headLen,sourceLen,series,fixes,warnings};
}
function fontForHeadline(n,format){if(format==='a4_portrait')return n>55?18:n>38?21:24;return n>60?18:n>44?21:n>30?23:26;}
function fontForValue(v,primary=false){const n=len(v);const base=primary?22:18;if(n<=9)return base;if(n<=14)return base-3;if(n<=20)return base-5;return Math.max(11,base-7);}
function plain(t){return String(t??'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"');}
function postfit(d,r,p){
 if(!r.executiveSummary?.enabled)return {...r,executiveQuality:{version:VERSION,enabled:false,score:100,fixes:[],warnings:[]}};
 const q={...p,fixes:[...p.fixes],warnings:[...p.warnings]},layout=r.layout||(r.layout={}),anns=layout.annotations||[],shapes=layout.shapes||[],cards=r.executiveSummary.kpis||[];
 const head=r.executiveSummary.headline||headlineSeed(d),headAnn=anns.find(a=>a.xref==='paper'&&Number(a.y)>=1.27&&String(a.text||'').includes('<b>'));
 if(headAnn){
   const maxChars=p.format==='a4_portrait'?24:34,lines=wrap(head,maxChars,2);
   headAnn.text='<b>'+lines.map(esc).join('<br>')+'</b>';headAnn.font={...(headAnn.font||{}),size:fontForHeadline(len(head),p.format)};
   if(lines.length>1){layout.margin={...(layout.margin||{}),t:Math.max(layout.margin?.t||0,p.final==='top_kpi'?248:190)};q.fixes.push({code:'headline-fit',label:'長標題自動分行並縮小字級'});}
 }
 if(d.title&&String(d.title)!==head){
   const titleAnn=anns.find(a=>a.xref==='paper'&&Number(a.y)>1.18&&Number(a.y)<1.27&&plain(a.text)===String(d.title).slice(0,90));
   if(titleAnn&&len(d.title)>48){titleAnn.text=wrap(String(d.title),36,2).map(esc).join('<br>');titleAnn.font={...(titleAnn.font||{}),size:9};q.fixes.push({code:'subtitle-fit',label:'副標題自動分行'});}
 }
 cards.forEach((c,i)=>{
   const wanted='<b>'+esc(c.value)+'</b>',a=anns.find(x=>String(x.text||'')===wanted);
   if(a){const next=fontForValue(c.value,i===0);if(Number(a.font?.size)!==next){a.font={...(a.font||{}),size:next};q.fixes.push({code:'kpi-fit',label:'KPI 數值過長，自動縮小字級'});}}
   if(c.detail&&len(c.detail)>18){const da=anns.find(x=>plain(x.text)===String(c.detail));if(da){da.text=esc(String(c.detail).slice(0,17))+'…';da.font={...(da.font||{}),size:7};q.fixes.push({code:'kpi-detail-fit',label:'KPI 補充文字過長，自動截短'});}}
 });
 const insightAnn=anns.find(a=>String(a.text||'').startsWith('<b>INSIGHT</b>'));
 if(insightAnn){
   const raw=r.executiveSummary.insight||'',max=p.format==='a4_portrait'?72:96;
   if(len(raw)>max){insightAnn.text='<b>INSIGHT</b>  '+wrap(raw,Math.floor(max/2),2).map(esc).join('<br>');insightAnn.font={...(insightAnn.font||{}),size:9};q.fixes.push({code:'insight-fit',label:'洞察文字自動分行'});}
 }
 const sourceAnn=anns.find(a=>String(a.text||'').startsWith('資料來源：'));
 if(sourceAnn&&r.executiveSummary.source){
   const limit=p.format==='a4_portrait'?90:110,raw=r.executiveSummary.source,shown=len(raw)>limit?Array.from(raw).slice(0,limit-1).join('')+'…':raw;
   sourceAnn.text='資料來源：'+esc(shown);sourceAnn.font={...(sourceAnn.font||{}),size:len(shown)>80?7:8};
   if(shown!==raw)q.fixes.push({code:'source-fit',label:'過長資料來源改用簡報顯示縮寫'});
 }
 const legendCount=(r.traces||[]).filter(t=>t.showlegend!==false&&t.name).length;
 if(legendCount>6){
   layout.legend={...(layout.legend||{}),font:{...(layout.legend?.font||{}),size:legendCount>10?8:9}};
   if(p.final==='top_kpi'){layout.legend={...layout.legend,orientation:'v',x:1.02,xanchor:'left',y:1,yanchor:'top'};layout.margin={...(layout.margin||{}),r:Math.max(layout.margin?.r||0,legendCount>10?190:165)};}
   else{layout.legend={...layout.legend,orientation:'h',x:0,y:-.19};layout.margin={...(layout.margin||{}),b:Math.max(layout.margin?.b||0,132)};}
   q.fixes.push({code:'legend-fit',label:'高密度圖例自動調整字級與位置'});
 }
 const domain=layout.xaxis?.domain||((r.traces||[]).find(t=>t.domain?.x)?.domain?.x),width=Array.isArray(domain)?domain[1]-domain[0]:1;
 if(width<.54)q.warnings.push({code:'narrow-plot',label:'主圖有效寬度偏窄，建議使用 KPI 上排或減少系列。'});
 const unique=[];for(const f of q.fixes)if(!unique.some(x=>x.code===f.code&&x.label===f.label))unique.push(f);q.fixes=unique;
 const pressure=Math.min(40,(q.fixes.length*4)+(q.warnings.length*8)+(p.series>8?6:0)+(p.headLen>60?5:0));
 q.score=Math.max(60,100-pressure);q.legendCount=legendCount;q.plotWidth=width;q.degraded=p.requested!==p.final;
 r.executiveSummary={...r.executiveSummary,layout:p.final,layoutLabel:VCExecutiveSummary.LAYOUTS?.[p.final]||r.executiveSummary.layoutLabel};
 return {...r,executiveQuality:{version:VERSION,enabled:true,score:q.score,format:q.format,requestedLayout:q.requested,finalLayout:q.final,degraded:q.degraded,fixes:q.fixes,warnings:q.warnings,legendCount:q.legendCount,plotWidth:q.plotWidth}};
}
chartConfig=function(d){
 const p=preflight(d);
 let input=d;
 if(workMode()==='business'&&window.VCExecutiveSummary?.enabled?.()&&p.final!==p.requested){
   input={...d,presentation:{...(d.presentation||{}),executive_layout:p.final}};
 }
 return postfit(d,base(input),p);
};
window.VCExecutiveQuality={VERSION,preflight,postfit,wrap,fontForHeadline,fontForValue,outputId};
})();