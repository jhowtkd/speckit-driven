---
name: spec-driven-mvp
description: >-
  Compatibility skill for the ELF-backed Cursor adapter. The operational
  source of truth is the ELF runtime in `.elf/`; Cursor rules only guide
  feature authoring under `.cursor/`.
---

# ELF-backed Cursor adapter

Use `.cursor/rules/*.mdc` as the Cursor-facing workflow guide.

For runtime execution, use the ELF CLI:

- `elf init`
- `elf run`
- `elf resume`
- `elf review`
- `elf verify`
- `elf mcp serve`

Feature work stays under `.cursor/features/<FEATURE_ID>/` with templates from
`.cursor/templates/`.
