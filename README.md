# AI Visualizer｜AI 知識視覺化

第一版 v0.1：文件 → 外部 AI 整理 → JSON → 可展開的階層心智圖。

## 開始使用

1. 在此 repository 點 Code → Download ZIP，解壓縮。
2. 用瀏覽器開啟 index.html，不需要安裝套件或 API 金鑰。
3. 點「載入範例」，點節點展開／收合。
4. 把 prompts/document-to-json.md 的提示詞交給 AI，搭配一章文件；可同時提供 schema/knowledge.schema.json。
5. 將 AI 回傳的 JSON 貼到網頁，點「產生心智圖」，或匯入 .json 檔。
6. 檢查內容與來源，按「下載 JSON」保存修改後的資料。

此版本用縮排與連線呈現階層，尚未提供放射式佈局、拖曳或縮放。
GitHub 的檔案預覽不會執行此 HTML；請下載後開啟。目前沒有部署公開網站。

## 檔案用途

| 檔案 | 用途 |
|---|---|
| index.html | 完全本機運作的視覺化介面 |
| schema/knowledge.schema.json | AI 與程式共用的資料規範 |
| prompts/document-to-json.md | 可複製的 AI 提示詞 |
| examples/management.json | 管理學示範資料，非引用你的講義 |

## 資料與限制

- schema_version 固定為 1.0；節點 id 必須唯一。
- 每個節點含 id、label、children，可加 description 與 sources。
- 頁面檢查基本格式、重複 id、20 層與 1000 節點限制；檔案最多 2 MB。
- 頁面不執行貼入的程式碼；節點內容以純文字顯示。
- 本頁不傳送檔案、不連線 AI。交給外部 AI 的原始文件依該服務處理。
- 資料不自動保存，重新整理會回到示範；請下載 JSON。
- 格式檢查不能證明內容正確；必須回到文件核對。

## 後續步驟

先用一份真實講義驗證心智圖，再改進佈局與編輯。流程、關係與數據各自需要相應結構，之後以版本化格式擴充；不把階層資料硬轉成任何圖表。
