---
name: elf-plan
description: Advance a phase workflow into the plan step.
---

# ELF Plan

Use this skill when the current phase step is `plan`.

## Rules

- Run `elf phase plan <run-id>`.
- Write `.elf/phases/<phase-id>/plan.md` and `.elf/phases/<phase-id>/tasks.md`.
- Confirm the next step is `execute` before moving on.
