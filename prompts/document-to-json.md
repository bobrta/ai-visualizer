# AI 產生 Visual Canvas 指令

把下面這份文件／資料轉成 Visual Canvas 可讀取的 JSON 指令。只輸出合法 JSON，不加 Markdown 圍欄或解說。
請參照 CHART_FORMATS.md 選用一種圖形格式。type 決定圖形；title 為圖形標題。

規則：
1. 概念階層選 mindmap，時間序列選 line，分類比較選 bar，流程中的流量選 sankey。3D 僅在資料具有三個維度且適合時使用。
2. 忠於來源，不編造數據。若文件沒有數值資料，不要為了畫數據圖捏造數值；改用心智圖或告知缺少哪些數據。
3. 同一個指令只產生一張圖；所有對應陣列長度一致。缺少值不可任意補零。
4. 心智圖格式：{"type":"mindmap","title":"主題","branches":[{"title":"分支","description":"說明","sources":[{"document":"檔名","location":"頁碼或章節"}],"children":[{"title":"子概念"}]}]}。建議 3–5 層，單章不超過 80 節點。
5. 折線圖格式：{"type":"line","title":"標題","x":["一月","二月"],"y":[12,18],"x_title":"月份","y_title":"數量"}。
6. 3D 曲面格式：{"type":"surface","title":"標題","x":[0,1],"y":[0,1],"z":[[1,2],[3,4]]}。z 的列對應 y、欄對應 x。
7. 其他類型必須依 CHART_FORMATS.md，不能只修改 type 而保留不相容資料。

我希望的圖形：【填入類型，或讓 AI 建議】
來源內容：【貼上資料或附文件】
