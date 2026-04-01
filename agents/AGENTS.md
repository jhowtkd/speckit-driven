# Agent instructions

This repository uses a **spec-driven workflow** in Cursor.

## Precedence

1. **Your explicit instructions** (this file, chat, or other project docs the user sets) — highest.
2. **Project Rules** in **`.cursor/rules/*.mdc`** — operational gates and phases.
3. **Default assistant behavior** — lowest.

When in conflict, follow the user’s explicit instructions.

## Where to look

| What | Where |
|------|--------|
| Core workflow (always on) | `.cursor/rules/00-using-spec-driven.mdc` |
| Phase rules (spec, research, plan, execute, verify, close) | `.cursor/rules/10-` … `60-*.mdc` |
| Human principles (non-normative) | `docs/constitution.md` |
| Feature work | `.cursor/features/<FEATURE_ID>/` |
| Templates | `.cursor/templates/` |

## When to use the full workflow

Apply the full artifact pipeline when the change is **ambiguous**, **medium-sized or larger**, or carries **material technical risk**. For tiny, obvious edits, stay proportional — see **`00-using-spec-driven.mdc`** (semi-strict profile).

## Custom commands (beta)

If `.cursor/commands/` is present, slash commands may guide phases. Cursor custom commands are **beta**; rules remain the source of truth.
