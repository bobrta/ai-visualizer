# Mind Canvas｜指令轉心智圖

v0.2：貼入 JSON 指令，按「產生心智圖」，直接顯示中央主題、左右彩色分支與曲線連接。

## 開啟 App

Code → Download ZIP，解壓縮後用瀏覽器開啟 index.html。GitHub 檔案預覽不會執行網頁，目前尚未部署網站。

## 輸入格式

```json
{"type":"mindmap","title":"主題","branches":[{"title":"第一分支","children":[{"title":"子概念"}]},{"title":"第二分支"}]}
```

只需貼上這種指令並按「產生」。節點可加 description 與 sources（document、location）。原本 schema_version 1.0 的 root/label 格式仍可讀取；schema/knowledge.schema.json 描述的是舊版格式。

## 操作

- 拖曳空白處移動畫布；滾輪縮放，也可按 ＋／−。
- 適合畫面：將整張圖置中。
- 點節點查看說明與來源，雙擊修改文字。
- 點分支旁 −／+ 收合或展開；也可使用工具列全部展開。
- 儲存指令下載 JSON；匯出 SVG 圖片保存目前可見分支。
- 隱藏輸入區以擴大畫布。

頁面本機運作，不需要 API、不上傳輸入資料。未自動保存，關閉前請儲存。限制 15 層、500 節點與 2 MB。文字以純文字顯示，不執行輸入程式碼。

## 驗證與目前範圍

已通過 JavaScript 語法檢查、新舊輸入格式與錯誤 children 測試。開發環境缺少瀏覽器執行檔，尚未完成實際畫面互動驗證。

目前提供心智圖；Excel 風格資料表與數據圖、節點自由拖曳、PNG 與 XMind 檔案匯出尚未提供。
