# Runtime Constitution - ELF Cursor Adapter

## Core rule

The ELF runtime is the source of truth. Cursor rules only guide feature
authoring and review.

## Mandatory flow

ELF init → Spec → Clarify (if needed) → Research (if needed) → Plan → Tasks →
Execute → Verify → Final Review

## Hard gates

- No code before spec
- No execution before plan and tasks
- No completion before verification >= 90
- No hidden scope expansion
- No state kept only in memory

## Runtime commands

- `elf init`
- `elf run`
- `elf resume`
- `elf review`
- `elf verify`
- `elf mcp serve`

## Rule

Use `.cursor/rules` and `.cursor/templates` for Cursor guidance; use `.elf/`
for runtime state.
