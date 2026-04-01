# Cursor-first spec-driven kit — implementation plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate `spec-driven-kit` into a Cursor-first OSS workflow: `.cursor/rules` (`.mdc`), root `AGENTS.md`, optional beta commands, slim CLI (`install` / `update` / `doctor`), `assets/` as the only installable payload—per [docs/superpowers/specs/2026-03-31-cursor-spec-driven-kit-design.md](../superpowers/specs/2026-03-31-cursor-spec-driven-kit-design.md).

**Architecture:** Authoritative content lives under `assets/cursor/` (mirrored layout for install). Product repo also holds `agents/AGENTS.md` (canonical), `commands/` sources, `templates/` sources, `experimental/modes/` (not installed in v1), and `examples/minimal-project`. CLI copies/syncs assets and `AGENTS.md`; doctor validates presence and drift per §1.4 / §5.2 of the spec.

**Tech stack:** TypeScript (CommonJS `dist/`), Commander, Node 18+, npm package `spec-driven-kit`; validation script for CI (Node or small shell invoking `node`).

---

## Dependency overview

```text
spec + §1.4/§5.2 amendments (done in repo)
        ↓
Sprint 1: assets layout + rules 00–60 + AGENTS.md + templates (behavioral core)
        ↓
Sprint 2: install/update/doctor + paths + e2e smoke + remove new-feature from CLI
        ↓
Sprint 3: commands/, scripts/, examples/, OSS docs, CODEOWNERS, CI validator
```

**Rule:** Do not add features beyond the spec. **Priority:** rules + `AGENTS.md` before CLI polish before optional/experimental.

---

## Sprint 1 — Behavioral core (rules, AGENTS, templates)

**Objective:** A consumer project can copy or receive `assets/cursor/` and get correct agent behavior without the old global skill dependency.

### Task 1.1: Create `assets/cursor/rules/` skeleton

**Files:**

- Create: `assets/cursor/rules/00-using-spec-driven.mdc` … `60-closing-feature.mdc` (seven files).

**Steps:**

1. Add valid YAML frontmatter per Cursor Project Rules (`description` where Agent Requested; `alwaysApply: true` only on `00-*`).
2. Migrate text from `assets/cursor/runtime-constitution.md`, `prompts/*.md` per spec §3; embed **§1.4 semi-strict** profile in `00`.
3. Enforce hard gates from spec (plan + tasks before implementation; create missing artifacts from templates).
4. Add Agent Requested “Use when:” blocks for `10`, `20`, `30`.
5. Add execution subsection in `40` per spec §3.5.
6. Commit: `feat(rules): add spec-driven project rules 00–60`

**Acceptance:** Each `.mdc` parses as YAML + body; seven prefixes `00`–`60` exactly once; content matches spec §3 (no new methodology).

**Test (manual):** Open in Cursor; confirm `00` is Always; others appear as Agent Requested with readable descriptions.

---

### Task 1.2: Canonical `agents/AGENTS.md` + non-normative `docs/constitution.md`

**Files:**

- Create: `agents/AGENTS.md` (English, short: precedence user > rules > default; pointer to `.cursor/rules`; when to use spec-driven; link `docs/constitution.md`).
- Create: `docs/constitution.md` (English, human onboarding only—migrate/slim from `assets/cursor/constitution.md` ideas without duplicating gates that live in `00`).

**Acceptance:** Single canonical source for `AGENTS.md`; no second editable copy elsewhere in repo.

**Commit:** `docs: add AGENTS template and human constitution`

---

### Task 1.3: Templates under `assets/cursor/templates/`

**Files:**

- Keep or move: `spec-template.md`, `plan-template.md`, `tasks-template.md`, `research-template.md`, `verification-template.md`, `state-template.json` under `assets/cursor/templates/` (adjust paths if layout changes).

**Acceptance:** `spec-start` command (Sprint 3) can reference stable paths `.cursor/templates/*`.

**Commit:** `chore(templates): align template paths with assets layout`

---

### Task 1.4: Remove / replace legacy prompts and skill stub

**Files:**

- Remove or archive: `assets/cursor/prompts/*` once rules + commands cover flows (or keep read-only copy under `docs/legacy/` **only** if needed for attribution—prefer delete to avoid dual source).
- Replace: `assets/cursor/skills/spec-driven-mvp/SKILL.md` with minimal stub pointing to `.cursor/rules` and `AGENTS.md` **or** remove skill from bundle if redundant.

**Acceptance:** No reference to `~/.agents/skills/spec-driven-framework`.

**Commit:** `refactor(assets): drop global framework dependency from skill/prompts`

---

### Sprint 1 phase acceptance

- [ ] `doctor` (after Sprint 2) can list new paths; for now, folder exists and files are coherent.
- [ ] Spec §8 acceptance: rules modular; plan+tasks gate present in `00`/`30`.

---

## Sprint 2 — CLI: install, update, doctor, AGENTS copy

**Objective:** `npx spec-driven-kit install` lays down `.cursor/` + root `AGENTS.md`; `update`/`doctor` match spec §5.2 and §1.4.

### Task 2.1: Rename `init` → `install`, keep `init` alias

**Files:**

- Modify: `src/cli.ts` — register `install` with same handler as current `init`; `init` = deprecated alias (help text).
- Modify: `README.md` when Sprint 3 updates docs.

**Acceptance:** `spec-driven-kit install` works; `init` still works one release.

**Commit:** `feat(cli): add install command; keep init as alias`

---

### Task 2.2: Install `agents/AGENTS.md` → `./AGENTS.md`

**Files:**

- Modify: `src/commands/init.ts` (or renamed `install.ts`) and `src/core/install-files.ts` or adjacent helper.
- Add: package path resolution for `agents/AGENTS.md` relative to package root (new constant in `paths.ts`).

**Acceptance:** Fresh `install` creates/updates `./AGENTS.md` from canonical template (respect `--force` / skip rules consistent with `.cursor/`).

**Commit:** `feat(install): copy AGENTS.md to repository root`

---

### Task 2.3: Doctor — drift always checked; default warn, `--strict` fail

**Files:**

- Modify: `src/core/doctor-check.ts` — for each bundled file present on disk, **always** compare bytes when both exist; on diff: `warn` + track mismatch; if `strictContent`, treat mismatch as **error** for `ok` / exit code.
- Modify: `src/commands/doctor.ts` — label output: “Drift (warnings)” vs “Drift (strict failure)”; ensure missing `.cursor/` or missing required files → **always** exit 1.
- Extend checks: include **`AGENTS.md`** at cwd root in the bundle manifest (add `AGENTS.md` to list of expected files in doctor list—either bundle a copy under `assets/` for comparison or compare to `agents/AGENTS.md` from package; pick one approach and document in `docs/TECH.md`).

**Steps:**

1. Add failing test: temp project with drifted file → `doctor` exit 0 with warnings (no `--strict`).
2. Same fixture with `--strict` → exit 1.
3. Missing file → exit 1 always.

**Test:** `npm test` — extend `src/test/e2e.test.ts` or add `doctor.test.ts`.

**Commit:** `fix(doctor): warn on content drift by default; strict fails`

---

### Task 2.4: Remove `new feature` from CLI

**Files:**

- Modify: `src/cli.ts` — remove `new feature` command.
- Delete or relocate: `src/commands/new-feature.ts`, `src/core/feature-scaffold.ts` only if replaced by `scripts/` (Sprint 3); until script exists, keep code in `scripts/` as copy-paste or single `scripts/new-feature.mjs`.

**Acceptance:** `spec-driven-kit --help` shows only `install`, `update`, `doctor` (+ aliases).

**Commit:** `refactor(cli): remove new-feature from npm binary`

---

### Task 2.5: Asset manifest alignment

**Files:**

- Modify: `src/core/paths.ts`, install logic so **`assets/cursor/`** includes `rules/`, `commands/` (when added), `templates/`, `features/README.md`, etc.
- Update: `spec-driven-kit.json` / metadata if paths changed.

**Acceptance:** `install` + `doctor` agree on file list; e2e test passes.

**Commit:** `chore(assets): sync install manifest with new layout`

---

### Sprint 2 phase acceptance

- [ ] `npm run build && npm test` green.
- [ ] Manual: temp dir `install` → `.cursor/rules/*.mdc` + `AGENTS.md` present; `doctor` OK; intentional byte edit → warning only; `doctor --strict` fails.

---

## Sprint 3 — Commands, scripts, examples, OSS, CI, governance

### Task 3.1: `commands/` sources → `assets/cursor/commands/`

**Files:**

- Create: `commands/spec-start.md` … `spec-close.md` (six files) per spec §4; copy or symlink into `assets/cursor/commands/` for install (single source of truth: prefer authoring under `assets/cursor/commands/` **or** under repo root `commands/` with build copy—**pick one**; spec prefers product repo `commands/` as source—mirror in `assets` for current installer pattern).

**Acceptance:** After install, `.cursor/commands/*.md` exist; README states **beta**.

**Commit:** `feat(commands): add spec-* slash command templates`

---

### Task 3.2: Optional `scripts/` feature scaffold

**Files:**

- Create: `scripts/new-feature.mjs` (or `.ts` compiled—prefer simple `.mjs` with no build) implementing prior `new-feature` behavior (001–999, templates).

**Acceptance:** Documented in README under “Optional”; not in `bin/`.

**Commit:** `feat(scripts): optional feature scaffold script`

---

### Task 3.3: `experimental/modes/` (repo only)

**Files:**

- Create: `experimental/modes/spec-ask.md`, `spec-build.md`, `spec-verify.md` — reference-only presets; **not** in `assets/cursor/` install set.

**Acceptance:** Spec §6.2 satisfied.

**Commit:** `docs(experimental): add optional mode presets (not installed)`

---

### Task 3.4: `examples/minimal-project`

**Files:**

- Create: `examples/minimal-project/` with minimal `.cursor/rules` subset or pointer README “run install from parent package” + sample `features/001-demo/` filled minimally.

**Acceptance:** New contributor can open example and understand flow in &lt;5 minutes.

**Commit:** `docs(examples): add minimal-project example`

---

### Task 3.5: OSS files + README

**Files:**

- Create/update: `README.md` (quick install, beta matrix, `AGENTS.md` root requirement, `npx spec-driven-kit install`).
- Create: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md` (standard templates; adapt repo URLs).
- Keep: `LICENSE` (MIT).

**Commit:** `docs: oss readme and governance files`

---

### Task 3.6: `CODEOWNERS`

**Files:**

- Create: `.github/CODEOWNERS` or root `CODEOWNERS` per spec §6.1 paths (adjust to final file names).

**Commit:** `chore: add CODEOWNERS for core paths`

---

### Task 3.7: CI — build, test, smoke, rule validator

**Files:**

- Create: `scripts/validate-rules.mjs` (or `src/scripts/`) — checks: YAML frontmatter, required rule files `00`–`60`, `alwaysApply` on `00`, no dupes/gaps in numeric prefixes.
- Create: `.github/workflows/ci.yml` — run `npm ci`, `npm test`, smoke `install` to temp dir, `doctor`, run validator on `assets/cursor/rules`.

**Acceptance:** PR touching CODEOWNERS paths fails if rules invalid.

**Commit:** `ci: add workflow and rule static validation`

---

### Task 3.8: `docs/TECH.md` refresh

**Files:**

- Modify: `docs/TECH.md` — install layout, doctor semantics (§5.2), semi-strict profile pointer, beta surfaces.

**Commit:** `docs(tech): align technical decisions with cursor-first kit`

---

### Sprint 3 phase acceptance

- [ ] First OSS release checklist: README, CONTRIBUTING, SECURITY, CoC, LICENSE, example, CI green.
- [ ] Spec §7 deliverables all checked.

---

## Risks and mitigation

| Risk | Mitigation |
|------|------------|
| Cursor changes beta APIs | README + spec matrix; no install of `modes/` in v1. |
| Doctor noise on every local edit | Default drift = warn + exit 0; CI uses clean tree or documents `--strict` for maintainers. |
| Duplicate sources (`commands/` vs `assets/`) | Pick **one** authoring root; document in `docs/TECH.md`; single copy in install bundle. |
| Large diff hard to review | Land Sprint 1 in one PR or commit series; then CLI; then OSS/CI. |

---

## Out of scope (do not implement now)

- Custom Modes installed in consumer projects.
- Telemetry, analytics, or cloud sync.
- Merge/three-way for diverged templates beyond `update --force`.
- `doctor --fix` auto-repair (spec v1.1 idea only).
- Renaming npm package (unless maintainer decides explicitly).
- i18n of core rules (English only per spec).
- Full Superpowers skill parity outside documented Cursor surfaces.

---

## Suggested commit cadence

Frequent small commits per task above; tag `v2.0.0` or appropriate semver when OSS README and CI are complete (breaking: `init` naming, removed `new feature`, doctor behavior).

---

**Plan complete and saved to `docs/plans/2026-03-31-cursor-first-spec-driven-kit.md`.**

**Execution options:**

1. **Subagent-driven (this session)** — Use superpowers:subagent-driven-development: fresh subagent per task, review between tasks.  
2. **Parallel session** — New session with superpowers:executing-plans and checkpoints.

**Which approach do you want?**
