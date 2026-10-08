# Visual Canvas Architecture

Visual Canvas is intentionally a static, local-first application. The current architecture is organized around three independent interfaces that share rendering/style utilities without requiring a framework or backend.

## 1. Workbench

Entry point: `index.html`

Responsibilities:
- choose one of 100 chart/diagram types
- edit form fields or JSON
- render Plotly/native SVG output
- manage typography, guardrails and export
- autosave the current draft in browser localStorage

Active layers:
- core input/render: `builder.js`, `charts.js`
- chart catalogs/adapters: `extensions/learning-charts/`, `flow-time/`, `strategy/`, `engineering/`, `business-time/`
- presentation: `appearance.js`, `professional.js`, `typography/`
- quality: `chart-guardrails.js`, `smart-layout.js`, `auto-insight.js`, `annotation-layout.js`, `accessibility.js`, `emphasis.js`, `legend-intelligence.js`, `executive-*.js`
- persistence: `editor-state.js`
- export: `pdf-export.js`
- convenience gate: `gate.js` / `gate-config.js`

## 2. Chart Guide

Entry point: `guides/chart-handbook/index.html`

Responsibilities:
- explain chart choices
- filter/recommend chart types
- hand a selected template to the Workbench
- expose example JSON and AI prompt helpers

Data source:
- `guides/chart-handbook/data.js`

Shared layer:
- `extensions/appearance.js`

## 3. Research Studio

Entry point: `extensions/research-studio/index.html`

Responsibilities:
- research/report diagrams
- ECharts / Mermaid / native diagram rendering
- academic metadata, SVG/PNG/PDF output
- shared five-font appearance state

Active layers:
- `catalog.js`, `adapters.js`, `thinking.js`, `layout.js`, `studio.js`
- shared `diagram-engine.js`, `diagram-network-p1.js`, `diagram-tree-p1.js`, `appearance.js`, `pdf-export.js`

## Shared runtime

Local runtime:
- `tools/local_server.py` binds only to `127.0.0.1`
- `tools/offline_setup.py` installs fixed Plotly/ECharts/Mermaid bundles with integrity checks
- `start-local.command` and `start-local.bat` use port 4173 for stable localStorage origin

Storage:
- draft/project UI state is browser localStorage
- data is origin-specific
- important work should be exported as JSON backup

## Dependency direction

```
Workbench ───────┐
Chart Guide ─────┼──> shared appearance / static assets
Research Studio ─┘

Workbench ──> chart catalogs/adapters ──> rendering engines
Research Studio ──> research catalog/adapters ──> diagram/ECharts/Mermaid engines
```

The three interfaces should not directly manipulate each other's DOM. Cross-interface handoff should use URL parameters, exported JSON, or shared localStorage keys with documented ownership.

## Dormant / legacy modules

Earlier UI experiments are isolated under `legacy/ui-experiments/` and are not loaded by any current entry point. The archive contains the former sidebar workflow, work modes, output-format panel, chart advisor, presentation storyline, research workspace, project manager, and Executive Summary v1.

Production pages must not import from `legacy/`. If one of those ideas is revived, move the needed logic back into an active module, document its ownership here, and add regression coverage before wiring it into an interface.

Dormant UI CSS from those experiments has also been removed from the main page, so archived features no longer increase the active Workbench payload.

## Change rules

1. Keep the three interfaces independently usable.
2. Do not add a new permanent Workbench panel when the same feature can live in Chart Guide or Research Studio.
3. Shared visual settings belong in `appearance.js`.
4. New render types belong in a catalog/adapter module, not directly in page UI code.
5. Keep local-first behavior and cross-platform launchers working.
6. Add or update regression checks before deleting a legacy module.
