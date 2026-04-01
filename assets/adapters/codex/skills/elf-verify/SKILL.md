---
name: elf-verify
description: Verify ELF runs and persist verification results.
---

# ELF Verify

Use this skill when you need to verify a run or phase in the local ELF runtime.

## Rules

- Use `elf verify <run-id>` for verification.
- Inspect `.elf/` state if the verification fails.
- Use `elf mcp serve` for bridge-based inspection when needed.
- Treat the ELF runtime as authoritative.
