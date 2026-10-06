# 100 種指令格式

App 選擇類型後按「範例」即可載入對應指令。不要把整份 charts-100.json 一次貼入；它是範例目錄，請取其中一個物件。所有數值必須為有限數字，相關陣列長度必須一致。

## 心智圖 (`mindmap`)

```json
{
  "type": "mindmap",
  "title": "我的學習系統",
  "branches": [
    {
      "title": "課前",
      "children": [
        {
          "title": "閱讀講義"
        },
        {
          "title": "整理問題"
        }
      ]
    },
    {
      "title": "課後",
      "children": [
        {
          "title": "練習"
        },
        {
          "title": "複習"
        }
      ]
    }
  ]
}
```

## 折線圖 (`line`)

```json
{
  "type": "line",
  "title": "折線圖｜示範資料",
  "x": [
    "一月",
    "二月",
    "三月",
    "四月"
  ],
  "y": [
    12,
    18,
    15,
    24
  ],
  "x_title": "月份",
  "y_title": "數量"
}
```

## 長條圖 (`bar`)

```json
{
  "type": "bar",
  "title": "長條圖｜示範資料",
  "x": [
    "一月",
    "二月",
    "三月",
    "四月"
  ],
  "y": [
    12,
    18,
    15,
    24
  ],
  "x_title": "月份",
  "y_title": "數量"
}
```

## 群組長條圖 (`grouped_bar`)

```json
{
  "type": "grouped_bar",
  "title": "群組長條圖｜示範資料",
  "series": [
    {
      "name": "甲組",
      "x": [
        "一月",
        "二月",
        "三月",
        "四月"
      ],
      "y": [
        12,
        18,
        15,
        24
      ]
    },
    {
      "name": "乙組",
      "x": [
        "一月",
        "二月",
        "三月",
        "四月"
      ],
      "y": [
        8,
        13,
        11,
        19
      ]
    }
  ]
}
```

## 堆疊長條圖 (`stacked_bar`)

```json
{
  "type": "stacked_bar",
  "title": "堆疊長條圖｜示範資料",
  "series": [
    {
      "name": "甲組",
      "x": [
        "一月",
        "二月",
        "三月",
        "四月"
      ],
      "y": [
        12,
        18,
        15,
        24
      ]
    },
    {
      "name": "乙組",
      "x": [
        "一月",
        "二月",
        "三月",
        "四月"
      ],
      "y": [
        8,
        13,
        11,
        19
      ]
    }
  ]
}
```

## 面積圖 (`area`)

```json
{
  "type": "area",
  "title": "面積圖｜示範資料",
  "x": [
    "一月",
    "二月",
    "三月",
    "四月"
  ],
  "y": [
    12,
    18,
    15,
    24
  ],
  "x_title": "月份",
  "y_title": "數量"
}
```

## 堆疊面積圖 (`stacked_area`)

```json
{
  "type": "stacked_area",
  "title": "堆疊面積圖｜示範資料",
  "series": [
    {
      "name": "甲組",
      "x": [
        "一月",
        "二月",
        "三月",
        "四月"
      ],
      "y": [
        12,
        18,
        15,
        24
      ]
    },
    {
      "name": "乙組",
      "x": [
        "一月",
        "二月",
        "三月",
        "四月"
      ],
      "y": [
        8,
        13,
        11,
        19
      ]
    }
  ]
}
```

## 散佈圖 (`scatter`)

```json
{
  "type": "scatter",
  "title": "散佈圖｜示範資料",
  "x": [
    1,
    2,
    3,
    4,
    5
  ],
  "y": [
    3,
    5,
    4,
    8,
    10
  ]
}
```

## 氣泡圖 (`bubble`)

```json
{
  "type": "bubble",
  "title": "氣泡圖｜示範資料",
  "x": [
    1,
    2,
    3,
    4,
    5
  ],
  "y": [
    3,
    5,
    4,
    8,
    10
  ],
  "size": [
    10,
    25,
    15,
    40,
    30
  ]
}
```

## 圓餅圖 (`pie`)

```json
{
  "type": "pie",
  "title": "圓餅圖｜示範資料",
  "labels": [
    "甲",
    "乙",
    "丙",
    "丁"
  ],
  "values": [
    40,
    30,
    20,
    10
  ]
}
```

## 環圈圖 (`donut`)

```json
{
  "type": "donut",
  "title": "環圈圖｜示範資料",
  "labels": [
    "甲",
    "乙",
    "丙",
    "丁"
  ],
  "values": [
    40,
    30,
    20,
    10
  ]
}
```

## 直方圖 (`histogram`)

```json
{
  "type": "histogram",
  "title": "直方圖｜示範資料",
  "values": [
    12,
    13,
    14,
    14,
    15,
    15,
    15,
    16,
    17,
    18,
    18,
    20,
    25
  ]
}
```

## 箱形圖 (`box`)

```json
{
  "type": "box",
  "title": "箱形圖｜示範資料",
  "values": [
    12,
    13,
    14,
    14,
    15,
    15,
    15,
    16,
    17,
    18,
    18,
    20,
    25
  ]
}
```

## 小提琴圖 (`violin`)

```json
{
  "type": "violin",
  "title": "小提琴圖｜示範資料",
  "values": [
    12,
    13,
    14,
    14,
    15,
    15,
    15,
    16,
    17,
    18,
    18,
    20,
    25
  ]
}
```

## 熱力圖 (`heatmap`)

```json
{
  "type": "heatmap",
  "title": "熱力圖｜示範資料",
  "x": [
    0,
    1,
    2,
    3
  ],
  "y": [
    0,
    1,
    2,
    3
  ],
  "z": [
    [
      1,
      2,
      3,
      2
    ],
    [
      2,
      4,
      6,
      3
    ],
    [
      3,
      6,
      9,
      5
    ],
    [
      2,
      3,
      5,
      3
    ]
  ]
}
```

## 等高線圖 (`contour`)

```json
{
  "type": "contour",
  "title": "等高線圖｜示範資料",
  "x": [
    0,
    1,
    2,
    3
  ],
  "y": [
    0,
    1,
    2,
    3
  ],
  "z": [
    [
      1,
      2,
      3,
      2
    ],
    [
      2,
      4,
      6,
      3
    ],
    [
      3,
      6,
      9,
      5
    ],
    [
      2,
      3,
      5,
      3
    ]
  ]
}
```

## 3D 散佈圖 (`scatter3d`)

```json
{
  "type": "scatter3d",
  "title": "3D 散佈圖｜示範資料",
  "x": [
    0,
    1,
    2,
    3
  ],
  "y": [
    0,
    1,
    0,
    1
  ],
  "z": [
    2,
    5,
    3,
    7
  ]
}
```

## 3D 折線圖 (`line3d`)

```json
{
  "type": "line3d",
  "title": "3D 折線圖｜示範資料",
  "x": [
    0,
    1,
    2,
    3
  ],
  "y": [
    0,
    1,
    0,
    1
  ],
  "z": [
    2,
    5,
    3,
    7
  ]
}
```

## 3D 曲面圖 (`surface`)

```json
{
  "type": "surface",
  "title": "3D 曲面圖｜示範資料",
  "x": [
    0,
    1,
    2,
    3
  ],
  "y": [
    0,
    1,
    2,
    3
  ],
  "z": [
    [
      1,
      2,
      3,
      2
    ],
    [
      2,
      4,
      6,
      3
    ],
    [
      3,
      6,
      9,
      5
    ],
    [
      2,
      3,
      5,
      3
    ]
  ]
}
```

## 3D 長條圖 (`bar3d`)

```json
{
  "type": "bar3d",
  "title": "3D 長條圖｜示範資料",
  "x": [
    0,
    1,
    2,
    3
  ],
  "y": [
    0,
    1,
    0,
    1
  ],
  "z": [
    2,
    5,
    3,
    7
  ]
}
```

## 瀑布圖 (`waterfall`)

```json
{
  "type": "waterfall",
  "title": "瀑布圖｜示範資料",
  "labels": [
    "期初",
    "收入",
    "支出",
    "期末"
  ],
  "values": [
    100,
    60,
    -30,
    0
  ],
  "measure": [
    "absolute",
    "relative",
    "relative",
    "total"
  ]
}
```

## 漏斗圖 (`funnel`)

```json
{
  "type": "funnel",
  "title": "漏斗圖｜示範資料",
  "labels": [
    "甲",
    "乙",
    "丙",
    "丁"
  ],
  "values": [
    40,
    30,
    20,
    10
  ]
}
```

## 雷達圖 (`radar`)

```json
{
  "type": "radar",
  "title": "雷達圖｜示範資料",
  "theta": [
    "理解",
    "記憶",
    "應用",
    "表達",
    "解題"
  ],
  "r": [
    7,
    8,
    6,
    9,
    7
  ]
}
```

## 極座標圖 (`polar`)

```json
{
  "type": "polar",
  "title": "極座標圖｜示範資料",
  "theta": [
    0,
    60,
    120,
    180,
    240,
    300
  ],
  "r": [
    3,
    5,
    4,
    6,
    4,
    5
  ]
}
```

## 矩形樹圖 (`treemap`)

```json
{
  "type": "treemap",
  "title": "矩形樹圖｜示範資料",
  "ids": [
    "root",
    "a",
    "b",
    "a1",
    "a2"
  ],
  "labels": [
    "主題",
    "分支甲",
    "分支乙",
    "子甲",
    "子乙"
  ],
  "parents": [
    "",
    "root",
    "root",
    "a",
    "a"
  ],
  "values": [
    0,
    0,
    6,
    4,
    5
  ]
}
```

## 旭日圖 (`sunburst`)

```json
{
  "type": "sunburst",
  "title": "旭日圖｜示範資料",
  "ids": [
    "root",
    "a",
    "b",
    "a1",
    "a2"
  ],
  "labels": [
    "主題",
    "分支甲",
    "分支乙",
    "子甲",
    "子乙"
  ],
  "parents": [
    "",
    "root",
    "root",
    "a",
    "a"
  ],
  "values": [
    0,
    0,
    6,
    4,
    5
  ]
}
```

## 桑基圖 (`sankey`)

```json
{
  "type": "sankey",
  "title": "桑基圖｜示範資料",
  "labels": [
    "原料",
    "加工",
    "產品",
    "損耗"
  ],
  "source": [
    0,
    1,
    1
  ],
  "target": [
    1,
    2,
    3
  ],
  "values": [
    10,
    8,
    2
  ]
}
```

## 平行座標圖 (`parallel`)

```json
{
  "type": "parallel",
  "title": "平行座標圖｜示範資料",
  "dimensions": [
    {
      "label": "成本",
      "values": [
        10,
        15,
        12,
        18
      ]
    },
    {
      "label": "品質",
      "values": [
        80,
        95,
        85,
        90
      ]
    },
    {
      "label": "速度",
      "values": [
        5,
        3,
        4,
        2
      ]
    }
  ]
}
```

## K 線圖 (`candlestick`)

```json
{
  "type": "candlestick",
  "title": "K 線圖｜示範資料",
  "x": [
    "2026-01-01",
    "2026-01-02",
    "2026-01-03"
  ],
  "open": [
    10,
    12,
    11
  ],
  "high": [
    14,
    15,
    14
  ],
  "low": [
    9,
    10,
    10
  ],
  "close": [
    12,
    11,
    13
  ]
}
```

## 資料表 (`table`)

```json
{
  "type": "table",
  "title": "資料表｜示範資料",
  "headers": [
    "品項",
    "數量",
    "成本"
  ],
  "rows": [
    [
      "甲",
      12,
      100
    ],
    [
      "乙",
      18,
      150
    ],
    [
      "丙",
      15,
      120
    ]
  ]
}
```

## 注意

- 3D 長條圖 x/y 是位置，z 是長條高度，基準為 0；可加 width 設定底面寬度。
- surface/contour 的 x/y 是數字座標；z 是列對應 y、欄對應 x 的矩陣。
- treemap/sunburst 的 values 使用 remainder 模式：父節點值是未分配給子節點的額外值，單純分類容器請填 0。
- 桑基圖 source/target 使用從 0 起算的節點索引，values 是流量。
- 直方、箱形與小提琴圖應輸入原始觀測值，而非彙總平均數。
- 3D 圖可用滑鼠旋轉視角，需瀏覽器支援 WebGL。
- 雷達圖各指標需有可比較的尺度；本程式不會自動標準化。



# 新增 20 種學習圖（31–50）

全部在同一主工作台使用，直接貼入單一 JSON 即可。複雜欄位請保留陣列或物件結構。

## 概念圖 (`concept_map`)

用途：概念＋關係詞。

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

## 因果鏈 (`cause_chain`)

用途：原因 → 結果。

```json
{
  "type": "cause_chain",
  "title": "SMED 與大量客製化",
  "steps": [
    {
      "title": "產品多樣性提高",
      "description": "需要更高生產彈性。"
    },
    {
      "title": "換線需求增加",
      "description": "改機與換線造成產能損失。"
    },
    {
      "title": "導入 SMED",
      "description": "縮短整備/換模時間。"
    },
    {
      "title": "產能損失下降",
      "description": "利用率與生產力提升。"
    },
    {
      "title": "大量客製化",
      "description": "兼顧彈性與較高效率。"
    }
  ]
}
```

## 決策樹 (`decision_tree`)

用途：Yes / No 判斷。

```json
{
  "type": "decision_tree",
  "title": "自製或外購",
  "root": {
    "title": "此零件買得到嗎？",
    "description": "先判斷供應市場。",
    "yes": {
      "title": "能自製嗎？",
      "yes": {
        "title": "自製比外購便宜嗎？",
        "yes": {
          "title": "有足夠資金嗎？",
          "yes": {
            "title": "自製"
          },
          "no": {
            "title": "外購"
          }
        },
        "no": {
          "title": "外購"
        }
      },
      "no": {
        "title": "外購"
      }
    },
    "no": {
      "title": "自製"
    }
  }
}
```

## 比較矩陣 (`comparison_matrix`)

用途：多方案並排比較。

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

## 流程圖 (`process_flow`)

用途：步驟與 SOP。

```json
{
  "type": "process_flow",
  "title": "生產系統設計流程",
  "steps": [
    {
      "title": "產品設計"
    },
    {
      "title": "製程規劃"
    },
    {
      "title": "自製或外購"
    },
    {
      "title": "產能規劃"
    },
    {
      "title": "製程路徑"
    },
    {
      "title": "佈置設計"
    },
    {
      "title": "工作站設計"
    }
  ]
}
```

## 公式關係圖 (`formula_map`)

用途：公式＋變數＋易錯點。

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

## 層級分類圖 (`hierarchy_map`)

用途：分類與階層。

```json
{
  "type": "hierarchy_map",
  "title": "設施佈置類型",
  "root": {
    "title": "設施佈置",
    "children": [
      {
        "title": "固定位置佈置",
        "description": "產品不動，資源移動。"
      },
      {
        "title": "產品別佈置",
        "description": "依產品流程排列。"
      },
      {
        "title": "製程別佈置",
        "description": "相同功能設備集中。"
      },
      {
        "title": "群組/單元佈置",
        "description": "相似產品族集中成 cell。"
      }
    ]
  }
}
```

## 考前總覽 (`exam_overview`)

用途：一頁濃縮重點。

```json
{
  "type": "exam_overview",
  "title": "第2章考前總覽",
  "sections": [
    {
      "title": "核心概念",
      "items": [
        "設計資訊轉寫",
        "VA / NVA",
        "QCD"
      ]
    },
    {
      "title": "必背公式",
      "items": [
        "效率 = 實際產出 / 有效產能",
        "利用率 = 實際產出 / 設計產能"
      ]
    },
    {
      "title": "製程比較",
      "items": [
        "Job Shop → Batch → Assembly → Continuous"
      ]
    },
    {
      "title": "佈置與 SLP",
      "items": [
        "PQRST",
        "From-To",
        "AEIOUX",
        "SLP 11步"
      ]
    }
  ]
}
```

## 魚骨原因圖 (`fishbone`)

用途：問題結果與原因分類。

```json
{
  "type": "fishbone",
  "title": "魚骨原因圖｜學習範例",
  "effect": "準備考試不足",
  "categories": [
    {
      "title": "方法",
      "causes": [
        "只看不練",
        "缺少回想"
      ]
    },
    {
      "title": "材料",
      "causes": [
        "題庫未整理",
        "來源分散"
      ]
    },
    {
      "title": "時間",
      "causes": [
        "未排複習",
        "睡眠不足"
      ]
    },
    {
      "title": "回饋",
      "causes": [
        "未分析錯題",
        "未問老師"
      ]
    }
  ]
}
```

## 集合重疊圖 (`venn`)

用途：兩集合、交集與差集。

```json
{
  "type": "venn",
  "title": "集合重疊圖｜學習範例",
  "sets": [
    {
      "title": "效率",
      "items": [
        "有效產能作分母"
      ]
    },
    {
      "title": "利用率",
      "items": [
        "設計產能作分母"
      ]
    }
  ],
  "intersection": [
    "實際產出作分子",
    "比較產能使用"
  ]
}
```

## 四象限學習圖 (`quadrant`)

用途：兩條軸定位學習項目。

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

## 事件時間軸 (`timeline`)

用途：日期與事件的先後。

```json
{
  "type": "timeline",
  "title": "事件時間軸｜學習範例",
  "events": [
    {
      "date": "第一週",
      "title": "極限",
      "description": "先辨認極限的意義。"
    },
    {
      "date": "第二週",
      "title": "連續",
      "description": "整理連續的條件。"
    },
    {
      "date": "第三週",
      "title": "導數"
    },
    {
      "date": "第四週",
      "title": "導數應用"
    }
  ]
}
```

## 循環學習圖 (`cycle_map`)

用途：重複流程與回饋循環。

```json
{
  "type": "cycle_map",
  "title": "循環學習圖｜學習範例",
  "steps": [
    {
      "title": "課前預習",
      "description": ""
    },
    {
      "title": "上課補充",
      "description": ""
    },
    {
      "title": "主動回想",
      "description": ""
    },
    {
      "title": "獨立解題",
      "description": ""
    },
    {
      "title": "分析錯誤",
      "description": ""
    },
    {
      "title": "調整複習",
      "description": ""
    }
  ]
}
```

## 層級金字塔 (`pyramid`)

用途：結論到細節的層級。

```json
{
  "type": "pyramid",
  "title": "層級金字塔｜學習範例",
  "levels": [
    {
      "title": "核心結論",
      "items": [
        "以需求決定產能"
      ]
    },
    {
      "title": "主要理由",
      "items": [
        "需求量",
        "資源限制"
      ]
    },
    {
      "title": "支持資料",
      "items": [
        "預測結果",
        "設備能力",
        "成本條件"
      ]
    }
  ]
}
```

## 康乃爾筆記圖 (`cornell_notes`)

用途：提示欄、內容欄與摘要。

```json
{
  "type": "cornell_notes",
  "title": "康乃爾筆記圖｜學習範例",
  "cues": [
    "什麼是導數？",
    "斜率如何解讀？",
    "單位是什麼？"
  ],
  "notes": [
    "導數描述局部變化率。",
    "切線斜率由差商極限得到。",
    "單位是輸出量除以輸入量。"
  ],
  "summary": "用自己的話說：導數回答「此刻變化有多快」。"
}
```

## KWL 知識盤點 (`kwl`)

用途：已知、想知道、學到了。

```json
{
  "type": "kwl",
  "title": "KWL 知識盤點｜學習範例",
  "columns": [
    {
      "title": "K｜我已知道",
      "items": [
        "斜率是變化量比值"
      ]
    },
    {
      "title": "W｜我想知道",
      "items": [
        "曲線某一點如何求斜率？"
      ]
    },
    {
      "title": "L｜我學到了",
      "items": [
        "用差商的極限定義導數"
      ]
    }
  ]
}
```

## 主動提取問答卡 (`retrieval_cards`)

用途：先回答，再點卡片看答案。

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

## 間隔複習排程 (`spaced_repetition`)

用途：以自訂天數安排回想。

```json
{
  "type": "spaced_repetition",
  "title": "間隔複習排程｜學習範例",
  "topics": [
    {
      "title": "極限",
      "days": [
        0,
        1,
        3,
        7,
        14
      ]
    },
    {
      "title": "導數",
      "days": [
        0,
        2,
        5,
        10,
        20
      ]
    },
    {
      "title": "積分",
      "days": [
        1,
        3,
        7,
        14,
        21
      ]
    }
  ],
  "note": "範例天數可自訂；依回想結果調整，不代表最佳間隔。"
}
```

## 學習甘特圖 (`study_gantt`)

用途：任務起點、天數與重疊。

```json
{
  "type": "study_gantt",
  "title": "學習甘特圖｜學習範例",
  "tasks": [
    {
      "title": "預習極限",
      "start": 0,
      "duration": 2
    },
    {
      "title": "獨立解題",
      "start": 2,
      "duration": 3
    },
    {
      "title": "整理錯題",
      "start": 4,
      "duration": 2
    },
    {
      "title": "混合練習",
      "start": 6,
      "duration": 3
    }
  ],
  "unit": "天"
}
```

## 論證結構圖 (`argument_map`)

用途：結論、理由、證據與反駁。

```json
{
  "type": "argument_map",
  "title": "論證結構圖｜學習範例",
  "root": {
    "title": "採用單元佈置",
    "description": "待驗證的提案。",
    "children": [
      {
        "title": "減少搬運",
        "relation": "支持",
        "children": [
          {
            "title": "量測搬運距離",
            "description": "需補真實量測資料。"
          }
        ]
      },
      {
        "title": "提升彈性",
        "relation": "支持"
      },
      {
        "title": "改造成本高",
        "relation": "反駁",
        "children": [
          {
            "title": "分期導入",
            "description": "回應反駁的方案。"
          }
        ]
      }
    ]
  }
}
```

新增圖表的驗證規則與操作限制，見 [學習圖表說明](extensions/learning-charts/README.md)。

# 流程與時間圖（51–70）

## 51. 分工泳道圖｜學習範例

```json
{
  "type": "swimlane",
  "title": "分工泳道圖｜學習範例",
  "lanes": [
    "學生",
    "工具",
    "老師"
  ],
  "steps": [
    {
      "id": "a",
      "title": "預習",
      "lane": 0
    },
    {
      "id": "b",
      "title": "整理知識圖",
      "lane": 1
    },
    {
      "id": "c",
      "title": "解題找卡點",
      "lane": 0
    },
    {
      "id": "d",
      "title": "釐清疑問",
      "lane": 2
    },
    {
      "id": "e",
      "title": "回想與修正",
      "lane": 0
    }
  ],
  "links": [
    {
      "from": "a",
      "to": "b"
    },
    {
      "from": "b",
      "to": "c"
    },
    {
      "from": "c",
      "to": "d"
    },
    {
      "from": "d",
      "to": "e"
    }
  ]
}
```

## 52. 互動循序圖｜學習範例

```json
{
  "type": "sequence_diagram",
  "title": "互動循序圖｜學習範例",
  "participants": [
    "學生",
    "工具",
    "老師"
  ],
  "messages": [
    {
      "from": 0,
      "to": 1,
      "text": "整理講義"
    },
    {
      "from": 1,
      "to": 0,
      "text": "呈現結構"
    },
    {
      "from": 0,
      "to": 2,
      "text": "詢問疑問"
    },
    {
      "from": 2,
      "to": 0,
      "text": "說明與示例"
    }
  ]
}
```

## 53. 狀態轉移圖｜學習範例

```json
{
  "type": "state_machine",
  "title": "狀態轉移圖｜學習範例",
  "nodes": [
    {
      "id": "a",
      "title": "待學"
    },
    {
      "id": "b",
      "title": "練習中"
    },
    {
      "id": "c",
      "title": "需複習"
    },
    {
      "id": "d",
      "title": "能獨立解題"
    }
  ],
  "relations": [
    {
      "from": "a",
      "to": "b",
      "label": "開始"
    },
    {
      "from": "b",
      "to": "c",
      "label": "未通過"
    },
    {
      "from": "c",
      "to": "b",
      "label": "補強"
    },
    {
      "from": "b",
      "to": "d",
      "label": "通過"
    },
    {
      "from": "d",
      "to": "c",
      "label": "回想失敗"
    }
  ]
}
```

## 54. 多分支流程圖｜學習範例

```json
{
  "type": "branching_flow",
  "title": "多分支流程圖｜學習範例",
  "nodes": [
    {
      "id": "a",
      "title": "辨認題型",
      "level": 0
    },
    {
      "id": "b",
      "title": "基本導數",
      "level": 1
    },
    {
      "id": "c",
      "title": "鏈鎖律",
      "level": 1
    },
    {
      "id": "d",
      "title": "乘積律",
      "level": 1
    },
    {
      "id": "e",
      "title": "檢查答案",
      "level": 2
    }
  ],
  "relations": [
    {
      "from": "a",
      "to": "b",
      "label": "單一函數"
    },
    {
      "from": "a",
      "to": "c",
      "label": "複合函數"
    },
    {
      "from": "a",
      "to": "d",
      "label": "函數相乘"
    },
    {
      "from": "b",
      "to": "e",
      "label": "計算後"
    },
    {
      "from": "c",
      "to": "e",
      "label": "計算後"
    },
    {
      "from": "d",
      "to": "e",
      "label": "計算後"
    }
  ]
}
```

## 55. 並行流程圖｜學習範例

```json
{
  "type": "parallel_flow",
  "title": "並行流程圖｜學習範例",
  "stages": [
    {
      "title": "開始整理",
      "tasks": [
        "確認章節目標"
      ]
    },
    {
      "title": "分組處理",
      "tasks": [
        "整理定義",
        "整理例題",
        "整理錯題"
      ]
    },
    {
      "title": "合併成果",
      "tasks": [
        "交叉檢查來源"
      ]
    },
    {
      "title": "完成",
      "tasks": [
        "回想測驗"
      ]
    }
  ]
}
```

## 56. 迴圈檢核流程｜學習範例

```json
{
  "type": "loop_flow",
  "title": "迴圈檢核流程｜學習範例",
  "steps": [
    {
      "title": "閱讀題目"
    },
    {
      "title": "獨立解題"
    },
    {
      "title": "檢查答案"
    },
    {
      "title": "紀錄解法"
    }
  ],
  "repeat_from": 2,
  "repeat_to": 1,
  "repeat_label": "未通過：補強後再試"
}
```

## 57. 輸入－處理－輸出圖｜學習範例

```json
{
  "type": "input_output_flow",
  "title": "輸入－處理－輸出圖｜學習範例",
  "inputs": [
    "講義",
    "課本例題",
    "課堂疑問"
  ],
  "process": "整理、解釋與獨立練習",
  "outputs": [
    "知識圖",
    "錯題清單",
    "自己的解釋"
  ]
}
```

## 58. 學習資料流圖｜學習範例

```json
{
  "type": "data_flow",
  "title": "學習資料流圖｜學習範例",
  "entities": [
    {
      "id": "a",
      "title": "課本"
    },
    {
      "id": "b",
      "title": "老師"
    }
  ],
  "processes": [
    {
      "id": "c",
      "title": "整理重點"
    },
    {
      "id": "d",
      "title": "檢查理解"
    }
  ],
  "stores": [
    {
      "id": "e",
      "title": "知識單元"
    },
    {
      "id": "f",
      "title": "錯題紀錄"
    }
  ],
  "flows": [
    {
      "from": "a",
      "to": "c",
      "label": "章節內容"
    },
    {
      "from": "b",
      "to": "d",
      "label": "回饋"
    },
    {
      "from": "c",
      "to": "e",
      "label": "結構筆記"
    },
    {
      "from": "e",
      "to": "d",
      "label": "提取題目"
    },
    {
      "from": "d",
      "to": "f",
      "label": "錯誤與修正"
    }
  ]
}
```

## 59. 學習篩選流程｜學習範例

```json
{
  "type": "funnel_process",
  "title": "學習篩選流程｜學習範例",
  "steps": [
    {
      "title": "全部練習題",
      "count": 40
    },
    {
      "title": "做錯或不熟",
      "count": 18
    },
    {
      "title": "補強後仍不熟",
      "count": 6
    },
    {
      "title": "需要詢問",
      "count": 2
    }
  ],
  "unit": "題"
}
```

## 60. 學習時間流程圖｜學習範例

```json
{
  "type": "value_stream",
  "title": "學習時間流程圖｜學習範例",
  "steps": [
    {
      "title": "找資料",
      "process_minutes": 10,
      "wait_minutes": 5
    },
    {
      "title": "整理結構",
      "process_minutes": 20,
      "wait_minutes": 0
    },
    {
      "title": "解題",
      "process_minutes": 30,
      "wait_minutes": 0
    },
    {
      "title": "取得回饋",
      "process_minutes": 10,
      "wait_minutes": 15
    }
  ]
}
```

## 61. 月學習日曆圖｜學習範例

```json
{
  "type": "study_calendar",
  "title": "月學習日曆圖｜學習範例",
  "month": "2026-10",
  "entries": [
    {
      "date": "2026-10-01",
      "value": 30,
      "note": "極限"
    },
    {
      "date": "2026-10-03",
      "value": 45,
      "note": "導數"
    },
    {
      "date": "2026-10-06",
      "value": 20,
      "note": "錯題複習"
    },
    {
      "date": "2026-10-12",
      "value": 60,
      "note": "混合練習"
    }
  ],
  "unit": "分鐘"
}
```

## 62. 每週時間課表｜學習範例

```json
{
  "type": "weekly_timetable",
  "title": "每週時間課表｜學習範例",
  "blocks": [
    {
      "day": 0,
      "start": 9,
      "end": 11,
      "title": "微積分"
    },
    {
      "day": 1,
      "start": 14,
      "end": 16,
      "title": "管理學"
    },
    {
      "day": 2,
      "start": 10,
      "end": 12,
      "title": "計概"
    },
    {
      "day": 4,
      "start": 15,
      "end": 17,
      "title": "整理錯題"
    }
  ]
}
```

## 63. 每日時間塊圖｜學習範例

```json
{
  "type": "daily_timeblocks",
  "title": "每日時間塊圖｜學習範例",
  "blocks": [
    {
      "title": "預習",
      "start": 8,
      "end": 9
    },
    {
      "title": "上課",
      "start": 9.5,
      "end": 11.5
    },
    {
      "title": "解題",
      "start": 14,
      "end": 15.5
    },
    {
      "title": "回想",
      "start": 19,
      "end": 19.5
    }
  ],
  "unit": "時（24 小時制）"
}
```

## 64. 日期里程碑圖｜學習範例

```json
{
  "type": "milestone_timeline",
  "title": "日期里程碑圖｜學習範例",
  "milestones": [
    {
      "date": "2026-10-07",
      "title": "完成章節預習"
    },
    {
      "date": "2026-10-14",
      "title": "完成基礎題"
    },
    {
      "date": "2026-10-24",
      "title": "混合練習檢核"
    },
    {
      "date": "2026-11-07",
      "title": "考試"
    }
  ]
}
```

## 65. 複習日期時間軸｜學習範例

```json
{
  "type": "review_timeline",
  "title": "複習日期時間軸｜學習範例",
  "sessions": [
    {
      "date": "2026-10-07",
      "topic": "極限",
      "status": "done"
    },
    {
      "date": "2026-10-08",
      "topic": "導數",
      "status": "planned"
    },
    {
      "date": "2026-10-10",
      "topic": "極限",
      "status": "planned"
    },
    {
      "date": "2026-10-15",
      "topic": "導數",
      "status": "planned"
    }
  ]
}
```

## 66. 考前倒數排程｜學習範例

```json
{
  "type": "countdown_plan",
  "title": "考前倒數排程｜學習範例",
  "exam_date": "2026-11-07",
  "tasks": [
    {
      "title": "補齊觀念",
      "days_before": 14,
      "duration": 5
    },
    {
      "title": "題庫練習",
      "days_before": 9,
      "duration": 4
    },
    {
      "title": "錯題補強",
      "days_before": 5,
      "duration": 3
    },
    {
      "title": "輕量回想",
      "days_before": 2,
      "duration": 1
    }
  ]
}
```

## 67. 學習耗時比較圖｜學習範例

```json
{
  "type": "duration_comparison",
  "title": "學習耗時比較圖｜學習範例",
  "tasks": [
    {
      "title": "預習",
      "minutes": 25
    },
    {
      "title": "解題",
      "minutes": 45
    },
    {
      "title": "錯題整理",
      "minutes": 20
    },
    {
      "title": "回想",
      "minutes": 15
    }
  ]
}
```

## 68. 累積學習時間圖｜學習範例

```json
{
  "type": "cumulative_study",
  "title": "累積學習時間圖｜學習範例",
  "sessions": [
    {
      "date": "2026-10-01",
      "minutes": 30
    },
    {
      "date": "2026-10-02",
      "minutes": 45
    },
    {
      "date": "2026-10-04",
      "minutes": 20
    },
    {
      "date": "2026-10-06",
      "minutes": 50
    }
  ]
}
```

## 69. 學習時間分配圖｜學習範例

```json
{
  "type": "time_distribution",
  "title": "學習時間分配圖｜學習範例",
  "labels": [
    "預習",
    "上課",
    "解題",
    "回想",
    "錯題整理"
  ],
  "minutes": [
    30,
    120,
    60,
    20,
    25
  ]
}
```

## 70. 任務依賴排程圖｜學習範例

```json
{
  "type": "schedule_dependencies",
  "title": "任務依賴排程圖｜學習範例",
  "tasks": [
    {
      "id": "a",
      "title": "整理概念",
      "start": 0,
      "duration": 2,
      "depends": []
    },
    {
      "id": "b",
      "title": "基本練習",
      "start": 2,
      "duration": 3,
      "depends": [
        "a"
      ]
    },
    {
      "id": "c",
      "title": "易錯點整理",
      "start": 2,
      "duration": 2,
      "depends": [
        "a"
      ]
    },
    {
      "id": "d",
      "title": "混合測驗",
      "start": 5,
      "duration": 2,
      "depends": [
        "b",
        "c"
      ]
    }
  ],
  "unit": "天"
}
```

# 工程與策略架構（71–76）

## 71. 改善備料方式｜PREP 範例

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

## 72. 學習專題資源｜SWOT 範例

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

## 73. 專題執行策略｜TOWS 範例

```json
{
  "type": "tows_strategy",
  "title": "專題執行策略｜TOWS 範例",
  "so": [
    "運用程式能力製作競賽原型"
  ],
  "st": [
    "利用教師指導提早確認資料需求"
  ],
  "wo": [
    "先使用開源資料做小規模驗證"
  ],
  "wt": [
    "保留替代題目並限制第一版範圍"
  ]
}
```

## 74. 作業改善提案｜SCQA 範例

```json
{
  "type": "scqa_framework",
  "title": "作業改善提案｜SCQA 範例",
  "situation": "目前工作站以人工尋找零件。",
  "complication": "產品種類增加，尋料時間與錯料風險升高。",
  "question": "如何在有限預算內降低尋料浪費？",
  "answer": "試行定點備料與視覺標示，再比較改善前後數據。"
}
```

## 75. 製程缺失分布｜合成範例

```json
{
  "type": "engineering_pareto",
  "title": "製程缺失分布｜合成範例",
  "labels": [
    "尺寸偏差",
    "表面刮傷",
    "裝配錯誤",
    "標示缺失",
    "其他"
  ],
  "counts": [
    42,
    25,
    18,
    10,
    5
  ],
  "unit": "件"
}
```

## 76. 零件直徑與規格｜合成範例

```json
{
  "type": "process_capability",
  "title": "零件直徑與規格｜合成範例",
  "values": [
    9.91,
    10.03,
    9.99,
    10.07,
    9.96,
    10.01,
    10.12,
    9.93,
    10.02,
    9.98,
    10.04,
    9.97,
    10.08,
    10.01,
    9.94,
    10.05,
    10.11,
    9.89,
    10,
    10.06
  ],
  "lsl": 9.8,
  "usl": 10.2,
  "target": 10,
  "unit": "mm",
  "bins": 10,
  "within_sigma": 0
}
```

可選報告欄位：
```json
"report": {"x_label":"時間（秒）", "y_label":"產出（件）", "caption":"圖 1：實驗結果", "source":"實驗紀錄，日期與樣本數"}
```
此欄位置於圖表 JSON 的最外層，與 type、title 同層。

# 新增商業架構（77–82）

## 77. PESTEL 環境分析｜合成範例

```json
{
  "type": "pestel_analysis",
  "title": "PESTEL 環境分析｜合成範例",
  "political": [
    "政策補助可能支持改善"
  ],
  "economic": [
    "設備預算有限"
  ],
  "social": [
    "操作人員需要容易理解的介面"
  ],
  "technological": [
    "感測器與開源工具可降低門檻"
  ],
  "environmental": [
    "減少重工與材料浪費"
  ],
  "legal": [
    "確認資料與設備使用規範"
  ]
}
```

## 78. 波特五力分析｜合成範例

```json
{
  "type": "porter_five_forces",
  "title": "波特五力分析｜合成範例",
  "rivalry": [
    "既有軟體服務競爭"
  ],
  "new_entrants": [
    "低成本工具降低進入門檻"
  ],
  "substitutes": [
    "紙本紀錄或試算表"
  ],
  "supplier_power": [
    "設備來源是否集中"
  ],
  "buyer_power": [
    "客戶可選其他方案"
  ]
}
```

## 79. AIDA 溝通架構｜合成範例

```json
{
  "type": "aida_framework",
  "title": "AIDA 溝通架構｜合成範例",
  "attention": "每天有多少時間花在找零件？",
  "interest": "展示一個工作站的尋料流程。",
  "desire": "以實測比較改善前後差異，而非保證效果。",
  "action": "邀請參加一週小規模試用並提供回饋。"
}
```

## 80. OKR 目標與關鍵成果｜合成範例

```json
{
  "type": "okr_framework",
  "title": "OKR 目標與關鍵成果｜合成範例",
  "objective": "改善本月專題驗證品質",
  "key_results": [
    {
      "title": "完成有效需求訪談",
      "baseline": 0,
      "current": 3,
      "target": 8,
      "unit": "位",
      "direction": "increase"
    },
    {
      "title": "平均備料時間",
      "baseline": 60,
      "current": 52,
      "target": 40,
      "unit": "秒",
      "direction": "decrease"
    },
    {
      "title": "完成驗證案例",
      "baseline": 0,
      "current": 2,
      "target": 5,
      "unit": "件",
      "direction": "increase"
    }
  ]
}
```

## 81. 製程缺失分布｜合成範例

```json
{
  "type": "engineering_pareto",
  "title": "製程缺失分布｜合成範例",
  "labels": [
    "尺寸偏差",
    "表面刮傷",
    "裝配錯誤",
    "標示缺失",
    "其他"
  ],
  "counts": [
    42,
    25,
    18,
    10,
    5
  ],
  "unit": "件"
}
```

## 82. 零件直徑與規格｜合成範例

```json
{
  "type": "process_capability",
  "title": "零件直徑與規格｜合成範例",
  "values": [
    9.91,
    10.03,
    9.99,
    10.07,
    9.96,
    10.01,
    10.12,
    9.93,
    10.02,
    9.98,
    10.04,
    9.97,
    10.08,
    10.01,
    9.94,
    10.05,
    10.11,
    9.89,
    10,
    10.06
  ],
  "lsl": 9.8,
  "usl": 10.2,
  "target": 10,
  "unit": "mm",
  "bins": 10,
  "within_sigma": 0
}
```

# 工業工程計算與時間計畫（83–90）

## 83. 勞動生產力比較｜合成範例

```json
{
  "type": "labor_productivity",
  "title": "勞動生產力比較｜合成範例",
  "periods": [
    {
      "title": "改善前",
      "output": 480,
      "workers": 4,
      "hours": 8
    },
    {
      "title": "改善後",
      "output": 600,
      "workers": 4,
      "hours": 8
    }
  ],
  "output_unit": "件"
}
```

## 84. OEE 設備綜合效率｜合成範例

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

## 85. 產線平衡效率｜合成範例

```json
{
  "type": "line_balance_efficiency",
  "title": "產線平衡效率｜合成範例",
  "station_seconds": [
    45,
    50,
    40,
    55
  ],
  "cycle_seconds": 60
}
```

## 86. 效率與效能比較｜合成範例

```json
{
  "type": "efficiency_effectiveness",
  "title": "效率與效能比較｜合成範例",
  "planned_input": 40,
  "actual_input": 36,
  "planned_output": 100,
  "actual_output": 90,
  "input_unit": "人時",
  "output_unit": "件"
}
```

## 87. 需求節拍與週期比較｜合成範例

```json
{
  "type": "takt_time_calculator",
  "title": "需求節拍與週期比較｜合成範例",
  "net_minutes": 420,
  "demand": 360,
  "actual_cycle_seconds": 65
}
```

## 88. 工作量與總時間估算｜合成範例

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

## 89. 產能負荷與缺口｜合成範例

```json
{
  "type": "capacity_load",
  "title": "產能負荷與缺口｜合成範例",
  "jobs": [
    {
      "title": "產品 A",
      "quantity": 50,
      "minutes_per_unit": 4
    },
    {
      "title": "產品 B",
      "quantity": 30,
      "minutes_per_unit": 6
    }
  ],
  "available_minutes": 360
}
```

## 90. 工作日計畫日曆｜合成範例

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

# 商業時間工具（91–100）

## 91. 重要／緊急優先矩陣｜合成範例

```json
{
  "type": "priority_eisenhower",
  "title": "重要／緊急優先矩陣｜合成範例",
  "points": [
    {
      "title": "明天繳交的報告",
      "x": 90,
      "y": 90
    },
    {
      "title": "下週概念複習",
      "x": 25,
      "y": 85
    },
    {
      "title": "不重要的臨時請求",
      "x": 85,
      "y": 20
    },
    {
      "title": "無目的瀏覽",
      "x": 20,
      "y": 15
    }
  ]
}
```

## 92. 每日時間預算｜合成範例

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

## 93. 價值／時間排序｜合成範例

```json
{
  "type": "priority_value_effort",
  "title": "價值／時間排序｜合成範例",
  "tasks": [
    {
      "title": "訂正錯題",
      "value_score": 9,
      "minutes": 30
    },
    {
      "title": "美化筆記",
      "value_score": 4,
      "minutes": 60
    },
    {
      "title": "確認報告要求",
      "value_score": 8,
      "minutes": 15
    }
  ]
}
```

## 94. 番茄鐘工時計畫｜合成範例

```json
{
  "type": "pomodoro_planner",
  "title": "番茄鐘工時計畫｜合成範例",
  "focus_minutes": 25,
  "rounds": 6,
  "short_break": 5,
  "long_break": 15,
  "long_every": 4
}
```

## 95. 時間投資回收｜合成範例

```json
{
  "type": "time_savings_roi",
  "title": "時間投資回收｜合成範例",
  "setup_minutes": 120,
  "saved_minutes_each": 10,
  "maintenance_minutes_each": 2,
  "uses": 30
}
```

## 96. 會議人時成本｜合成範例

```json
{
  "type": "meeting_person_hours",
  "title": "會議人時成本｜合成範例",
  "participants": [
    {
      "title": "主持人",
      "minutes": 45
    },
    {
      "title": "組員 A",
      "minutes": 45
    },
    {
      "title": "組員 B",
      "minutes": 30
    }
  ],
  "meeting_minutes": 45
}
```

## 97. 期限倒排日曆｜合成範例

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

## 98. 關鍵路徑 CPM｜合成範例

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

## 99. 計畫／實際時間差異｜合成範例

```json
{
  "type": "time_variance_audit",
  "title": "計畫／實際時間差異｜合成範例",
  "tasks": [
    {
      "title": "閱讀",
      "planned_minutes": 60,
      "actual_minutes": 80
    },
    {
      "title": "解題",
      "planned_minutes": 90,
      "actual_minutes": 100
    },
    {
      "title": "報告",
      "planned_minutes": 60,
      "actual_minutes": 45
    }
  ]
}
```

## 100. Little 定律流程時間｜合成範例

```json
{
  "type": "little_law_time",
  "title": "Little 定律流程時間｜合成範例",
  "average_wip": 12,
  "throughput_per_hour": 3,
  "unit": "件"
}
```
