# 文件轉知識樹提示詞

將以下文件整理成符合 schema/knowledge.schema.json 的 JSON 心智圖資料。
只輸出 JSON，不加 Markdown 程式碼圍欄或解說。

規則：
1. schema_version 固定為 "1.0"；頂層只有 schema_version、title、root。
2. 每個節點需要唯一 id、簡短 label、children 陣列；葉節點 children 為 []。
3. description 放定義、解釋或範例。保留重要概念間的階層，避免把全文放進節點標題。
4. sources 為 [{"document":"文件名稱","location":"頁碼或章節"}]。不知道頁碼就寫章節；無法確認的位置寫「位置未確認」，不可捏造來源。
5. 忠於提供的文件。缺少的內容不要自行補成事實；不把猜測標成考試重點。
6. 每次處理一章，建議 3–5 層、最多 80 個節點。較長文件先分章。
7. 輸出前檢查 JSON 語法、id 唯一、每個節點都有 children。

格式範例：
{"schema_version":"1.0","title":"主題","root":{"id":"root","label":"主題","description":"說明","sources":[],"children":[]}}

下面是文件內容：
【貼上內容，或搭配上傳文件使用】
