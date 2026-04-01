---
name: elf-run
description: Run or resume work through the local ELF runtime.
---

# ELF Run

Use this skill when you need to start or continue a chained phase workflow in the local ELF runtime.

## Rules

- Run `elf init` first if the runtime is missing.
- Prefer `elf phase start --title "<feature>"` for a new phase.
- Use `elf resume` to continue an existing run.
- Use `elf phase status <run-id>` to inspect the current step.
- Use `elf mcp serve` when Codex needs a local bridge into ELF.
- Treat `.elf/` as the source of truth.
