# ELF Host Flow Vertical Slice Design

**Status:** Drafted after maintainer reset  
**Date:** 2026-04-01  
**Goal:** Turn the current runtime and adapters into a real chained workflow
experience inside Cursor and Codex, starting with a single `phase` slice.

## Problem

The current repository delivers:

- a file-based runtime
- host adapters
- MCP plumbing
- global installers

But it does not yet deliver the intended product behavior:

- host-native chained workflow steps
- durable progression through those steps
- adapter entrypoints that drive the runtime instead of only describing it

## Approaches

### 1. Keep adapters thin and deepen only the runtime

Pros:

- minimal adapter churn
- keeps architecture pure

Cons:

- still leaves Cursor/Codex without a visible chained experience
- does not fix the product gap the maintainer called out

### 2. Build a real `phase` vertical slice across runtime and adapters

Pros:

- creates an actual end-to-end flow inside both hosts
- validates the orchestrator-first design with one concrete chain
- gives a clean base for task, epic, debug, and ship later

Cons:

- touches runtime, CLI, and adapter assets together

### 3. Rebuild everything at once for all workflows

Pros:

- broad coverage

Cons:

- too large
- high risk of another architecture-heavy, product-light iteration

## Recommendation

Choose approach 2.

Build one real chain:

`start -> research -> plan -> execute -> verify -> close`

The runtime owns the state and artifacts. Cursor commands and Codex skills
become thin step drivers for that chain.

## Slice Definition

### Runtime changes

- Persist phase-step state in `.elf/phases/<phase-id>/state.json`
- Ensure the phase directory always contains:
  - `spec.md`
  - `research.md`
  - `plan.md`
  - `tasks.md`
  - `verification.md`
  - `decision-log.md`
  - `state.json`
- Track the current step and completed steps

### CLI changes

Add a new phase command tree:

- `elf phase start --title "..."`
- `elf phase research <run-id>`
- `elf phase plan <run-id>`
- `elf phase execute <run-id>`
- `elf phase verify <run-id>`
- `elf phase close <run-id>`

`elf run --workflow phase` should initialize the same phase chain so old entry
points do not become dead weight.

### Adapter changes

Cursor:

- `.cursor/commands/spec-*.md` should instruct Cursor to use the real phase
  commands, not generic writing steps

Codex:

- add phase-step skills, or rewrite existing skills so they explicitly drive the
  same phase chain

## Success Criteria

- Starting a phase creates durable runtime artifacts and phase-step state
- Advancing a phase updates the state machine and writes artifacts in `.elf/`
- Cursor commands now map to the real runtime chain
- Codex skills now map to the real runtime chain
- The host experience feels like a true multi-step workflow, not a thin reminder
  to use the CLI
