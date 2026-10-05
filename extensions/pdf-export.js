'use strict';
window.VCPdfExport = async function ({ title = 'Visual Canvas 圖表', subtitle = '', image, caption = '', source = '', showTitle = true, targetWindow = null } = {}) {
  if (typeof image !== 'string' || !/^data:image\/(svg\+xml|png);/i.test(image)) {
    throw new Error('無法建立 PDF 圖形，請先產生圖表後重試。');
  }
  const win = targetWindow || window.open('', '_blank');
  if (!win) throw new Error('瀏覽器封鎖了 PDF 視窗，請允許此網站開啟彈出視窗後重試。');
  const doc = win.document;
  doc.open();
  doc.write(`<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title></title><style>
    @page{size:A4 landscape;margin:12mm}*{box-sizing:border-box}body{margin:0;color:#1e293b;font:14px/1.55 Arial,"Noto Sans TC",sans-serif}.sheet{width:100%;display:flex;flex-direction:column;gap:8px}.heading{margin:0;font-size:20px;font-weight:700}.subtitle{margin:0;color:#526174;white-space:pre-wrap}.graphic{width:100%;height:170mm;object-fit:contain;object-position:center}.note{margin:0;color:#334155;white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}.source{color:#64748b}@media screen{body{background:#e8edf2;padding:24px}.sheet{margin:auto;padding:24px;background:#fff;max-width:1100px;box-shadow:0 4px 24px #0001}.graphic{height:auto;max-height:70vh}.print-tip{font-size:12px;color:#526174}}@media print{.print-tip{display:none}}
    </style></head><body><main class="sheet"><h1 class="heading"></h1><p class="subtitle"></p><img class="graphic" alt="圖表"><p class="note caption"></p><p class="note source"></p><p class="print-tip">請在列印視窗選擇「另存為 PDF」或「Save as PDF」。</p></main></body></html>`);
  doc.close();
  const safeTitle = String(title || 'Visual Canvas 圖表').slice(0, 120);
  win.document.title = safeTitle.replace(/[\\/:*?"<>|]/g, '-');
  win.document.querySelector('.heading').textContent = showTitle ? safeTitle : '';
  win.document.querySelector('.heading').hidden = !showTitle;
  win.document.querySelector('.subtitle').textContent = subtitle || '';
  win.document.querySelector('.subtitle').hidden = !subtitle;
  win.document.querySelector('.caption').textContent = caption || '';
  win.document.querySelector('.caption').hidden = !caption;
  win.document.querySelector('.source').textContent = source ? `資料來源：${source}` : '';
  win.document.querySelector('.source').hidden = !source;
  const img = win.document.querySelector('.graphic');
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('圖形載入失敗，請改用 SVG 或 PNG 匯出。'));
    img.src = image;
    if (img.complete && img.naturalWidth) resolve();
  });
  win.focus();
  setTimeout(() => win.print(), 250);
};
