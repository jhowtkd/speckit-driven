---
name: elf-execute
description: Advance a phase workflow into the execute step.
---

# ELF Execute

Use this skill when the current phase step is `execute`.

## Rules

- Run `elf phase execute <run-id>`.
- Execute the work described in `.elf/phases/<phase-id>/tasks.md`.
- Update `.elf/phases/<phase-id>/decision-log.md` as decisions are made.
- Confirm the next step is `verify`.
