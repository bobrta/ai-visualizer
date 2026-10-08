# Visual Canvas｜100 種圖形指令 App

貼入 JSON 指令 → 按「產生圖形」→ 直接顯示圖形，不需要 AI API 金鑰。

## 本機使用（目前推薦方式）

Visual Canvas 現在採 **local-first**：程式與資料主要在自己的電腦執行，不需要 AI API、帳號或雲端資料庫。

### macOS 最簡單流程

1. GitHub → Code → Download ZIP，解壓縮整個資料夾。
2. 第一次有網路時，在終端機進入專案資料夾後執行：

   `python3 tools/offline_setup.py`

   這會把固定版本的 Plotly 4.1.1、ECharts 5.6.0、Mermaid 11.4.1 下載到 `assets/vendor/`。只需要做一次。
3. 之後執行：

   `python3 tools/local_server.py --port 4173`

   程式只綁定 `127.0.0.1`，會自動打開瀏覽器。完成首次初始化後，即使沒有網路也可以使用主工作台與 Research Studio。
4. macOS 也提供 `setup-offline.command` 與 `start-local.command` 作為快捷入口；若 Finder 阻擋執行，可先用上面的 Python 指令。
5. 不建議直接用 `file://...` 雙擊 `index.html`：ES module、瀏覽器安全限制與本機資源載入在不同瀏覽器下可能不一致。

### Windows

1. 下載並解壓縮整個專案。
2. 第一次有網路時雙擊 `setup-offline.bat`，或在命令提示字元執行 `python tools\offline_setup.py`。
3. 之後雙擊 `start-local.bat`，瀏覽器會自動開啟 localhost。
4. Windows 與 macOS 共用相同 Python 核心；差別只有快捷啟動檔（`.bat` / `.command`）。

### 日常操作

- 左側選圖表類型，按「範例」試畫；每種都有可編輯 JSON。
- 或貼入符合格式的 JSON，再按「產生圖形」。
- 心智圖支援拖曳、縮放、分支收合與文字編輯。
- 數據圖支援縮放、平移、PNG；其他視圖可輸出 SVG／PNG／PDF。
- 專案與草稿會保存在瀏覽器 localStorage；重要內容仍建議定期匯出 Project JSON 備份。

目前專案以本機使用為主，GitHub Pages 部署流程暫停；之後正式公開網站時再重新啟用部署。

## 原有 30 種類型

心智圖、折線、長條、群組長條、堆疊長條、面積、堆疊面積、散佈、氣泡、圓餅、環圈、直方、箱形、小提琴、熱力、等高線、3D 散佈、3D 折線、3D 曲面、3D 長條、瀑布、漏斗、雷達、極座標、矩形樹、旭日、桑基、平行座標、K 線、資料表。

完整格式見 CHART_FORMATS.md；examples/charts-100.json 是 100 份合成示範資料的目錄。每次貼入其中一個圖形物件。

## 執行與資料

- 本機模式優先載入 `assets/vendor/` 中的 Plotly 4.1.1、ECharts 5.6.0、Mermaid 11.4.1；完成首次初始化後不需要 CDN。
- 執行時會先嘗試 `assets/vendor/` 的固定版本；若本機檔缺少且電腦有網路，才回退到固定版本 CDN。要完全離線，請先執行一次 `setup-offline.command` / `setup-offline.bat`。
- 本程式不呼叫 AI API，不會主動把圖表輸入送到遠端伺服器。
- 草稿、專案、工作模式等資料會保存在瀏覽器 localStorage；清除瀏覽器網站資料會一併清除，所以重要專案要匯出 JSON 備份。
- localStorage 依完整網址（含連接埠）分開保存。日常啟動檔固定使用 `http://127.0.0.1:4173`；若該埠被占用，請先關閉舊的本機伺服器。若手動不指定 `--port` 而改到其他連接埠，原資料仍留在原網址，並不是被刪除。
- `tools/local_server.py` 只監聽 `127.0.0.1`，不會把本機網站開放到區域網路。
- 每次輸入最多 2 MB；心智圖 15 層、500 節點；3D 長條最多 200 根。
- 頁面檢查資料形狀、有限數值、長度與必要條件；不保證資料真實，也不替代統計判讀。
- schema/knowledge.schema.json 為舊版心智圖格式，仍支援匯入。新版使用 type/title 與各類型欄位。

## 驗證

目前 GitHub Actions 會執行 JavaScript 語法、圖表格式、PDF、Typography、Design System、Guardrails、Smart Layout、Auto Insight、Annotation Layout、Accessibility、Emphasis、Legend Intelligence、Executive Summary、Executive Layout Quality、Secondary Interfaces 與 Diagram Engine 等檢查。

另有 Playwright + Chromium 的 Browser Visual Smoke，會實際載入主工作台與研究工作室，驗證 Plotly 圖表、3D、平行座標、商業簡報版型、極端長標題／長來源／多系列壓力案例、Quality Panel、研究圖與視覺截圖 artifact。這些測試用於回歸與版面穩定性，不代表所有瀏覽器、裝置與所有輸入組合都已人工驗證。

## 技術來源

Plotly 官方文件：https://plotly.com/javascript/getting-started/ 與 https://plotly.com/javascript/3d-charts/。

目前不支援 XMind 檔案匯出、節點自由拖曳與 Excel 公式計算。資料表模式用於顯示資料。

## 密碼介面與開源

本專案自有程式使用 MIT 授權（見 LICENSE）。Plotly 為獨立第三方依賴，其授權依官方版本。GitHub repository 必須設定為 Public 才能公開供他人瀏覽；授權檔不會自動改變可見性。

密碼介面只用於一般瀏覽的便利限制，不是安全驗證：前端資產仍可下載，懂技術的人可繞過或離線猜測密碼，不能用來保護機密資料。gate-config.js 保存隨機 salt 與 SHA-256 摘要，不保存明文密碼。

換密碼：在本機專案執行 `node tools/set-password.cjs`，依提示輸入新密碼，提交 gate-config.js 並重新部署。該簡單腳本的終端輸入可能可見。

無 AI API、無模型推論；資料處理、雜湊與繪圖均在訪客瀏覽器執行。網站仍需要靜態代管與網路流量，費用依代管服務方案。

## 研究與報告工作室（獨立擴充）

主頁「研究與報告工作室」或在本機啟動後開啟 `/extensions/research-studio/index.html`。Research Studio 會優先使用本機 ECharts / Mermaid。

獨立資料夾：`extensions/research-studio/`，14 種 ECharts／Mermaid 架構，涵蓋誤差棒、森林、啞鈴、管制、柏拉、知識關係網、階層樹、日曆熱力、流程、循序、甘特、狀態、類別與實體關係圖。原 30 種格式與操作保留。

提供學術藍橙、商務低彩度與黑白列印，輸出含圖說及資料來源的 SVG、3× 像素 PNG。風格與選圖說明、第三方授權及限制見擴充資料夾 README/THIRD_PARTY。主程式的外觀層位於 `extensions/professional.css` 與 `extensions/professional.js`，可移除引入來回復原有樣式。

本次驗證包含程式規則檢查與 Chromium Browser Visual Smoke；研究工作室的 Why、Concept、Flowchart、Stakeholder System Map 會實際渲染並保存測試截圖。

## 20 色、黑白底與思考筆記

兩個工作台新增 20 個可點主色與黑／白背景；主工作台可選 SVG 或 PNG。研究工作室另外加入 16 個思考圖與筆記架構，獨立於主程式，總計 30 個研究／思考架構。

如何在 GitHub Pages 上發布，以及 SVG、PNG、JSON、PDF 的下載方式，請見 [DOWNLOAD_GUIDE.md](DOWNLOAD_GUIDE.md)。目前 Sites 網址不是 GitHub Pages 網址；Pages 是否啟用請以 Settings → Pages 顯示為準。



## 主工作台擴充到 100 種

原 30 種保留，新增 20 個學習視圖：概念圖、因果鏈、決策樹、比較矩陣、流程圖、公式關係圖、層級分類圖、考前總覽、魚骨原因圖、集合重疊圖、四象限學習圖、事件時間軸、循環學習圖、層級金字塔、康乃爾筆記圖、KWL 知識盤點、主動提取問答卡、間隔複習排程、學習甘特圖、論證結構圖。

介面及貼入 JSON → 產生圖形的操作保留。所有新增圖表都提供範例、中文欄位、AI 提示詞、20 色與黑白底。SVG／PNG／PDF 使用既有輸出功能；PDF 直接下載 A4 橫式檔案，另提供手動下載連結。

擴充位於 `extensions/learning-charts/`，不修改研究工作室。讀取順序：appearance → charts → learning catalog → learning adapters → professional → 主程式 → builder。請完整保留專案資料夾，不能只下載 index.html。

完整格式見 [CHART_FORMATS.md](CHART_FORMATS.md)，[100 個範例](examples/charts-100.json)，[學習圖使用與限制](extensions/learning-charts/README.md)。

本次驗證：100 種範例表單來回轉換、69 個 Plotly 配置、11 種非法輸入、新增 20 種黑底配置通過。尚未實測本次新增圖表的瀏覽器繪製與下載；不能把配置檢查等同圖形與匯出測試。

## 流程與時間圖（51–70）與直接 PDF

新增 10 種流程圖、10 種時間圖，獨立放在 `extensions/flow-time/`。沿用 JSON、中文表單、20 色及黑白底。PDF 現在直接產生檔案，無須列印視窗；下載被阻擋可點狀態列連結。PDF 是 A4 橫式高解析度點陣圖，向量需求請下載 SVG。

驗證：100 種範例、70 次表單來回轉換、69 個 Plotly 設定、40 個新增圖表黑底設定；PDF 檔案結構經 pdfinfo 與 pdftoppm 驗證。瀏覽器實際渲染與下載尚未實測。

## 可讀性與報告模式

圖表縮放時節點／連線標籤與文字標記按座標跨度同步改變字級；畫布放大亦調整字級。軸刻度保持可讀，另有 100%、125%、150%、200% 字級選擇。PNG 使用相同畫布的 3 倍解析度，PDF 保留画面比例。心智圖字級會同時更新節點換行與高度。

新增兩種工程圖：缺失柏拉圖、製程能力與規格圖。新增四種表達／策略架構：PREP、SWOT、TOWS、SCQA。所有範例為合成資料。可填寫座標與單位、图說及資料來源；這些欄位同時保存於 JSON 的 report 欄位。規格界限不是管制界限。製程能力圖只在提供正值 within_sigma 時顯示 Cp/Cpk；0 表示未提供。使用能力指標前需確認製程穩定、估計方法與分布假設，工具不自動認定製程合格。

參考：
- https://plotly.com/javascript/plotlyjs-events/
- https://plotly.com/javascript/plotlyjs-function-reference/
- https://github.com/plotly/plotly.js/blob/master/src/components/annotations/draw.js
- https://github.com/d3/d3-zoom/blob/main/src/transform.js
- https://asq.org/quality-resources/pareto
- https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm

程式為本專案實作，未複製上述第三方程式碼。檢查：76 次表單轉換、75 個 Plotly 設定、46 個新增圖黑底、24 個非法輸入、柏拉圖累積百分比與能力公式、字級縮放及事件循環。這些是程式測試；本次未實測瀏覽器渲染、字體重疊及下載。

## 10 個商業架構

PREP、SWOT、TOWS、SCQA、商業模式畫布 BMC、價值主張畫布 VPC、PESTEL、波特五力、AIDA、OKR。全部放在獨立的 `extensions/strategy/`，使用原有的字級、配色和匯出。範例為合成資料，並非實際市場或法律判斷。

本次新增六個商業架構後，檢查通過 100 種範例與表單轉換、81 個 Plotly 設定、31 個非法輸入、52 個新增圖黑底設定，以及 OKR 增加／降低方向的進度計算；未實測瀏覽器繪製或下載。

## 工業工程與時間計畫（83–90）

勞動生產力、OEE、產線平衡、效率／效能、需求節拍、工作量時間估算、產能負荷、工作日計畫日曆。輸入數據，顯示圖、公式與計算表；上方列出彙總結果。使用範圍與單位見 `extensions/engineering/README.md`。

本版通過 90 次表單轉換、89 個圖表設定、60 個新增圖黑底設定，以及八個 IE 計算公式、時間單位轉換、順序排程與 13 個非法輸入的檢查。瀏覽器實際渲染與匯出尚未實測。

## 四象限重設、獨立指南與 100 圖

四象限使用完整 0–100 座標、淡色區塊、分界線與圖外象限標題；點上顯示編號，右側提供前 16 項文字索引，長標題截短後可滑鼠查看完整文字。超過 16 項的名称請在點上查看，或保存完整 JSON。這避免把長文字全部擠在同一位置。

獨立指南位於 [guides/chart-handbook](guides/chart-handbook/README.md)，包含 100 圖用途、可複製 AI 指令、完整 JSON、推薦書籍與查閱來源；網頁版可從工作台左側開啟。指南按 type 帶回主工作台載入範例。

新增 10 個商業時間架構：重要／緊急矩陣、每日時間預算、價值／時間排序、番茄鐘工時計畫、時間投資回收、會議人時、期限倒排、CPM、時間差異、Little 定律。假設與公式見 extensions/business-time/README.md。

最新檢查：100 個範例與表單轉換、99 个 Plotly 設定、70 個新增圖黑底配置、四象限座標方向與字級上限、商業時間公式與 CPM 浮時、指南 100 個 JSON/type 與語法。實際瀏覽器渲染／匯出尚未實測。
