# 如何下指令

App 接受結構化 JSON，並不直接理解任意自然語言。可先複製這段給 AI，再貼入對應範例：

```text
你是資料結構整理助手。請把我提供的資料轉成 Visual Canvas 圖表 JSON。
用途：【我要回答的問題／報告對象】
圖表 type：【從範例原樣保留】
資料：【貼上教材、實測數據或任務資料】
規則：只輸出一個 JSON 物件；不要加 Markdown 程式碼框或說明。保留範例的欄位名稱、資料型態與單位。文字用繁體中文。教材沒有的數字、來源、日期不能編造；必要欄位不足時，先問我缺少資料，先不要輸出 JSON。範例中的合成資料須替換。標題指出這張圖要回答的問題。若有 report，圖說寫一句可由數據支持的訊息，source 寫我實際提供的來源。完成後檢查陣列長度、節點引用、日期、時間單位與百分比分母。
下面是必須遵守的 JSON 範例格式：
```

## 依你的課程選架構

| 情境 | 建議架構 | 怎麼問 |
| --- | --- | --- |
| 微積分預習 | 公式圖／概念圖 | 定義→成立條件→公式→範例→反例；保留公式與來源。 |
| 計概 PPT | 心智圖／概念圖／比較矩陣 | 心智圖整理分類；概念圖寫出關係詞；相似名詞用比較矩陣。 |
| 管理學老師題庫 | 提取卡／比較矩陣 | 依老師提供內容整理，先不額外加高難度題；答案要回到題庫來源。 |
| 工業工程報告 | 柏拉圖／流程圖／OEE／產能負荷 | 先列原始數據、單位、觀察期間，再計算；不要只寫结論。 |
| 競賽專題 | SCQA→BMC→TOWS→倒排或 CPM | 先問題與證據，再假設與策略，最後排執行時間。 |
| 學習優先順序 | 四象限 | X=熟悉程度、Y=考試重要程度，各給 0–100 分，並說明評分依據。 |
| 一天安排 | 時間預算→總時間估算 | 給淨可用分鐘、任務分鐘、準備與緩衝，不要把休息算成工作量。 |

## 可複製的完整範例

### 四象限學習圖

```json
{
  "type": "quadrant",
  "title": "四象限學習圖｜學習範例",
  "x_label": "理解程度 →",
  "y_label": "重要程度 ↑",
  "quadrants": [
    "重要但不熟",
    "重要且熟悉",
    "次要且不熟",
    "次要且熟悉"
  ],
  "points": [
    {
      "title": "鏈鎖律",
      "x": 25,
      "y": 90,
      "description": "重要且需要加練。"
    },
    {
      "title": "基本導數",
      "x": 85,
      "y": 85
    },
    {
      "title": "延伸證明",
      "x": 30,
      "y": 25
    }
  ]
}
```

### 概念圖

```json
{
  "type": "concept_map",
  "title": "產能規劃",
  "nodes": [
    {
      "id": "capacity",
      "title": "產能規劃",
      "description": "決定設備、人員與相關資源。"
    },
    {
      "id": "design",
      "title": "設計產能",
      "description": "理想條件下的最大產出率。"
    },
    {
      "id": "effective",
      "title": "有效產能",
      "description": "扣除維修、休息、排程等正常限制。"
    },
    {
      "id": "actual",
      "title": "實際產出",
      "description": "實際達成的產出水準。"
    }
  ],
  "relations": [
    {
      "from": "capacity",
      "to": "design",
      "label": "包含"
    },
    {
      "from": "design",
      "to": "effective",
      "label": "扣除正常限制後"
    },
    {
      "from": "effective",
      "to": "actual",
      "label": "受故障/缺料等影響"
    }
  ]
}
```

### 公式關係圖

```json
{
  "type": "formula_map",
  "title": "產能公式",
  "formulas": [
    {
      "name": "效率 Efficiency",
      "formula": "實際產出 ÷ 有效產能 × 100%",
      "note": "看正常條件下能做到多少。"
    },
    {
      "name": "利用率 Utilization",
      "formula": "實際產出 ÷ 設計產能 × 100%",
      "note": "看理論最大產能用了多少。"
    }
  ]
}
```

### 比較矩陣

```json
{
  "type": "comparison_matrix",
  "title": "四大製程路徑比較",
  "columns": [
    "零工式",
    "批量式",
    "組裝線",
    "連續式"
  ],
  "rows": [
    {
      "label": "產品型態",
      "values": [
        "高度客製",
        "半標準化",
        "標準化",
        "高度標準化"
      ]
    },
    {
      "label": "產量",
      "values": [
        "低",
        "中",
        "高",
        "極高"
      ]
    },
    {
      "label": "彈性",
      "values": [
        "最高",
        "高",
        "低",
        "最低"
      ]
    },
    {
      "label": "生產力",
      "values": [
        "低",
        "中",
        "中高",
        "高"
      ]
    }
  ]
}
```

### 主動提取問答卡

```json
{
  "type": "retrieval_cards",
  "title": "主動提取問答卡｜學習範例",
  "cards": [
    {
      "question": "效率的分母？",
      "answer": "有效產能",
      "hint": "正常可達到的能力。"
    },
    {
      "question": "利用率的分母？",
      "answer": "設計產能",
      "hint": "理論最大能力。"
    },
    {
      "question": "兩者共同的分子？",
      "answer": "實際產出",
      "hint": "實際完成的量。"
    }
  ]
}
```

### PREP 表達架構

```json
{
  "type": "prep_framework",
  "title": "改善備料方式｜PREP 範例",
  "point": "建議先試行定點備料。",
  "reason": "降低作業員尋料與搬運的時間。",
  "example": "合成試驗：每件尋料時間由 45 秒降到 30 秒。",
  "restatement": "先在一個工作站試行，再用時間量測決定是否擴大。"
}
```

### SWOT 分析矩陣

```json
{
  "type": "swot_analysis",
  "title": "學習專題資源｜SWOT 範例",
  "strengths": [
    "具備基礎程式能力",
    "可取得教師指導"
  ],
  "weaknesses": [
    "實驗樣本較少",
    "時間與預算有限"
  ],
  "opportunities": [
    "可參與校內競賽",
    "開源工具降低成本"
  ],
  "threats": [
    "競賽時程可能衝突",
    "資料取得存在不確定性"
  ]
}
```

### 商業模式畫布 BMC

```json
{
  "type": "business_model_canvas",
  "title": "商業模式畫布 BMC｜合成範例",
  "key_partners": [
    "校內合作單位",
    "設備供應商"
  ],
  "key_activities": [
    "需求訪談",
    "原型開發"
  ],
  "key_resources": [
    "開發團隊",
    "測試設備"
  ],
  "value_propositions": [
    "縮短作業等待",
    "提供可追溯紀錄"
  ],
  "customer_relationships": [
    "試用與回饋",
    "持續支援"
  ],
  "channels": [
    "校內試點",
    "合作介紹"
  ],
  "customer_segments": [
    "小型製造工作站"
  ],
  "cost_structure": [
    "設備與開發成本",
    "維護成本"
  ],
  "revenue_streams": [
    "系統建置費",
    "維護服務費"
  ]
}
```

### OEE 設備綜合效率

```json
{
  "type": "oee_calculator",
  "title": "OEE 設備綜合效率｜合成範例",
  "planned_minutes": 480,
  "stop_minutes": 60,
  "ideal_cycle_seconds": 30,
  "total_count": 700,
  "good_count": 665
}
```

### 工作量與總時間估算

```json
{
  "type": "workload_time_estimate",
  "title": "工作量與總時間估算｜合成範例",
  "tasks": [
    {
      "title": "閱讀講義",
      "minutes_each": 25,
      "repetitions": 4
    },
    {
      "title": "解題",
      "minutes_each": 8,
      "repetitions": 12
    },
    {
      "title": "整理報告",
      "minutes_each": 45,
      "repetitions": 1
    }
  ],
  "setup_minutes": 15,
  "buffer_percent": 15
}
```

### 工作日計畫日曆

```json
{
  "type": "workday_calendar_plan",
  "title": "工作日計畫日曆｜合成範例",
  "start_date": "2026-10-09",
  "daily_minutes": 120,
  "workdays": [
    0,
    1,
    2,
    3,
    4
  ],
  "excluded_dates": [
    "2026-10-12"
  ],
  "tasks": [
    {
      "title": "需求訪談整理",
      "minutes": 180
    },
    {
      "title": "原型製作",
      "minutes": 240
    },
    {
      "title": "測試與報告",
      "minutes": 210
    }
  ]
}
```

### 期限倒排日曆

```json
{
  "type": "deadline_backplan",
  "title": "期限倒排日曆｜合成範例",
  "deadline": "2026-10-16",
  "daily_minutes": 120,
  "workdays": [
    0,
    1,
    2,
    3,
    4
  ],
  "excluded_dates": [],
  "tasks": [
    {
      "title": "資料整理",
      "minutes": 180
    },
    {
      "title": "初稿",
      "minutes": 240
    },
    {
      "title": "校對提交",
      "minutes": 60
    }
  ]
}
```

### 關鍵路徑 CPM

```json
{
  "type": "critical_path_plan",
  "title": "關鍵路徑 CPM｜合成範例",
  "tasks": [
    {
      "id": "a",
      "title": "需求確認",
      "duration": 2,
      "depends": []
    },
    {
      "id": "b",
      "title": "原型",
      "duration": 4,
      "depends": [
        "a"
      ]
    },
    {
      "id": "c",
      "title": "資料準備",
      "duration": 2,
      "depends": [
        "a"
      ]
    },
    {
      "id": "d",
      "title": "驗證",
      "duration": 3,
      "depends": [
        "b",
        "c"
      ]
    }
  ],
  "unit": "天"
}
```

### 每日時間預算

```json
{
  "type": "time_budget",
  "title": "每日時間預算｜合成範例",
  "available_minutes": 240,
  "tasks": [
    {
      "title": "課程預習",
      "minutes": 60
    },
    {
      "title": "解題",
      "minutes": 90
    },
    {
      "title": "專題",
      "minutes": 60
    }
  ],
  "reserve_minutes": 30
}
```
