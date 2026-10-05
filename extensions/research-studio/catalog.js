'use strict';
const RESEARCH_CATALOG=[
{id:'errorbar',name:'誤差棒圖',group:'研究與比較',engine:'echarts',purpose:'顯示估計值與已知區間；請在圖說交代 CI、SD 或 SE。',data:{labels:['方法 A','方法 B','方法 C'],estimate:[12,17,14],lower:[10,14,12],upper:[14,20,16]}},
{id:'forest',name:'森林圖',group:'研究與比較',engine:'echarts',purpose:'橫向比較各組估計值與區間；不自動計算統合效果。',data:{labels:['研究 A','研究 B','研究 C'],estimate:[.2,.5,.35],lower:[.05,.2,.1],upper:[.35,.8,.6],reference:0}},
{id:'dumbbell',name:'啞鈴圖',group:'研究與比較',engine:'echarts',purpose:'比较同一群組的前後兩個數值。',data:{labels:['流程 A','流程 B','流程 C'],before:[22,30,18],after:[16,23,14]}},
{id:'control',name:'管制圖',group:'品質與改善',engine:'echarts',purpose:'呈現量測值與你提供的管制界限。界限必須來自適當的製程方法。',data:{labels:['1','2','3','4','5','6'],values:[10,11,9,13,10,8],center:10,lcl:7,ucl:12}},
{id:'pareto',name:'柏拉圖',group:'品質與改善',engine:'echarts',purpose:'自動由大到小排列非負次數，計算累積百分比。',data:{labels:['等待','搬運','重工','停機'],values:[18,8,12,5]}},
{id:'network',name:'知識關係網',group:'知識與結構',engine:'echarts',purpose:'呈現概念的交叉關係；拖曳節點探索網絡。連線不代表因果證據。',data:{nodes:[{id:'a',name:'極限'},{id:'b',name:'導數'},{id:'c',name:'積分'},{id:'d',name:'最佳化'}],links:[{source:'a',target:'b'},{source:'a',target:'c'},{source:'b',target:'d'}]}},
{id:'tree',name:'階層樹圖',group:'知識與結構',engine:'echarts',purpose:'呈現分類與階層；不代表統計分群的樹狀圖。',data:{root:{name:'研究計畫',children:[{name:'問題定義',children:[{name:'文獻整理'},{name:'研究假設'}]},{name:'方法設計',children:[{name:'資料蒐集'},{name:'分析計畫'}]}]}}},
{id:'calendar',name:'日曆熱力圖',group:'學習與時間',engine:'echarts',purpose:'依日期比較學習量或觀測值；沒有資料的日期不自動補零。',data:{range:'2026-10',values:[['2026-10-01',60],['2026-10-02',90],['2026-10-03',30],['2026-10-04',120],['2026-10-05',80]]}},
{id:'flowchart',name:'流程圖',group:'流程與系統',engine:'mermaid',purpose:'描述步驟、判斷與迴圈。',data:{code:'flowchart TD\n A[提出研究問題] --> B[蒐集資料]\n B --> C{資料足夠？}\n C -->|是| D[分析與解釋]\n C -->|否| B\n D --> E[撰寫報告]'}},
{id:'sequence',name:'循序圖',group:'流程與系統',engine:'mermaid',purpose:'呈現多方角色按時間順序交換訊息。',data:{code:'sequenceDiagram\n participant S as 學生\n participant T as 教師\n participant L as 實驗室\n S->>T: 提出研究問題\n T->>L: 確認資源\n L-->>S: 提供資料\n S->>T: 回報分析結果'}},
{id:'gantt',name:'甘特圖',group:'學習與時間',engine:'mermaid',purpose:'規劃研究任務、日期與相依關係。',data:{code:'gantt\n dateFormat YYYY-MM-DD\n section 研究規劃\n 文獻閱讀 :a, 2026-10-01, 7d\n 方法設計 :b, after a, 5d\n section 執行\n 資料蒐集 :c, after b, 7d\n 報告撰寫 :after c, 5d'}},
{id:'state',name:'狀態圖',group:'流程與系統',engine:'mermaid',purpose:'描述系統狀態與轉換條件。',data:{code:'stateDiagram-v2\n [*] --> Draft\n Draft --> Review: 提交\n Review --> Draft: 修改\n Review --> Published: 通過\n Published --> [*]'}},
{id:'class',name:'類別圖',group:'流程與系統',engine:'mermaid',purpose:'整理物件的屬性、方法與關係。',data:{code:'classDiagram\n class Study {\n +String title\n +analyze()\n }\n class Observation {\n +float value\n }\n Study "1" --> "many" Observation : contains'}},
{id:'er',name:'實體關係圖',group:'流程與系統',engine:'mermaid',purpose:'規劃資料庫的實體、欄位與關聯。',data:{code:'erDiagram\n STUDY ||--o{ OBSERVATION : contains\n STUDY {\n int id PK\n string title\n }\n OBSERVATION {\n int id PK\n int study_id FK\n float value\n }'}}
];
function researchExample(id){const item=RESEARCH_CATALOG.find(x=>x.id===id);if(!item)throw Error('未知架構');const teaching=id==='concept';return {version:'1.0',type:id,title:teaching?'概念圖教學範例｜定義、比較、SOP 與因果鏈':item.name+'｜合成範例',subtitle:teaching?'節點＋箭頭＋關係詞組成命題；圖中包含心智圖比較與暖化示例。':'示範資料，請替換為真實資料',x_label:'',y_label:'',caption:teaching?'概念圖著重節點之間的關係詞。暖化因果鏈為示意，請依資料與來源確認。':'圖 1. 請補充研究情境、樣本數與計算方式。',source:teaching?'來源：依使用者提供的概念圖筆記整理；請補入原始文獻或課程講義頁碼。':'資料來源：合成示範，非實證研究。',data:structuredClone(item.data)};}
