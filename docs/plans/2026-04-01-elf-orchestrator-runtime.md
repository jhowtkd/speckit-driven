# ELF Orchestrator Runtime Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Cursor-first kit with an orchestrator-first ELF runtime that owns workflow state, verification, and governance, while exposing thin adapters for Cursor and Codex.

**Architecture:** Build the new ELF runtime alongside the existing package first, then migrate the current installer logic into adapter-specific commands rather than rewriting everything at once. The runtime will live under `.elf/`, expose a first-party CLI plus a local MCP server, and treat Cursor and Codex as installable clients that forward authority to the runtime.

**Tech Stack:** TypeScript (CommonJS), Node 18+, Commander, `node:test`, existing file-install helpers, one TOML parser for `.elf/config.toml`, and `@modelcontextprotocol/sdk` for the local MCP bridge.

---

## Preflight

Before implementation, create a dedicated worktree so the migration is isolated from the already-dirty main checkout.

Run:

```bash
git worktree add ../elf-orchestrator-v1 -b codex/elf-orchestrator-v1 HEAD
cd ../elf-orchestrator-v1
git status --short
```

Expected:

- new worktree created
- branch `codex/elf-orchestrator-v1`
- clean worktree before feature edits

Use these skills during execution:

- [$test-driven-development](/Users/jhonatan/.agents/superpowers/skills/test-driven-development/SKILL.md)
- [$verification-before-completion](/Users/jhonatan/.agents/superpowers/skills/verification-before-completion/SKILL.md)
- [$requesting-code-review](/Users/jhonatan/.agents/superpowers/skills/requesting-code-review/SKILL.md)

---

## Dependency overview

```text
Task 1 (package/CLI identity)
  ↓
Task 2 (runtime asset bundle + loaders)
  ↓
Task 3 (elf init bootstrap)
  ↓
Task 4 (intent + workflow resolution)
  ↓
Task 5 (artifact store + run store + chain engine)
  ↓
Task 6 (runtime commands)
  ↓
Task 7 (local MCP server)
  ↓
Task 8 (Cursor adapter)
  ↓
Task 9 (Codex adapter)
  ↓
Task 10 (docs + full verification)
```

---

### Task 1: Rebrand the package surface to ELF while preserving a compatibility alias

**Files:**

- Modify: `package.json`
- Modify: `src/cli.ts`
- Create: `bin/elf.js`
- Modify: `bin/spec-driven-kit.js`
- Test: `src/test/cli-identity.test.ts`

**Step 1: Write the failing CLI identity test**

Add a test that expects:

- `node bin/elf.js --version` to print the package version
- the main CLI description to mention `ELF`
- `node bin/spec-driven-kit.js --version` to keep working as a compatibility alias

Suggested test shape:

```ts
test("ELF CLI identity", () => {
  const out = execFileSync(process.execPath, [binPath, "--version"], { encoding: "utf8" });
  assert.match(out, /\d+\.\d+\.\d+/);
});
```

**Step 2: Run the test to verify it fails**

Run:

```bash
npm run build && node --test dist/test/cli-identity.test.js
```

Expected:

- FAIL because `bin/elf.js` does not exist yet

**Step 3: Implement the rename and compatibility layer**

- change `package.json` name/description/keywords to ELF-oriented wording
- add `bin.elf`
- keep `bin.spec-driven-kit` temporarily as a compatibility alias
- update `src/cli.ts` program name and description

**Step 4: Run the test again**

Run:

```bash
npm run build && node --test dist/test/cli-identity.test.js
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add package.json src/cli.ts bin/elf.js bin/spec-driven-kit.js src/test/cli-identity.test.ts
git commit -m "feat: introduce ELF CLI identity"
```

---

### Task 2: Add the default ELF runtime asset bundle and path loaders

**Files:**

- Create: `assets/elf/config.toml`
- Create: `assets/elf/workflows/task.json`
- Create: `assets/elf/workflows/phase.json`
- Create: `assets/elf/workflows/epic.json`
- Create: `assets/elf/workflows/review.json`
- Create: `assets/elf/workflows/debug.json`
- Create: `assets/elf/workflows/ship.json`
- Create: `assets/elf/templates/spec-template.md`
- Create: `assets/elf/templates/research-template.md`
- Create: `assets/elf/templates/plan-template.md`
- Create: `assets/elf/templates/tasks-template.md`
- Create: `assets/elf/templates/verification-template.md`
- Create: `assets/elf/templates/state-template.json`
- Modify: `src/core/paths.ts`
- Create: `src/core/runtime/defaults.ts`
- Create: `src/core/runtime/workflow-loader.ts`
- Test: `src/test/runtime-assets.test.ts`

**Step 1: Write the failing asset-loader test**

Assert that the runtime can resolve bundled ELF assets and load six workflow definitions.

Suggested API:

```ts
const defs = loadBundledWorkflowDefinitions();
assert.deepStrictEqual(defs.map((d) => d.id), [
  "task", "phase", "epic", "review", "debug", "ship",
]);
```

**Step 2: Run the test to verify it fails**

Run:

```bash
npm run build && node --test dist/test/runtime-assets.test.js
```

Expected:

- FAIL because `assets/elf` and loader modules do not exist yet

**Step 3: Add the asset bundle and loader**

- store workflow definitions as JSON to keep parsing light
- keep `.elf/config.toml` as the only TOML runtime config file
- expose helpers such as:

```ts
export function getAssetsElfDir(): string;
export function loadBundledWorkflowDefinitions(): WorkflowDefinition[];
export function loadBundledRuntimeTemplates(): RuntimeTemplateMap;
```

**Step 4: Run the test again**

Run:

```bash
npm run build && node --test dist/test/runtime-assets.test.js
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add assets/elf src/core/paths.ts src/core/runtime/defaults.ts src/core/runtime/workflow-loader.ts src/test/runtime-assets.test.ts
git commit -m "feat: add bundled ELF runtime assets"
```

---

### Task 3: Bootstrap `.elf/` projects with `elf init`

**Files:**

- Create: `src/commands/init.ts`
- Create: `src/core/runtime/config.ts`
- Create: `src/core/runtime/project-bootstrap.ts`
- Modify: `src/cli.ts`
- Modify: `src/core/install-files.ts`
- Modify: `src/core/install-agents.ts`
- Modify: `src/core/update-assets.ts`
- Modify: `src/core/versioning.ts`
- Test: `src/test/init-runtime.test.ts`

**Step 1: Write the failing bootstrap test**

Assert that:

- `elf init --allow-anywhere` creates `.elf/config.toml`
- `.elf/workflows/` and `.elf/templates/` are populated
- `AGENTS.md` is created at project root if missing
- runtime metadata is written under `.elf/state/metadata.json`

**Step 2: Run the test to verify it fails**

Run:

```bash
npm run build && node --test dist/test/init-runtime.test.js
```

Expected:

- FAIL because `elf init` is not implemented

**Step 3: Implement a bundle-agnostic bootstrap layer**

Generalize the current install helpers so they can copy either:

- `assets/elf` → `.elf`
- adapter bundles → host-specific directories

Suggested signatures:

```ts
export function installBundleFiles(opts: {
  sourceDir: string;
  targetDir: string;
  force: boolean;
}): InstallReport;

export function writeRuntimeMeta(stateDir: string, version: string): void;
```

**Step 4: Wire `elf init` into the CLI**

- add `init`
- preserve `install/update/doctor` only as adapter-oriented surfaces for now
- make `elf init` the recommended entrypoint in help output

**Step 5: Run the test again**

Run:

```bash
npm run build && node --test dist/test/init-runtime.test.js
```

Expected:

- PASS

**Step 6: Commit**

```bash
git add src/commands/init.ts src/cli.ts src/core/install-files.ts src/core/install-agents.ts src/core/update-assets.ts src/core/versioning.ts src/core/runtime/config.ts src/core/runtime/project-bootstrap.ts src/test/init-runtime.test.ts
git commit -m "feat: add elf init runtime bootstrap"
```

---

### Task 4: Implement intent normalization and workflow resolution

**Files:**

- Create: `src/core/runtime/types.ts`
- Create: `src/core/runtime/intent.ts`
- Create: `src/core/runtime/workflow-resolver.ts`
- Create: `src/core/runtime/policy.ts`
- Test: `src/test/workflow-resolver.test.ts`

**Step 1: Write the failing resolver tests**

Cover at least:

- plain feature request → `phase`
- small bounded fix → `task`
- bug report with failure language → `debug`
- review request → `review`
- large redesign or initiative → `epic`

Suggested API:

```ts
const result = resolveWorkflow({
  prompt: "review this branch for regressions",
  hasExistingSpec: false,
});
assert.strictEqual(result.workflowId, "review");
```

**Step 2: Run the test to verify it fails**

Run:

```bash
npm run build && node --test dist/test/workflow-resolver.test.js
```

Expected:

- FAIL because resolver modules do not exist

**Step 3: Implement the canonical types**

Define:

```ts
export type ElfIntent =
  | "new-task"
  | "new-phase"
  | "new-epic"
  | "continue-run"
  | "verify-run"
  | "review-change"
  | "debug-issue"
  | "ship-phase";
```

Also define:

- workflow definition shape
- risk class (`low`, `medium`, `high`)
- host capability shape

**Step 4: Implement normalization and resolver logic**

Keep the first version deterministic and rule-based. Avoid LLM-dependent routing in core runtime logic.

**Step 5: Run the test again**

Run:

```bash
npm run build && node --test dist/test/workflow-resolver.test.js
```

Expected:

- PASS

**Step 6: Commit**

```bash
git add src/core/runtime/types.ts src/core/runtime/intent.ts src/core/runtime/workflow-resolver.ts src/core/runtime/policy.ts src/test/workflow-resolver.test.ts
git commit -m "feat: add workflow intent normalization"
```

---

### Task 5: Implement the artifact store, run store, and chain engine skeleton

**Files:**

- Create: `src/core/runtime/artifact-store.ts`
- Create: `src/core/runtime/run-store.ts`
- Create: `src/core/runtime/context-builder.ts`
- Create: `src/core/runtime/chain-engine.ts`
- Test: `src/test/run-store.test.ts`
- Test: `src/test/chain-engine.test.ts`

**Step 1: Write the failing store tests**

Cover:

- create phase folder with durable artifacts
- create run folder with operational state
- resume run from saved state
- advance one workflow node and persist the transition

Suggested API:

```ts
const run = createRun({
  cwd,
  workflowId: "phase",
  phaseId: "042-user-auth",
});
assert.strictEqual(run.status, "pending");
```

**Step 2: Run the tests to verify they fail**

Run:

```bash
npm run build && node --test dist/test/run-store.test.js dist/test/chain-engine.test.js
```

Expected:

- FAIL because runtime stores do not exist yet

**Step 3: Implement durable and operational storage**

Persist:

- `.elf/phases/<phase-id>/...`
- `.elf/runs/<run-id>/run.json`
- `.elf/runs/<run-id>/events.jsonl`
- `.elf/state/current-run.json`

**Step 4: Implement the first chain engine**

Support these transitions only:

- `pending` → `active`
- `active` → `waiting-verification`
- `waiting-verification` → `completed`
- `waiting-verification` → `reopened`

Do not add parallel wave scheduling yet; only model the state transitions required to unlock later tasks.

**Step 5: Run the tests again**

Run:

```bash
npm run build && node --test dist/test/run-store.test.js dist/test/chain-engine.test.js
```

Expected:

- PASS

**Step 6: Commit**

```bash
git add src/core/runtime/artifact-store.ts src/core/runtime/run-store.ts src/core/runtime/context-builder.ts src/core/runtime/chain-engine.ts src/test/run-store.test.ts src/test/chain-engine.test.ts
git commit -m "feat: add elf artifact and run stores"
```

---

### Task 6: Add first-party runtime commands for `run`, `resume`, `review`, `verify`, and `doctor`

**Files:**

- Create: `src/commands/run.ts`
- Create: `src/commands/resume.ts`
- Create: `src/commands/review.ts`
- Create: `src/commands/verify.ts`
- Modify: `src/commands/doctor.ts`
- Modify: `src/cli.ts`
- Create: `src/core/runtime/verifier.ts`
- Test: `src/test/cli-runtime.test.ts`

**Step 1: Write the failing CLI runtime test**

Cover:

- `elf run --workflow phase --title "User auth"` creates phase + run state
- `elf resume <run-id>` reloads existing run state
- `elf review <path-or-run-id>` prints findings scaffold
- `elf verify <run-id>` updates verifier result
- `elf doctor` checks `.elf/` runtime files

**Step 2: Run the test to verify it fails**

Run:

```bash
npm run build && node --test dist/test/cli-runtime.test.js
```

Expected:

- FAIL because runtime commands are not exposed

**Step 3: Implement minimal command handlers**

Suggested signatures:

```ts
export function runElfWorkflow(cwd: string, opts: RunOptions): void;
export function resumeElfRun(cwd: string, runId: string): void;
export function verifyElfRun(cwd: string, runId: string): VerifyResult;
```

**Step 4: Teach `doctor` about the ELF runtime**

Runtime doctor should validate:

- `.elf/config.toml`
- required workflow definitions
- required templates
- metadata under `.elf/state/`

Keep adapter doctor separate so host bundles can be checked independently later.

**Step 5: Run the test again**

Run:

```bash
npm run build && node --test dist/test/cli-runtime.test.js
```

Expected:

- PASS

**Step 6: Commit**

```bash
git add src/commands/run.ts src/commands/resume.ts src/commands/review.ts src/commands/verify.ts src/commands/doctor.ts src/cli.ts src/core/runtime/verifier.ts src/test/cli-runtime.test.ts
git commit -m "feat: add elf runtime commands"
```

---

### Task 7: Add the local MCP server as the primary host bridge

**Files:**

- Modify: `package.json`
- Create: `src/commands/mcp-serve.ts`
- Create: `src/mcp/server.ts`
- Create: `src/mcp/tools.ts`
- Test: `src/test/mcp-server.test.ts`

**Step 1: Write the failing MCP contract test**

Test the tool registry without requiring an editor host:

- `elf_run`
- `elf_resume`
- `elf_verify`
- `elf_review`
- `elf_status`

Suggested assertion:

```ts
const tools = buildElfMcpTools();
assert.deepStrictEqual(tools.map((t) => t.name), [
  "elf_run",
  "elf_resume",
  "elf_verify",
  "elf_review",
  "elf_status",
]);
```

**Step 2: Run the test to verify it fails**

Run:

```bash
npm install
npm run build && node --test dist/test/mcp-server.test.js
```

Expected:

- FAIL because MCP server files and dependency are missing

**Step 3: Add the MCP dependency and server implementation**

- add `@modelcontextprotocol/sdk`
- expose `elf mcp serve`
- keep the first version local-only and stdio-oriented

**Step 4: Run the test again**

Run:

```bash
npm run build && node --test dist/test/mcp-server.test.js
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add package.json package-lock.json src/commands/mcp-serve.ts src/mcp/server.ts src/mcp/tools.ts src/test/mcp-server.test.ts
git commit -m "feat: add local ELF MCP server"
```

---

### Task 8: Convert the current Cursor kit into an ELF-backed Cursor adapter

**Files:**

- Create: `assets/adapters/cursor/commands/spec-close.md`
- Create: `assets/adapters/cursor/commands/spec-execute.md`
- Create: `assets/adapters/cursor/commands/spec-plan.md`
- Create: `assets/adapters/cursor/commands/spec-research.md`
- Create: `assets/adapters/cursor/commands/spec-start.md`
- Create: `assets/adapters/cursor/commands/spec-verify.md`
- Create: `assets/adapters/cursor/rules/00-using-elf.mdc`
- Create: `assets/adapters/cursor/rules/10-brainstorming-spec.mdc`
- Create: `assets/adapters/cursor/rules/20-targeted-research.mdc`
- Create: `assets/adapters/cursor/rules/30-writing-plan.mdc`
- Create: `assets/adapters/cursor/rules/40-executing-plan.mdc`
- Create: `assets/adapters/cursor/rules/50-verification-before-completion.mdc`
- Create: `assets/adapters/cursor/rules/60-closing-feature.mdc`
- Create: `assets/adapters/cursor/templates/*`
- Create: `src/commands/adapter-install.ts`
- Create: `src/commands/adapter-update.ts`
- Create: `src/commands/adapter-doctor.ts`
- Create: `src/core/adapters/cursor.ts`
- Modify: `src/cli.ts`
- Test: `src/test/cursor-adapter.test.ts`
- Test: `src/test/e2e.test.ts`

**Step 1: Write the failing Cursor adapter test**

Cover:

- `elf adapter install cursor --allow-anywhere`
- `.cursor/rules/*.mdc` written from adapter bundle
- `.cursor/commands/*.md` written from adapter bundle
- generated guidance points Cursor back to `elf` runtime commands and MCP server rather than treating rules as the runtime

**Step 2: Run the tests to verify they fail**

Run:

```bash
npm run build && node --test dist/test/cursor-adapter.test.js dist/test/e2e.test.js
```

Expected:

- FAIL because adapter command surface and asset location do not exist

**Step 3: Move current Cursor assets into adapter space**

- keep content short and host-specific
- remove runtime authority from rules
- make rules/commands instruct Cursor to use ELF runtime, not to reimplement it

**Step 4: Reuse the generalized bundle installer**

Expose:

```ts
elf adapter install cursor
elf adapter update cursor
elf adapter doctor cursor
```

**Step 5: Run the tests again**

Run:

```bash
npm run build && node --test dist/test/cursor-adapter.test.js dist/test/e2e.test.js
```

Expected:

- PASS

**Step 6: Commit**

```bash
git add assets/adapters/cursor src/commands/adapter-install.ts src/commands/adapter-update.ts src/commands/adapter-doctor.ts src/core/adapters/cursor.ts src/cli.ts src/test/cursor-adapter.test.ts src/test/e2e.test.ts
git commit -m "feat: add ELF-backed Cursor adapter"
```

---

### Task 9: Add the first Codex adapter bundle and installer

**Files:**

- Create: `assets/adapters/codex/skills/elf-run/SKILL.md`
- Create: `assets/adapters/codex/skills/elf-review/SKILL.md`
- Create: `assets/adapters/codex/skills/elf-verify/SKILL.md`
- Create: `assets/adapters/codex/agents/verifier.toml`
- Create: `assets/adapters/codex/hooks.json`
- Create: `assets/adapters/codex/rules/default.rules`
- Create: `src/core/adapters/codex.ts`
- Modify: `src/commands/adapter-install.ts`
- Modify: `src/commands/adapter-update.ts`
- Modify: `src/commands/adapter-doctor.ts`
- Test: `src/test/codex-adapter.test.ts`

**Step 1: Write the failing Codex adapter test**

Cover:

- `elf adapter install codex --allow-anywhere`
- `.agents/skills/elf-run/SKILL.md` exists
- `.codex/hooks.json` exists
- `codex/rules/default.rules` exists
- generated instructions point Codex to the local ELF runtime and MCP bridge

**Step 2: Run the test to verify it fails**

Run:

```bash
npm run build && node --test dist/test/codex-adapter.test.js
```

Expected:

- FAIL because no Codex adapter bundle exists

**Step 3: Implement the adapter bundle**

Keep v1 intentionally small:

- skills are entrypoints into ELF workflows
- hooks and rules are optional guardrails
- do not attempt a full Codex plugin marketplace package in the first cut

**Step 4: Run the test again**

Run:

```bash
npm run build && node --test dist/test/codex-adapter.test.js
```

Expected:

- PASS

**Step 5: Commit**

```bash
git add assets/adapters/codex src/core/adapters/codex.ts src/commands/adapter-install.ts src/commands/adapter-update.ts src/commands/adapter-doctor.ts src/test/codex-adapter.test.ts
git commit -m "feat: add ELF-backed Codex adapter"
```

---

### Task 10: Update docs, examples, and run the full verification matrix

**Files:**

- Modify: `README.md`
- Modify: `docs/TECH.md`
- Modify: `examples/minimal-project/README.md`
- Create: `docs/plans/2026-04-01-elf-migration-notes.md`
- Modify: `scripts/validate-rules.mjs`

**Step 1: Update the top-level documentation**

Document:

- ELF runtime concepts
- `.elf/` layout
- CLI usage
- MCP bridge
- adapter install flows for Cursor and Codex
- migration path from `spec-driven-kit`

**Step 2: Update the static validator**

Make it validate:

- runtime workflow bundle presence
- Cursor adapter rule invariants
- Codex adapter bundle file presence

**Step 3: Run the complete verification suite**

Run:

```bash
npm run build
npm test
node dist/cli.js init --allow-anywhere
node dist/cli.js doctor
node dist/cli.js adapter install cursor --allow-anywhere
node dist/cli.js adapter doctor cursor
node dist/cli.js adapter install codex --allow-anywhere
node dist/cli.js adapter doctor codex
```

Expected:

- build passes
- test suite passes
- runtime bootstrap succeeds
- both adapters install and validate cleanly

**Step 4: Final code review pass**

Use [$requesting-code-review](/Users/jhonatan/.agents/superpowers/skills/requesting-code-review/SKILL.md) before declaring the migration ready.

**Step 5: Commit**

```bash
git add README.md docs/TECH.md examples/minimal-project/README.md docs/plans/2026-04-01-elf-migration-notes.md scripts/validate-rules.mjs
git commit -m "docs: document ELF runtime and adapter migration"
```

---

## Notes for the implementer

- Do not delete the old Cursor-first code path until the new adapter commands and tests pass.
- Prefer adapting `install-files`, `update-assets`, and `doctor-check` into generic bundle utilities instead of rewriting them from scratch.
- Keep the runtime deterministic. Routing logic should be rule-based in v1, not model-based.
- Treat MCP as the main integration bridge. Host rules/hooks remain optional enforcement layers.
- Keep each adapter thin. If host-specific files start owning workflow semantics, move that logic back into the ELF runtime.
