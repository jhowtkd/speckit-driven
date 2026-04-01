---
name: elf-start
description: Start a real phase workflow in the local ELF runtime.
---

# ELF Start

Use this skill when you need to begin a chained phase workflow.

## Rules

- Run `elf init` first if `.elf/` is missing.
- Start the phase with `elf phase start --title "<feature>"`.
- Capture the returned `run-id`.
- Treat `.elf/phases/<phase-id>/` as the working artifact directory.
