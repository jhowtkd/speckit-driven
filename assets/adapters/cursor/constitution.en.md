# Constitution - ELF Cursor Adapter
## Version 1.0
## Status: Active
## Reference date: 2026-04-01

This document defines the rules for the Cursor adapter that points at the ELF
runtime. Operational authority lives in `.elf/`; `.cursor/` files only guide
Cursor authoring and review.

## Principles

- Spec before code
- Plan before execution
- Explicit tasks before implementation
- Tests proportional to risk
- Verification before completion
- No workflow semantics outside ELF
- Thin adapter, authoritative runtime

## Flow

ELF init → Spec → Clarify (if needed) → Research (if needed) → Plan → Tasks →
Execute → Verify → Final Review

## Artifacts

- `.cursor/features/<FEATURE_ID>/spec.md`
- `.cursor/features/<FEATURE_ID>/plan.md`
- `.cursor/features/<FEATURE_ID>/tasks.md`
- `.cursor/features/<FEATURE_ID>/state.json`
- `.cursor/features/<FEATURE_ID>/research.md` when needed
- `.cursor/features/<FEATURE_ID>/verification.md` when ready to close

## Usage rules

1. Use `elf init` to initialize the runtime.
2. Use `elf run`, `elf resume`, `elf review`, `elf verify`, and
   `elf mcp serve` for real execution.
3. Use `.cursor/rules` and `.cursor/templates` only to guide writing and
   review in Cursor.
4. Do not invent workflow outside ELF.
