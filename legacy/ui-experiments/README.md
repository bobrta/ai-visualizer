# Legacy UI Experiments

These files are preserved from earlier Visual Canvas UI experiments. They are **not loaded by any current entry point**.

Why they are kept:
- retain ideas that may be useful later
- keep old project/work-mode/storyline experiments available without mixing them into active architecture
- make it obvious which code is inactive

Current product code lives under `extensions/`, `guides/`, and the three documented entry points in `ARCHITECTURE.md`.

Do not import files from this folder directly into production pages. If a feature is revived, move the relevant logic back into an active module, update `ARCHITECTURE.md`, and add regression coverage first.
