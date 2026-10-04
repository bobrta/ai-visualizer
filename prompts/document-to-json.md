# AI 產生 App 指令

請把我提供的文件整理成 Mind Canvas 可讀取的指令。只輸出合法 JSON，不加程式碼圍欄或其他解說。

頂層格式：
{"type":"mindmap","title":"主題","branches":[{"title":"分支","description":"說明","sources":[{"document":"檔名","location":"頁碼或章節"}],"children":[{"title":"子概念"}]}]}

要求：
- type 固定為 mindmap。title 是中央主題；branches 是主要分支陣列。
- 每個節點需要簡短 title（建議 12 字內）；可以有 children、description、sources。
- 葉節點可以省略 children，或設為 []。
- 建議 3–5 層，單章不超過 80 節點。不要把全文塞進標題。
- description 用於定義、原因、例子；內容忠於文件，不自行編造。
- sources 記錄文件與頁碼或章節，位置不明就標示「位置未確認」。
- 重要概念完整保留，重複內容合併；無根據的考試重點不要標示。

以下是文件內容：
【貼上內容，或搭配上傳文件使用】
