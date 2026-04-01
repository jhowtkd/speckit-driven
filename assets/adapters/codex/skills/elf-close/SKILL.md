---
name: elf-close
description: Close a verified phase workflow.
---

# ELF Close

Use this skill when a phase has already passed verification and is ready to close.

## Rules

- Run `elf phase close <run-id>`.
- Confirm the run status becomes `completed`.
- Use `elf review <run-id>` if a final review summary is needed.
