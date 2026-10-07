/* Usage: node tools/check-pdf.cjs /path/to/test.jpg /tmp/output.pdf */
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path'),os=require('os');
const [jpegPathArg,outPathArg]=process.argv.slice(2),outPath=outPathArg||path.join(os.tmpdir(),'visual-canvas-check.pdf');
const jpeg=jpegPathArg?fs.readFileSync(jpegPathArg):Buffer.from([0xff,0xd8,0xff,0xd9]),data='data:image/jpeg;base64,'+jpeg.toString('base64');let clicked=0,appended=0,removed=0;
class Img{naturalWidth=600;naturalHeight=400;set src(v){queueMicrotask(()=>this.onload());}}
const g={fillRect(){},fillText(){},drawImage(){},measureText:s=>({width:s.length*20})};
const doc={createElement:type=>type==='canvas'?{getContext:()=>g,toDataURL:()=>data}:{style:{},click(){clicked++;},remove(){removed++;}},body:{appendChild(){appended++;}}};
const ctx={window:{open(){throw Error('PDF must not open a popup');}},document:doc,Image:Img,Blob,TextEncoder,Uint8Array,atob,queueMicrotask,URL:{createObjectURL:()=> 'blob:pdf-check',revokeObjectURL(){}},setTimeout:(f,ms)=>ms>=600000?0:setTimeout(f,ms),clearTimeout};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.resolve(__dirname,'../extensions/pdf-export.js'),'utf8'),ctx);
(async()=>{const r=await ctx.window.VCPdfExport({title:'微積分學習圖',image:data});assert.equal(r.blob.type,'application/pdf');assert.equal(r.filename,'微積分學習圖.pdf');assert.equal(clicked,1);assert.equal(appended,1);assert.equal(removed,1);assert.equal(r.downloadURL,'blob:pdf-check');const bytes=Buffer.from(await r.blob.arrayBuffer());fs.writeFileSync(outPath,bytes);const s=bytes.toString('latin1');assert(s.startsWith('%PDF-1.4'));const offset=+s.match(/startxref\n(\d+)/)[1];assert.equal(s.slice(offset,offset+4),'xref');await assert.rejects(ctx.window.VCPdfExport({image:'invalid'}));console.log('PASS: direct PDF bytes, MIME, Unicode filename, attached download link, no popup, invalid-image rejection. Rasterization is mocked; validate output with pdfinfo.');})();
