/* Learning templates, synthetic examples; browser-local only. */
window.VC_LEARNING_TEMPLATES=[
  {
    "id": "concept_map",
    "label": "概念圖",
    "desc": "概念＋關係詞",
    "data": {
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
  },
  {
    "id": "cause_chain",
    "label": "因果鏈",
    "desc": "原因 → 結果",
    "data": {
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
  },
  {
    "id": "decision_tree",
    "label": "決策樹",
    "desc": "Yes / No 判斷",
    "data": {
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
  },
  {
    "id": "comparison_matrix",
    "label": "比較矩陣",
    "desc": "多方案並排比較",
    "data": {
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
  },
  {
    "id": "process_flow",
    "label": "流程圖",
    "desc": "步驟與 SOP",
    "data": {
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
  },
  {
    "id": "formula_map",
    "label": "公式關係圖",
    "desc": "公式＋變數＋易錯點",
    "data": {
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
  },
  {
    "id": "hierarchy_map",
    "label": "層級分類圖",
    "desc": "分類與階層",
    "data": {
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
  },
  {
    "id": "exam_overview",
    "label": "考前總覽",
    "desc": "一頁濃縮重點",
    "data": {
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
  },
  {
    "id": "fishbone",
    "label": "魚骨原因圖",
    "desc": "問題結果與原因分類",
    "data": {
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
  },
  {
    "id": "venn",
    "label": "集合重疊圖",
    "desc": "兩集合、交集與差集",
    "data": {
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
  },
  {
    "id": "quadrant",
    "label": "四象限學習圖",
    "desc": "兩條軸定位學習項目",
    "data": {
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
  },
  {
    "id": "timeline",
    "label": "事件時間軸",
    "desc": "日期與事件的先後",
    "data": {
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
  },
  {
    "id": "cycle_map",
    "label": "循環學習圖",
    "desc": "重複流程與回饋循環",
    "data": {
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
  },
  {
    "id": "pyramid",
    "label": "層級金字塔",
    "desc": "結論到細節的層級",
    "data": {
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
  },
  {
    "id": "cornell_notes",
    "label": "康乃爾筆記圖",
    "desc": "提示欄、內容欄與摘要",
    "data": {
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
  },
  {
    "id": "kwl",
    "label": "KWL 知識盤點",
    "desc": "已知、想知道、學到了",
    "data": {
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
  },
  {
    "id": "retrieval_cards",
    "label": "主動提取問答卡",
    "desc": "先回答，再點卡片看答案",
    "data": {
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
  },
  {
    "id": "spaced_repetition",
    "label": "間隔複習排程",
    "desc": "以自訂天數安排回想",
    "data": {
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
  },
  {
    "id": "study_gantt",
    "label": "學習甘特圖",
    "desc": "任務起點、天數與重疊",
    "data": {
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
  },
  {
    "id": "argument_map",
    "label": "論證結構圖",
    "desc": "結論、理由、證據與反駁",
    "data": {
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
  }
];
CHARTS.push(...window.VC_LEARNING_TEMPLATES.map(t=>[t.id,t.label]));
