# ELF Global Installer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a safe host-global installer for Codex and Cursor while preserving the project-local ELF runtime in `.elf/`.

**Architecture:** Extend the existing adapter system with a second installation scope, `global`, backed by host-specific manifests in the user's home directory. Reuse the current adapter bundles where possible, but introduce host-global path resolution, shared-file merge logic, separate doctor/update/uninstall flows, and explicit docs so host setup and project runtime stay distinct.

**Tech Stack:** TypeScript, Commander CLI, Node.js filesystem APIs, existing ELF adapter/runtime code, JSON/TOML config files, Node test runner.

---

### Task 1: Capture the new CLI surface for global installs

**Files:**
- Modify: `src/cli.ts`
- Test: `src/test/global-cli.test.ts`

**Step 1: Write the failing test**

Add a CLI test that asserts these commands exist in `--help` output:

- `global install`
- `global update`
- `global doctor`
- `global uninstall`

Also assert that `doctor` and `global doctor` are described differently.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/global-cli.test.js`
Expected: FAIL because the global command tree does not exist yet.

**Step 3: Write minimal implementation**

Add a `global` command group in `src/cli.ts` with placeholder handlers wired for:

- `install`
- `update`
- `doctor`
- `uninstall`

Do not implement behavior yet; only make the CLI surface real.

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/global-cli.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/cli.ts src/test/global-cli.test.ts
git commit -m "feat: add ELF global CLI surface"
```

### Task 2: Add global host path resolution and manifest primitives

**Files:**
- Modify: `src/core/paths.ts`
- Create: `src/core/adapters/global-manifest.ts`
- Create: `src/test/global-manifest.test.ts`

**Step 1: Write the failing test**

Add tests that resolve expected global paths for:

- Codex manifest: `~/.codex/.elf-global.json`
- Cursor manifest: `~/.cursor/.elf-global.json`
- Codex global roots: `rules`, `skills`, `agents`
- Cursor global roots: `rules`, `mcp.json`, `hooks.json`

Add read/write tests for manifest persistence.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/global-manifest.test.js`
Expected: FAIL because the path helpers and manifest module do not exist.

**Step 3: Write minimal implementation**

Add global path helpers in `src/core/paths.ts` and implement a `global-manifest.ts` module with:

- manifest types
- `loadGlobalManifest()`
- `writeGlobalManifest()`
- `deleteGlobalManifest()`

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/global-manifest.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/paths.ts src/core/adapters/global-manifest.ts src/test/global-manifest.test.ts
git commit -m "feat: add ELF global manifest primitives"
```

### Task 3: Add a global adapter contract shared by Codex and Cursor

**Files:**
- Create: `src/core/adapters/global-types.ts`
- Modify: `src/core/adapters/codex.ts`
- Modify: `src/core/adapters/cursor.ts`
- Test: `src/test/global-adapter-contract.test.ts`

**Step 1: Write the failing test**

Add a test that asserts both adapters can produce:

- install plan
- doctor plan
- uninstall plan

for both local and global scopes without ambiguous path ownership.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/global-adapter-contract.test.js`
Expected: FAIL because adapters only understand project-local scope today.

**Step 3: Write minimal implementation**

Introduce shared global adapter types and teach both adapter cores to accept:

- `scope: "project" | "global"`

Keep existing project-local behavior unchanged.

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/global-adapter-contract.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/adapters/global-types.ts src/core/adapters/codex.ts src/core/adapters/cursor.ts src/test/global-adapter-contract.test.ts
git commit -m "refactor: add adapter scope contract for global installs"
```

### Task 4: Implement global Codex install/update/doctor/uninstall

**Files:**
- Modify: `src/core/adapters/codex.ts`
- Create: `src/test/codex-global-adapter.test.ts`

**Step 1: Write the failing test**

Add tests for:

- `global install codex` writing to a temp home-root shaped like `~/.codex`
- `global doctor codex --strict` passing after install
- `global update codex` repairing partial global installs
- `global uninstall codex` removing only ELF-managed files

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/codex-global-adapter.test.js`
Expected: FAIL because global scope behavior does not exist.

**Step 3: Write minimal implementation**

Implement global Codex adapter behavior with:

- namespaced files under global Codex roots
- manifest persistence
- partial-install recovery
- strict doctor checks
- uninstall using manifest ownership

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/codex-global-adapter.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/adapters/codex.ts src/test/codex-global-adapter.test.ts
git commit -m "feat: add global Codex adapter install flow"
```

### Task 5: Implement shared-file merge logic for global Cursor install

**Files:**
- Create: `src/core/adapters/cursor-global-merge.ts`
- Create: `src/test/cursor-global-merge.test.ts`

**Step 1: Write the failing test**

Add merge tests for:

- inserting ELF MCP entries into an existing `mcp.json`
- inserting ELF hooks into an existing `hooks.json`
- preserving unrelated user entries
- removing only ELF-managed entries on uninstall
- detecting malformed JSON and surfacing a safe error

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/cursor-global-merge.test.js`
Expected: FAIL because no merge helper exists yet.

**Step 3: Write minimal implementation**

Implement a Cursor global merge helper that:

- parses existing shared JSON safely
- merges namespaced ELF entries
- tracks managed keys for uninstall/doctor
- never overwrites unrelated config

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/cursor-global-merge.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/adapters/cursor-global-merge.ts src/test/cursor-global-merge.test.ts
git commit -m "feat: add safe global Cursor merge logic"
```

### Task 6: Implement global Cursor install/update/doctor/uninstall

**Files:**
- Modify: `src/core/adapters/cursor.ts`
- Create: `src/test/cursor-global-adapter.test.ts`

**Step 1: Write the failing test**

Add tests for:

- `global install cursor` writing rules plus merged `mcp.json` and `hooks.json`
- `global doctor cursor --strict` passing after install
- `global update cursor` repairing a partial install
- `global uninstall cursor` removing only ELF-managed paths and entries
- doctor failing when legacy conflicting artifacts remain

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/cursor-global-adapter.test.js`
Expected: FAIL because global Cursor install logic is not implemented.

**Step 3: Write minimal implementation**

Implement global Cursor adapter behavior using the merge helper plus:

- namespaced rule assets
- manifest ownership
- strict doctor output
- safe uninstall/update semantics

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/cursor-global-adapter.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/adapters/cursor.ts src/test/cursor-global-adapter.test.ts
git commit -m "feat: add global Cursor adapter install flow"
```

### Task 7: Wire global commands to real handlers

**Files:**
- Create: `src/commands/global-install.ts`
- Create: `src/commands/global-update.ts`
- Create: `src/commands/global-doctor.ts`
- Create: `src/commands/global-uninstall.ts`
- Modify: `src/cli.ts`
- Test: `src/test/global-cli-runtime.test.ts`

**Step 1: Write the failing test**

Add command-level tests that run:

- `elf global install codex`
- `elf global install cursor`
- `elf global doctor codex --strict`
- `elf global doctor cursor --strict`

against temp home directories and assert clean output.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/global-cli-runtime.test.js`
Expected: FAIL because the command handlers are placeholders.

**Step 3: Write minimal implementation**

Wire the new CLI commands to the adapter cores and ensure:

- clean success output
- clean error output
- host-specific doctor text
- no confusion with project-local `elf doctor`

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/global-cli-runtime.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/commands/global-install.ts src/commands/global-update.ts src/commands/global-doctor.ts src/commands/global-uninstall.ts src/cli.ts src/test/global-cli-runtime.test.ts
git commit -m "feat: wire ELF global adapter commands"
```

### Task 8: Add migration warnings for local-plus-global overlap

**Files:**
- Modify: `src/core/adapters/codex.ts`
- Modify: `src/core/adapters/cursor.ts`
- Modify: `src/commands/global-doctor.ts`
- Create: `src/test/global-migration-warnings.test.ts`

**Step 1: Write the failing test**

Add tests that simulate:

- global adapter present
- project-local adapter also present

and assert doctor reports a warning instead of a false clean bill of health.

**Step 2: Run test to verify it fails**

Run: `npm run build && node --test dist/test/global-migration-warnings.test.js`
Expected: FAIL because overlap warnings do not exist yet.

**Step 3: Write minimal implementation**

Detect local/global overlap and surface:

- warning output in normal mode
- explicit note in strict mode

without blocking valid mixed migration setups.

**Step 4: Run test to verify it passes**

Run: `npm run build && node --test dist/test/global-migration-warnings.test.js`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core/adapters/codex.ts src/core/adapters/cursor.ts src/commands/global-doctor.ts src/test/global-migration-warnings.test.js
git commit -m "feat: warn on mixed local and global adapter installs"
```

### Task 9: Update docs and examples for the global installer model

**Files:**
- Modify: `README.md`
- Modify: `docs/TECH.md`
- Modify: `examples/minimal-project/README.md`
- Create: `docs/plans/2026-04-01-elf-global-installer-design.md`
- Test: documentation spot checks in `src/test/e2e.test.ts` if relevant

**Step 1: Write the failing doc expectation**

Add or update a lightweight test or scripted assertion if the repo already checks CLI/doc phrases. Otherwise document the exact phrases to update before editing.

Required doc outcomes:

- explain `npm install -g elf-orchestrator`
- explain `elf global install ...`
- explain that `.elf/` stays project-local
- distinguish `elf doctor` from `elf global doctor`

**Step 2: Run verification to confirm current docs are stale**

Run: `rg -n \"global install|global doctor|project-local|\\.elf\" README.md docs/TECH.md examples/minimal-project/README.md`
Expected: Missing or stale coverage for the new model.

**Step 3: Write minimal implementation**

Update docs to match the shipped contract and add a small end-to-end example:

```bash
npm install -g elf-orchestrator
elf global install all
cd my-project
elf init
elf run --workflow phase --title \"Demo feature\"
```

**Step 4: Run verification**

Run: `npm test && git diff --check`
Expected: PASS, no whitespace issues

**Step 5: Commit**

```bash
git add README.md docs/TECH.md examples/minimal-project/README.md docs/plans/2026-04-01-elf-global-installer-design.md
git commit -m "docs: add ELF global installer guidance"
```

### Task 10: Run full verification and prepare branch summary

**Files:**
- Modify: `tasks/lessons.md` if new review-driven lessons emerge
- Review: `package.json`, `src/`, `assets/`, `docs/`

**Step 1: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all pass

**Step 2: Perform manual spot checks**

Verify against temp home/project fixtures:

- `elf global install codex`
- `elf global install cursor`
- `elf global doctor all --strict`
- `elf init`
- `elf doctor --strict`

Expected:

- host-global and project-local doctors are distinct
- global installs do not create `.elf/`
- `elf init` still creates `.elf/`

**Step 3: Summarize behavior**

Prepare a concise summary covering:

- what global install changes
- what remains project-local
- migration warnings
- known deferred items

**Step 4: Commit**

```bash
git add .
git commit -m "chore: finalize ELF global installer rollout"
```
