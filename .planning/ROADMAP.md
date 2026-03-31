# Project Roadmap

**[5] phases** | **[25] requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | **Architecture setup** | Establish the repository structure and migrate assets | REPO-01, REPO-02 | 2 |
| 2 | **Rules engine** | Build the core `.cursor/rules` files | RULE-01, RULE-02, RULE-03, RULE-04, RULE-05, RULE-06, RULE-07, RULE-08 | 3 |
| 3 | **Agents & Commands** | Build the agents, modes, and command references | AGNT-01, MODE-01, MODE-02, MODE-03, CMD-01 | 3 |
| 4 | **CLI refactoring** | Simplify the CLI to only handle install/update/doctor | CLI-01, CLI-02, CLI-03, CLI-04 | 3 |
| 5 | **Open source documentation** | Write the OSS docs and minimal project example | DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06 | 3 |

### Phase Details

**Phase 1: Architecture setup**
Goal: Establish the repository structure and migrate assets
Requirements: REPO-01, REPO-02
Success criteria:
1. Standard directories (`rules/`, `agents/`, `modes/`, `commands/`, `templates/`, `scripts/`, `examples/`, `docs/`) exist
2. Existing spec-driven assets are migrated into the new structure

**Phase 2: Rules engine**
Goal: Build the core `.cursor/rules` files
Requirements: RULE-01, RULE-02, RULE-03, RULE-04, RULE-05, RULE-06, RULE-07, RULE-08
Success criteria:
1. All 7 listed `.mdc` files are created and populated
2. `00-using-spec-driven.mdc` correctly references others and acts as the orchestrator
3. Rules maintain spec-driven methodology principles without inventing new ones

**Phase 3: Agents & Commands**
Goal: Build the agents, modes, and command references
Requirements: AGNT-01, MODE-01, MODE-02, MODE-03, CMD-01
Success criteria:
1. `AGENTS.md` is present and functional as a fallback
2. `modes/` contains valid preset configurations
3. `commands/` contains the necessary markdown files for CLI slash command references

**Phase 4: CLI refactoring**
Goal: Simplify the CLI to only handle install/update/doctor
Requirements: CLI-01, CLI-02, CLI-03, CLI-04
Success criteria:
1. Orchestration logic is removed from the CLI
2. The CLI `install` command sets up the repository correctly
3. The CLI `update` and `doctor` commands function as intended

**Phase 5: Open source documentation**
Goal: Write the OSS docs and minimal project example
Requirements: DOCS-01, DOCS-02, DOCS-03, DOCS-04, DOCS-05, DOCS-06
Success criteria:
1. README.md contains clear installation and usage instructions
2. All required OSS files (CONTRIBUTING, LICENSE, CODE_OF_CONDUCT, SECURITY) are present
3. The `examples/minimal-project` folder contains a working sample

---
*Roadmap generated: 2026-03-31*
