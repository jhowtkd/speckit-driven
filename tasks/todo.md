# Audit Plan

- [x] Confirm the current install and doctor behavior in a temp workspace.
- [x] Tighten the cursor rule files only where legacy guidance still leaks through.
- [x] Add explicit test coverage for command copying and doctor drift detection.
- [x] Run verification and document the result.

## Review

- Completed on 2026-04-01.
- Updated rules 00/10/20/30/40/50.
- Added install command-copy assertion and dedicated doctor drift coverage.
- Verification: `npm test` passed.

# Meta-System Redesign Discovery

- [x] Inspect the current repository, prior design docs, and recent commits.
- [x] Read the official Codex surfaces for subagents, skills, plugins, hooks, rules, and MCP.
- [x] Read the official Cursor surfaces for rules, skills, subagents, hooks, plugins, and MCP.
- [x] Review GSD and Traycer to extract reusable workflow primitives.
- [x] Clarify the product target and scope boundary for the redesign.
- [ ] Propose 2-3 architecture approaches with trade-offs and a recommendation.
- [ ] Present the design for approval before any implementation work.

## Review

- Discovery in progress on 2026-04-01.
- Goal: redefine this repo as a lightweight, cross-editor workflow injection system centered on Traycer-style workflows plus spec-driven development.
- Product direction revised by user: own orchestrator first, with Codex and Cursor as thin adapters.

# Codex Docs Research

- [x] Identify the official Codex docs pages for subagents, skills, plugins, build plugins, hooks, and rules.
- [x] Extract concrete capabilities, constraints, and install/config surfaces from the official docs only.
- [x] Synthesize implications for a cross-editor workflow/meta-prompting product.
- [x] Capture exact official links used in the final report.

## Review

- Completed on 2026-04-01.
- Sources were restricted to `developers.openai.com`.
- Final synthesis should separate what is configurable in Codex CLI, Codex app, and plugin/skill packaging.
- Research outcome:
  - `subagents` are runtime orchestration for parallel specialized agents.
  - `skills` are reusable instruction packages with progressive disclosure and repo/user/admin/system install locations.
  - `plugins` are the distributable bundle for skills plus app integrations and MCP servers.
  - `build plugins` define local scaffolding and marketplace metadata for distribution.
  - `hooks` and `rules` are experimental/config-driven guardrails with narrower runtime applicability.

# Global Installer Design

- [x] Inspect the current host-level install surfaces for Codex and Cursor on the local machine.
- [x] Confirm which parts of the ELF architecture must remain project-local.
- [x] Propose 2-3 global installer approaches with trade-offs.
- [x] Recommend the v1 approach and describe host-specific behavior.
- [x] Present the design for approval before implementation.
- [x] Save the approved design and implementation plan artifacts.

## Review

- Design approved on 2026-04-01.
- Codex exposes stable user-level surfaces under `~/.codex/`.
- Cursor exposes user-level surfaces under `~/.cursor/`, including `rules`, `mcp.json`, and `hooks.json`.
- The ELF runtime state should remain project-local in `.elf/`, even if adapters become globally available.
- Recommended v1 contract:
  - `npm install -g elf-orchestrator`
  - `elf global install codex|cursor|all`
  - `elf init` per project
  - `elf doctor` for project runtime and `elf global doctor` for host-global setup
