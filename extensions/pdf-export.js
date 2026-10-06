/* Direct PDF download. Charts are embedded as a high-resolution JPEG page.
   No popups, print dialogs, PDF library CDN, or server upload. */
(()=>{'use strict';
const enc=s=>new TextEncoder().encode(s);
function pdfBytes(jpeg,width,height){
 if(!(jpeg instanceof Uint8Array)||jpeg.length<4||jpeg[0]!==255||jpeg[1]!==216)throw Error('PDF 圖片資料無效。');
 const chunks=[],offsets=[0];let length=0;const add=b=>{chunks.push(b);length+=b.length;},ascii=s=>add(enc(s));
 ascii('%PDF-1.4\n');add(new Uint8Array([37,226,227,207,211,10]));
 function object(id,head,stream){offsets[id]=length;ascii(id+' 0 obj\n'+head);if(stream){ascii('\nstream\n');add(stream);ascii('\nendstream');}ascii('\nendobj\n');}
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');
 object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 object(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
 object(4,'<< /Type /XObject /Subtype /Image /Width '+width+' /Height '+height+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpeg.length+' >>',jpeg);
 const drawing=enc('q\n841.89 0 0 595.28 0 0 cm\n/Im0 Do\nQ\n');object(5,'<< /Length '+drawing.length+' >>',drawing);
 const xref=length;ascii('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)ascii(String(offsets[i]).padStart(10,'0')+' 00000 n \n');ascii('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n'+xref+'\n%%EOF\n');
 const out=new Uint8Array(length);let pos=0;for(const b of chunks){out.set(b,pos);pos+=b.length;}return out;
}
function decodeJpeg(url){const raw=atob(url.split(',')[1]),out=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);return out;}
function download(blob,filename){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),600000);return url;}
async function exportPDF({title='Visual Canvas 圖表',subtitle='',image,caption='',source='',showTitle=true,filename,downloadFile=true}={}){
 if(typeof image!=='string'||!/^data:image\/(svg\+xml|png|jpeg);/i.test(image))throw Error('請先產生圖形，再下載 PDF。');
 const img=new Image();await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('圖形轉換逾時，請重新產生後重試。')),20000);img.onload=()=>{clearTimeout(timer);resolve();};img.onerror=()=>{clearTimeout(timer);reject(Error('圖形讀取失敗，請重新產生或先下載 PNG。'));};img.src=image;});
 if(!img.naturalWidth||!img.naturalHeight)throw Error('圖形尺寸無效。');
 if(document.fonts?.ready)await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,2000))]);
 const canvas=document.createElement('canvas');canvas.width=2526;canvas.height=1786;const g=canvas.getContext('2d');if(!g)throw Error('瀏覽器無法建立 PDF 圖片。');g.fillStyle='#ffffff';g.fillRect(0,0,canvas.width,canvas.height);
 const pad=90,available=canvas.width-pad*2;let top=pad;
 function textBlock(value,size,color,maxLines=4){if(!value)return;g.font=size+'px Arial, "Noto Sans TC", sans-serif';g.fillStyle=color;let line='',lines=[];for(const ch of Array.from(String(value))){if(ch==='\n'||g.measureText(line+ch).width>available){lines.push(line);line=ch==='\n'?'':ch;}else line+=ch;}if(line)lines.push(line);lines=lines.slice(0,maxLines);lines.forEach(s=>{g.fillText(s,pad,top+size);top+=size*1.4;});top+=12;}
 if(showTitle)textBlock(String(title).slice(0,200),48,'#1e293b',3);textBlock(subtitle,30,'#64748b',3);
 const footnotes=[caption,source?('資料來源：'+source):''].filter(Boolean),bottomReserve=footnotes.length?Math.min(350,footnotes.join('').length*1.2+100):0,areaHeight=canvas.height-pad-top-bottomReserve;
 const ratio=Math.min(available/img.naturalWidth,areaHeight/img.naturalHeight);if(!Number.isFinite(ratio)||ratio<=0)throw Error('PDF 文字過多，請縮短標題或圖說。');const w=img.naturalWidth*ratio,h=img.naturalHeight*ratio;g.drawImage(img,pad+(available-w)/2,top+(areaHeight-h)/2,w,h);
 top=canvas.height-pad-bottomReserve;for(const note of footnotes)textBlock(note,26,'#475569',5);
 let jpeg;try{jpeg=decodeJpeg(canvas.toDataURL('image/jpeg',.94));}catch{throw Error('圖片無法轉成 PDF，請確認圖形不含外部圖片。');}
 const bytes=pdfBytes(jpeg,canvas.width,canvas.height),blob=new Blob([bytes],{type:'application/pdf'}),name=(filename||String(title||'chart').slice(0,80)).replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').replace(/\.pdf$/i,'')+'.pdf';
 const downloadURL=downloadFile?download(blob,name):null;return {blob,filename:name,bytes:bytes.length,downloadURL};
}
exportPDF.encode=pdfBytes;window.VCPdfExport=exportPDF;
})();
