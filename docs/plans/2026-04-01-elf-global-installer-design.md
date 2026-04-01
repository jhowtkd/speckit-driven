# ELF Global Installer Design

**Status:** Approved by maintainer
**Date:** 2026-04-01
**Scope:** Add a host-global installation model for Codex and Cursor while keeping the ELF runtime and workflow state project-local.

---

## 1. Vision

ELF should feel globally installed in the user's agent hosts without turning the orchestrator into a shared runtime across unrelated projects.

The product therefore gains:

- global host integrations for Codex and Cursor
- host-level doctor, update, and uninstall flows
- project-local runtime bootstrap in `.elf/`
- a clean contract between host-global surfaces and project-local state

This preserves the orchestrator-first architecture while delivering the user expectation of "install once, use everywhere."

---

## 2. Product Decision

### 2.1 Chosen direction

ELF will support:

- **global CLI install** via `npm install -g elf-orchestrator`
- **global host install** via `elf global install ...`
- **project-local runtime state** via `elf init`

### 2.2 Explicit non-goal

ELF will **not** move run state, artifacts, or workflow history into a shared home-directory runtime such as `~/.elf/`.

The source of truth remains:

- `.elf/`
- `AGENTS.md`
- repo-local artifacts and run state

### 2.3 Why this split

This split gives users a true global integration experience while preserving:

- per-project auditability
- resumable workflow state
- clean verification boundaries
- safe multi-project usage

---

## 3. Installation Model

### 3.1 Three installation layers

ELF now has three distinct layers:

1. **CLI layer**
   - installs the `elf` command globally

2. **Host adapter layer**
   - installs host-global rules, hooks, MCP, and agent assets

3. **Project runtime layer**
   - initializes `.elf/` and `AGENTS.md` inside a repo

### 3.2 Public commands

```bash
elf global install codex
elf global install cursor
elf global install all

elf global update codex
elf global update cursor
elf global update all

elf global doctor codex --strict
elf global doctor cursor --strict
elf global doctor all --strict

elf global uninstall codex
elf global uninstall cursor
elf global uninstall all
```

The project runtime remains:

```bash
elf init
elf run ...
elf resume ...
elf review ...
elf verify ...
elf doctor --strict
```

### 3.3 Runtime contract

Global installation prepares the host only.

It does not:

- create `.elf/` across all folders
- merge workflow histories across projects
- replace `elf init`

When a globally installed host is used in a project without `.elf/`, the runtime contract is:

- detect missing runtime
- prompt or guide the user toward `elf init`
- optionally support an assisted bootstrap later

---

## 4. Host-Specific Surfaces

### 4.1 Codex

Codex supports stable user-level install surfaces under `~/.codex/`.

The global adapter should target:

- `~/.codex/rules/`
- `~/.codex/skills/`
- `~/.codex/agents/`
- `~/.codex/AGENTS.md` or a namespaced inclusion strategy

Global ELF metadata should live under:

- `~/.codex/.elf-global.json`

Codex is the cleaner global-install target because the install surfaces already map naturally to its rules/skills/agents model.

### 4.2 Cursor

Cursor exposes stable user-level surfaces under `~/.cursor/`.

The global adapter should target:

- `~/.cursor/rules/`
- `~/.cursor/mcp.json`
- `~/.cursor/hooks.json`

Global ELF metadata should live under:

- `~/.cursor/.elf-global.json`

Cursor is viable, but more sensitive because `mcp.json` and `hooks.json` are shared merge points rather than dedicated ELF-owned directories.

---

## 5. Merge and Ownership Model

### 5.1 Namespaced ownership

Any ELF-managed global asset must be namespaced and discoverable.

Examples:

- `elf-*.mdc`
- `elf-*` MCP server names
- `elf-*` hook identifiers where supported
- namespaced rule/skill/agent filenames

### 5.2 Shared-file merge rules

For shared config files such as:

- `~/.cursor/mcp.json`
- `~/.cursor/hooks.json`

ELF must:

- parse existing content
- insert only ELF-owned blocks
- preserve unrelated user config
- record ownership in the global manifest
- remove only ELF-owned entries during uninstall

Blind overwrite is forbidden.

### 5.3 Uninstall safety

Uninstall must only remove:

- ELF-managed files
- ELF-managed JSON entries
- ELF-managed hook references

It must never infer ownership from "looks similar" heuristics alone.

---

## 6. Global Manifest

Each host gets a dedicated manifest:

- `~/.codex/.elf-global.json`
- `~/.cursor/.elf-global.json`

The manifest records:

- schema version
- ELF version
- host
- managed file paths
- managed shared-config entries
- install time
- last update time

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "host": "cursor",
  "elfVersion": "0.1.0",
  "managedPaths": [
    "~/.cursor/rules/elf-global.mdc"
  ],
  "managedEntries": {
    "mcpServers": ["elf"],
    "hooks": ["elf-beforeSubmitPrompt"]
  }
}
```

The manifest is the contract for:

- doctor
- update
- uninstall
- drift detection

---

## 7. Doctor Model

### 7.1 Global doctor

`elf global doctor <host>` validates host-global setup.

It checks:

- expected files exist
- manifests are readable
- shared-file entries are present and well-formed
- legacy/conflicting files are absent or flagged
- host-global installation can be updated safely

### 7.2 Project doctor

`elf doctor` remains the validator for:

- `.elf/`
- runtime metadata
- run state integrity
- project-local workflow assets

This distinction must be explicit in docs and CLI output:

- `global doctor` validates hosts
- `doctor` validates projects

---

## 8. Migration Strategy

### 8.1 Current state

ELF already supports project-local adapter installation for:

- Cursor
- Codex

It also retains a legacy Cursor-first compatibility bundle.

### 8.2 v1 migration rules

The new global installer must:

- coexist with project-local adapters
- not overwrite local project adapters silently
- not create duplicate conflicting rules when both scopes exist
- warn when both global and local adapter layers are active

### 8.3 Warning policy

If both are present:

- host-global adapter active
- project-local adapter active

The doctor should surface:

- a warning in non-strict mode
- a reviewable note in strict mode unless the combination is actually conflicting

This keeps the migration path usable while preventing hidden duplication.

---

## 9. V1 Scope

### 9.1 Included

- `elf global install/update/doctor/uninstall codex`
- `elf global install/update/doctor/uninstall cursor`
- host-specific manifests
- namespaced global assets
- shared-file merge logic for Cursor
- project-local runtime kept in `.elf/`
- documentation clarifying the host/runtime boundary

### 9.2 Deferred

- silent auto-bootstrap in arbitrary folders
- cross-project global run state
- multi-user or enterprise global installers
- cloud-synced host profiles
- GUI management of global installs
- full snapshot rollback system

---

## 10. Recommendation

ELF should ship a **host-global, runtime-local** installer model.

In practice:

1. `npm install -g elf-orchestrator`
2. `elf global install codex|cursor|all`
3. `elf init` inside each project
4. `elf run`, `elf review`, and `elf verify` operate against that project's `.elf/`

This gives users the global installation experience they want without compromising the orchestrator-first design.
