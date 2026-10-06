# 網址、GitHub Pages 與圖表下載

## 現在的網址從哪裡來？

https://visual-canvas.fancy-bear-9592.chatgpt.site 是透過 ChatGPT Sites 發布的靜態網站；原始碼另外保存在 bobrta/ai-visualizer。它不是 GitHub Pages 網址。兩邊是各自部署，修改 GitHub 不會自動更新 Sites。

## 如何在 GitHub 上開成網站？

1. 開啟 https://github.com/bobrta/ai-visualizer 。
2. 若使用 GitHub Free 且儲存庫仍是 Private：Settings → General → Danger Zone → Change repository visibility → Public。這會公開整個 repo 與歷史，先確認內容適合公開。
3. Settings → Pages。
4. Build and deployment → Source 選 Deploy from a branch。
5. Branch 選 main，Folder 選 /(root)，按 Save。
6. 等 GitHub 建置完成，Pages 設定頁會顯示 Visit site；請以該頁顯示的成功網址為準。

通常預期網址為 https://bobrta.github.io/ai-visualizer/ ，但在 Pages 尚未啟用前不能當作已上線網址。

本專案附 .nojekyll，可直接部署靜態 HTML/JS；不需要模型、API key 或後端。GitHub Pages 的公開／私人 repo 可用性依方案而定。

官方文件：https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 如何下載圖表？

| 位置／操作 | 格式 | 用途 |
|---|---|---|
| 主工作台 → 選 SVG → 下載圖片 | .svg | 2D 向量圖，可放大。3D 圖可能嵌入點陣影像 |
| 主工作台 → 選 PNG → 下載圖片 | .png | 一般圖片，插入 Word/Google Docs/簡報 |
| 主工作台 → 儲存指令 | .json | 保存資料與顏色／背景設定，可重新貼入 |
| 研究工作室 → 下載 SVG | .svg | 圖形加標題、圖說與来源 |
| 研究工作室 → 下載 PNG | .png | 3 倍像素圖片；不等於自帶 300 DPI 中繼資料 |
| 研究工作室 → 保存圖形指令 | .json | 再編輯資料、圖說與呈現設定 |
| 主工作台／研究工作室 → 下載 PDF | .pdf | 直接下載 A4 橫式 PDF；若未自動下載，點狀態列下載連結。研究圖包含標題、圖說與來源 |

先按「產生圖形」，再下載；匯出的是最近成功產生的圖。SVG/PNG 不等於可重新編輯的資料，請另外保存 JSON。尚不支援 .xlsx 或 .xmind。下載通常進入瀏覽器預設的 Downloads 資料夾。

## 20 色與黑白底

兩個工作台都提供 20 個有名稱與色碼的主色色票，背景可選白或黑。主色會帶動系列配色，黑底會提亮過深線條；圖中文字使用對比色。輸出保留圖表背景。白底通常更方便列印，黑底可用於深色簡報。

## 學習模板的定位

新增的筆記模板是通用架構，不是對特定書籍的逐字複製或來源認證。卡片盒筆記與提取練習卡不同；概念圖預設範例含使用者提供的心智圖比較、三步驟 SOP 與暖化因果鏈，請補上可查核的課程／文獻來源；關係詞不必都是因果。魚骨圖與 Why 分析提出可能原因，不自動證明根因。文氏圖只處理 2–3 組集合，面積不表示數量。


PDF 使用高解析度圖片封裝，中文以圖片保留。需要向量編輯請選 SVG。下載在本機瀏覽器完成，不需要付費 API。

放大後請先等待文字更新，再匯出。PNG 與 PDF 使用畫面上的尺寸比例，提高像素倍率不會讓文字相對縮小。圖表工具列提供放大／縮小／適合畫面，左側「圖中文字大小」可加大字級；輸入報告圖說和來源後重新產生。
