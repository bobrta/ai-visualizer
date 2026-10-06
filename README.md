# Visual Canvas｜50 種圖形指令 App

貼入 JSON 指令 → 按「產生圖形」→ 直接顯示圖形，不需要 AI API 金鑰。

## 線上使用

直接開啟 https://visual-canvas.fancy-bear-9592.chatgpt.site 。網站不需帳號登入，入口採用前端密碼介面。密碼另行提供，不在 README 公開。

點「選擇指令架構」挑選 50 種圖形，切換「點選填寫」或「貼上指令」，再按「產生圖形」。可複製 JSON 與 AI 提示詞。心智圖提供新增主分支、子節點與刪除按鈕。

## 本機使用

1. Code → Download ZIP，解壓縮。
2. 用 Safari／Chrome 開啟 index.html，charts.js 必須保留在同一資料夾。
3. 左側選圖表類型，按「範例」試畫；每種都有可編輯的 JSON。
4. 或貼入 AI 依指定格式產生的 JSON，按「產生圖形」。指令內的 type 決定真正的圖形類型，選單不會自動轉換舊資料。
5. 心智圖：拖曳空白畫布、滾輪縮放、分支收合、雙擊修改文字。
6. 數據圖：使用圖上的工具列縮放、平移、重置、下載 PNG；3D 圖可旋轉視角。
7. 儲存指令下載 JSON；匯出圖片：心智圖為 SVG，數據图為 PNG。

GitHub 檔案預覽不會執行 HTML；線上版已透過 Sites 發布，非 GitHub Pages。

## 原有 30 種類型

心智圖、折線、長條、群組長條、堆疊長條、面積、堆疊面積、散佈、氣泡、圓餅、環圈、直方、箱形、小提琴、熱力、等高線、3D 散佈、3D 折線、3D 曲面、3D 長條、瀑布、漏斗、雷達、極座標、矩形樹、旭日、桑基、平行座標、K 線、資料表。

完整格式見 CHART_FORMATS.md；examples/charts-50.json 是 50 份合成示範資料的目錄。每次貼入其中一個圖形物件。

## 執行與資料

- 心智圖離線運作；數據圖按需載入 Plotly 4.1.1，需網路存取 https://cdn.plot.ly/plotly-4.1.1.min.js。3D 需 WebGL。
- 本程式不呼叫 AI，不將輸入資料送往伺服器。載入 CDN 會對第三方發出下載引擎的網路請求。
- 資料不自動保存，請在關閉前儲存 JSON。
- 每次輸入最多 2 MB；心智圖 15 層、500 節點；3D 長條最多 200 根。
- 頁面檢查資料形狀、有限數值、長度與必要條件；不保證資料真實，也不替代統計判讀。
- schema/knowledge.schema.json 為舊版心智圖格式，仍支援匯入。新版使用 type/title 與各類型欄位。

## 驗證

JavaScript 語法、30 個架構按鈕與表單路由模擬、新舊心智圖格式、全部 30 種範例轉換、5 種非法資料檢查通過。環境的瀏覽器下載失敗，尚未完成實際瀏覽器渲染、WebGL 與圖片匯出的驗證。

## 技術來源

Plotly 官方文件：https://plotly.com/javascript/getting-started/ 與 https://plotly.com/javascript/3d-charts/。

目前不支援 XMind 檔案匯出、節點自由拖曳與 Excel 公式計算。資料表模式用於顯示資料。

## 密碼介面與開源

本專案自有程式使用 MIT 授權（見 LICENSE）。Plotly 為獨立第三方依賴，其授權依官方版本。GitHub repository 必須設定為 Public 才能公開供他人瀏覽；授權檔不會自動改變可見性。

密碼介面只用於一般瀏覽的便利限制，不是安全驗證：前端資產仍可下載，懂技術的人可繞過或離線猜測密碼，不能用來保護機密資料。gate-config.js 保存隨機 salt 與 SHA-256 摘要，不保存明文密碼。

換密碼：在本機專案執行 `node tools/set-password.cjs`，依提示輸入新密碼，提交 gate-config.js 並重新部署。該簡單腳本的終端輸入可能可見。

無 AI API、無模型推論；資料處理、雜湊與繪圖均在訪客瀏覽器執行。網站仍需要靜態代管與網路流量，費用依代管服務方案。

## 研究與報告工作室（獨立擴充）

主頁「研究與報告工作室」或直接開啟 https://visual-canvas.fancy-bear-9592.chatgpt.site/extensions/research-studio/index.html 。沿用原本密碼。

獨立資料夾：`extensions/research-studio/`，14 種 ECharts／Mermaid 架構，涵蓋誤差棒、森林、啞鈴、管制、柏拉、知識關係網、階層樹、日曆熱力、流程、循序、甘特、狀態、類別與實體關係圖。原 30 種格式與操作保留。

提供學術藍橙、商務低彩度與黑白列印，輸出含圖說及資料來源的 SVG、3× 像素 PNG。風格與選圖說明、第三方授權及限制見擴充資料夾 README/THIRD_PARTY。主程式的外觀層位於 `extensions/professional.css` 與 `extensions/professional.js`，可移除引入來回復原有樣式。

本次驗證包含 14 個範例、3 套風格、誤差區間幾何、柏拉圖累積比例、5 個無效輸入案例及舊功能回歸。尚未進行實際瀏覽器視覺與匯出驗證。

## 20 色、黑白底與思考筆記

兩個工作台新增 20 個可點主色與黑／白背景；主工作台可選 SVG 或 PNG。研究工作室另外加入 16 個思考圖與筆記架構，獨立於主程式，總計 30 個研究／思考架構。

如何在 GitHub Pages 上發布，以及 SVG、PNG、JSON、PDF 的下載方式，請見 [DOWNLOAD_GUIDE.md](DOWNLOAD_GUIDE.md)。目前 Sites 網址不是 GitHub Pages 網址；Pages 是否啟用請以 Settings → Pages 顯示為準。



## 主工作台擴充到 50 種

原 30 種保留，新增 20 個學習視圖：概念圖、因果鏈、決策樹、比較矩陣、流程圖、公式關係圖、層級分類圖、考前總覽、魚骨原因圖、集合重疊圖、四象限學習圖、事件時間軸、循環學習圖、層級金字塔、康乃爾筆記圖、KWL 知識盤點、主動提取問答卡、間隔複習排程、學習甘特圖、論證結構圖。

介面及貼入 JSON → 產生圖形的操作保留。所有新增圖表都提供範例、中文欄位、AI 提示詞、20 色與黑白底。SVG／PNG／PDF 使用既有輸出功能；PDF 是列印視窗的「另存為 PDF」。

擴充位於 `extensions/learning-charts/`，不修改研究工作室。讀取順序：appearance → charts → learning catalog → learning adapters → professional → 主程式 → builder。請完整保留專案資料夾，不能只下載 index.html。

完整格式見 [CHART_FORMATS.md](CHART_FORMATS.md)，[50 個範例](examples/charts-50.json)，[學習圖使用與限制](extensions/learning-charts/README.md)。

本次驗證：50 種範例表單來回轉換、49 個 Plotly 配置、11 種非法輸入、新增 20 種黑底配置通過。尚未實測本次新增圖表的瀏覽器繪製與下載；不能把配置檢查等同圖形與匯出測試。
