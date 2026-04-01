# Spec-Driven Coding (Cursor Edition)

## What This Is
An open-source, Cursor-focused evolution of the spec-driven coding workflow. It migrates the existing CLI-heavy spec-driven-kit into a lightweight, modular product that relies on official, stable Cursor features (primarily `.cursor/rules` and `AGENTS.md`) rather than fragile or private mechanisms.

## Core Value
The spec-driven workflow functions seamlessly and intuitively inside Cursor using native features, providing equal practical capabilities to Superpowers but through standard open-source conventions.

## Requirements

### Validated
- ✓ CLI initializes project
- ✓ CLI acts as an installer/utility
- ✓ Spec-driven concepts exist (prompts/templates)

### Active
- [ ] Restructure repository to use standard directories (rules, agents, modes, commands, templates, scripts, examples, docs)
- [ ] Create official `.cursor/rules` (00-using-spec-driven, 10-brainstorming-spec, 20-targeted-research, 30-writing-plan, 40-executing-plan, 50-verification-before-completion, 60-closing-feature)
- [ ] Convert existing spec-driven content to rule format without reinventing the methodology
- [ ] Create `agents/AGENTS.md` as a fallback
- [ ] Create Cursor presets in `modes/` (spec-ask, spec-build, spec-verify)
- [ ] Create command references in `commands/` (spec-start, spec-research, spec-plan, spec-execute, spec-verify, spec-close)
- [ ] Downgrade CLI to only handle installation, updates, and doctoring
- [ ] Write open-source documentation (README, CONTRIBUTING, LICENSE, CODE_OF_CONDUCT, SECURITY)
- [ ] Create a minimal functional example in `examples/minimal-project`

### Out of Scope
- Creating new custom orchestration tools or CLI kernels — Why: Goal is to use stable Cursor surfaces, avoiding private/fragile mechanisms.
- Reinventing the spec-driven methodology — Why: The methodology works; we are just repackaging it for Cursor native features.

## Context
The current `spec-driven-kit` is CLI-heavy and installs a set of files that mimic an agent workflow. To increase open-source adoption, clarity, and stability, the product needs to leverage Cursor's native `.cursor/rules/*.mdc` as the core operational mechanism, reducing the CLI to an installer.

## Constraints
- **Tech stack**: Markdown rules (`.mdc`), `AGENTS.md`, and lightweight Node.js CLI.
- **Design**: Files must be short, modular, and easy to maintain.
- **Dependency**: Do not depend on the CLI as the core product engine.

## Key Decisions
| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use `.cursor/rules` as the primary engine | Official, stable Cursor feature, avoids external orchestration dependencies | — Pending |
| Keep CLI only for `init`, `update`, `doctor` | Simplifies the product and shifts execution to Cursor | — Pending |

---
*Last updated: 2026-03-31 after initialization*
