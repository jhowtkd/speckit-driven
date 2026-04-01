# Requirements: Spec-Driven Coding (Cursor Edition)

**Defined:** 2026-03-31
**Core Value:** The spec-driven workflow functions seamlessly and intuitively inside Cursor using native features, providing equal practical capabilities to Superpowers but through standard open-source conventions.

## v1 Requirements

### Repository Architecture
- [ ] **REPO-01**: Restructure repository to include standard directories (`rules/`, `agents/`, `modes/`, `commands/`, `templates/`, `scripts/`, `examples/`, `docs/`)
- [ ] **REPO-02**: Migrate existing assets into the new structure

### Core Rules Engine
- [ ] **RULE-01**: Create `00-using-spec-driven.mdc` with `alwaysApply: true`
- [ ] **RULE-02**: Create `10-brainstorming-spec.mdc`
- [ ] **RULE-03**: Create `20-targeted-research.mdc`
- [ ] **RULE-04**: Create `30-writing-plan.mdc`
- [ ] **RULE-05**: Create `40-executing-plan.mdc`
- [ ] **RULE-06**: Create `50-verification-before-completion.mdc`
- [ ] **RULE-07**: Create `60-closing-feature.mdc`
- [ ] **RULE-08**: Content in rules must adapt existing spec-driven methodology without reinventing it

### Agents & Fallbacks
- [ ] **AGNT-01**: Create `agents/AGENTS.md` as a simple fallback mechanism

### Modes & Presets
- [ ] **MODE-01**: Create preset config for `spec-ask`
- [ ] **MODE-02**: Create preset config for `spec-build`
- [ ] **MODE-03**: Create preset config for `spec-verify`

### Commands
- [ ] **CMD-01**: Create command references in `commands/` (`spec-start.md`, `spec-research.md`, `spec-plan.md`, `spec-execute.md`, `spec-verify.md`, `spec-close.md`)

### CLI Refactoring
- [ ] **CLI-01**: Strip CLI functionality down to `install` command
- [ ] **CLI-02**: Support `update` command in CLI
- [ ] **CLI-03**: Support `doctor` command in CLI for validation
- [ ] **CLI-04**: Ensure CLI does not perform any orchestration

### Documentation & Open Source
- [ ] **DOCS-01**: Create `README.md` with quick installation and examples
- [ ] **DOCS-02**: Create `CONTRIBUTING.md`
- [ ] **DOCS-03**: Create `LICENSE`
- [ ] **DOCS-04**: Create `CODE_OF_CONDUCT.md`
- [ ] **DOCS-05**: Create `SECURITY.md`
- [ ] **DOCS-06**: Create a minimal functional project example in `examples/minimal-project`

## v2 Requirements

### Analytics & Telemetry
- **ANAL-01**: Add optional telemetry to CLI to track feature usage

## Out of Scope

| Feature | Reason |
|---------|--------|
| Custom orchestration kernel | Goal is to rely exclusively on native Cursor capabilities (rules, modes, agents) |
| Reinventing the spec-driven framework | The methodology is sound; this is merely a port to Cursor-native surfaces |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REPO-01 | Phase 1 | Pending |
| REPO-02 | Phase 1 | Pending |
| RULE-01 | Phase 2 | Pending |
| RULE-02 | Phase 2 | Pending |
| RULE-03 | Phase 2 | Pending |
| RULE-04 | Phase 2 | Pending |
| RULE-05 | Phase 2 | Pending |
| RULE-06 | Phase 2 | Pending |
| RULE-07 | Phase 2 | Pending |
| RULE-08 | Phase 2 | Pending |
| AGNT-01 | Phase 3 | Pending |
| MODE-01 | Phase 3 | Pending |
| MODE-02 | Phase 3 | Pending |
| MODE-03 | Phase 3 | Pending |
| CMD-01 | Phase 3 | Pending |
| CLI-01 | Phase 4 | Pending |
| CLI-02 | Phase 4 | Pending |
| CLI-03 | Phase 4 | Pending |
| CLI-04 | Phase 4 | Pending |
| DOCS-01 | Phase 5 | Pending |
| DOCS-02 | Phase 5 | Pending |
| DOCS-03 | Phase 5 | Pending |
| DOCS-04 | Phase 5 | Pending |
| DOCS-05 | Phase 5 | Pending |
| DOCS-06 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 25 total
- Mapped to phases: 0
- Unmapped: 25 ⚠️

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
