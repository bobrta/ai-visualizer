# 第三方來源與授權

| 來源 | 固定版本 | 授權 | 本工具用法 |
|---|---|---|---|
| https://github.com/apache/echarts | 5.6.0 | Apache-2.0，另含元件授權 | CDN 按需載入，SVG 繪圖與自有轉接器 |
| https://github.com/mermaid-js/mermaid | 11.4.1 | MIT | CDN ESM 按需載入，strict 模式與自有範例 |

此專案未打包第三方套件原始碼；以上版本是固定依賴，不宣稱為最新版本。若改為離線內嵌，應一併保留上游 LICENSE、NOTICE 及其元件授權。

- ECharts LICENSE：https://github.com/apache/echarts/blob/5.6.0/LICENSE
- ECharts SVG 官方文件：https://echarts.apache.org/handbook/en/best-practices/canvas-vs-svg/
- Mermaid LICENSE：https://github.com/mermaid-js/mermaid/blob/v11.4.1/LICENSE
- Mermaid strict 設定：https://mermaid.js.org/config/schema-docs/config-properties-securitylevel.html

研究候選：Vega-Lite（https://github.com/vega/vega-lite，BSD-3-Clause）適合宣告式統計圖與多視圖，但本版未接入；避免重複增加相似引擎。這些授權資訊為來源紀錄，商業散布時應依所使用版本的完整授權條文辦理。
