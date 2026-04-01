# Cursor-first spec-driven kit — design specification

**Status:** Approved for implementation (subject to maintainer review of this document).  
**Date:** 2026-03-31  
**Scope:** Migrate `spec-driven-kit` into an open-source, Cursor-native workflow product. The methodology stays aligned with the existing Spec-Driven Coding MVP; this document defines packaging, surfaces, and governance.

---

## 1. Goals and constraints

### 1.1 Objectives

- Ship a **spec-driven workflow** for Cursor using **documented, stable surfaces** first.
- Match **Superpowers-style** practical behavior where it does **not** depend on private or fragile mechanisms.
- Make **`.cursor/rules/*.mdc`** the operational core; use **`AGENTS.md` at the repository root** as a simple fallback.
- Keep the **npm CLI** as **installer / updater / doctor only** (`install`, `update`, `doctor`; `init` remains a **temporary alias** for `install`).
- Optimize for **open-source adoption**, clarity, and stability: short, modular files.

### 1.2 Non-goals

- Invent a new methodology beyond the current MVP flow.
- Depend on the CLI as the runtime “engine” of the workflow.
- Install **Custom Modes** presets into consumer projects in v1 (see §3.6).

### 1.3 Platform notes (public Cursor documentation)

| Surface | Location | Stability note |
|--------|-----------|----------------|
| Project Rules | `.cursor/rules`, `.mdc` files, `alwaysApply` / Agent Requested | Documented |
| Agent instructions | `AGENTS.md` at **repository root only** (documented limitation) | Documented |
| Custom commands | `.cursor/commands`, Markdown | **Beta** — call out in README and compatibility matrix |
| Custom Modes | Cursor product feature | **Beta** — no “stable product” promise for presets until the platform stabilizes |

### 1.4 Runtime defaults (agent enforcement profile)

**Default profile: semi-strict.**

- The workflow does **not** demand the full phase machinery for every trivial or single-file tweak.
- Apply **full spec-driven enforcement** (artifacts, gates, clarify/research when needed) when **any** of the following holds:
  - the request is **ambiguous** or underspecified;
  - scope is **medium or larger** (multi-file, new behavior, or non-trivial behavior change);
  - **technical risk** is material (new integration, unfamiliar subsystem, security- or data-sensitive change).

**Implementation note:** Encode this profile in **`00-using-spec-driven.mdc`** as a short, explicit subsection so agents route consistently without turning the product into “always maximal ceremony.”

---

## 2. Repository layout (source of truth)

### 2.1 Installable artifact authority

- **`assets/`** is the **only** versioned, installable operational payload. What ships under `assets/cursor/` (or equivalent) is what `install` / `update` / `doctor` validate.
- **`docs/`** explains behavior, onboarding, contribution, and the stable/beta matrix. It is **not** a second operational source of truth.
- **`agents/AGENTS.md`** is the **canonical source** for the consumer’s root **`AGENTS.md`**. The installer **copies** it to the target repo root. **Do not** maintain a second live editable copy elsewhere.

### 2.2 Directories in the product repository

| Path | Role |
|------|------|
| `.cursor/rules/*.mdc` (under **`assets/`** for install) | Core enforcement rules (numbered `00`–`60`). |
| `agents/AGENTS.md` | Canonical template → copied to `./AGENTS.md` on install. |
| `commands/` (source) | Markdown sources for **beta** Cursor commands → installed to **`.cursor/commands/`**. |
| `templates/` | Spec, plan, tasks, research, verification, state templates (evolved from current kit). |
| `scripts/` | Optional utilities (e.g. numbered feature scaffold). **Not** part of the npm binary. |
| `examples/minimal-project` | Minimal working example. |
| `docs/` | Human docs; **`docs/constitution.md`** is **non-normative** onboarding (English only in core). |
| `experimental/modes/` (recommended) | Optional presets for Custom Modes (**beta**); **not** installed to consumer projects in v1. |

### 2.3 Consumer project after `install`

- **`.cursor/rules/*.mdc`**
- **`.cursor/commands/*.md`** (optional but recommended; labeled beta in docs)
- **`.cursor/templates/*`**, **`.cursor/features/`** guidance as today
- **`AGENTS.md`** at **repository root** (from `agents/AGENTS.md`)

---

## 3. Rule set (`00`–`60`): mapping and mandatory constraints

Canonical **methodology** remains:

`Constitution (human doc) → Spec → Clarify (if needed) → Research (if needed) → Plan → Tasks → Execute → Verify → Final Review`

### 3.1 `00-using-spec-driven.mdc`

- **`alwaysApply: true`**
- **Content source:** Current `runtime-constitution.md` (gates, flow, artifacts, verification rubric, anti-patterns), plus early **principles check** aligned with former `01-constitution-check.md` when a feature draft exists.
- **Hard gates (mandatory wording in the rule):**
  - **No implementation** without:
    - a **concrete** `plan.md`, and
    - **explicit, ordered, actionable** tasks in `tasks.md`.
  - **If required artifacts are missing**, **create them from templates before proceeding** (see §3.7 and the `spec-start` command).
- **Human constitution:** Point to **`docs/constitution.md`** for readability only; **`.mdc` rules remain authoritative** for agent behavior.

### 3.2 `10-brainstorming-spec.mdc`

- **Sources:** `02-spec.md`, `03-clarify.md`, and the spirit of spec/brainstorm phases before any plan/tasks/code.
- **Agent Requested `description` should include:**

```text
Use when:
- the request is ambiguous
- scope is not clearly defined
- no spec exists yet
```

### 3.3 `20-targeted-research.mdc`

- **Source:** `04-research.md` (near 1:1).
- **Agent Requested `description` should include:**

```text
Use when:
- external systems are involved
- the codebase area is unfamiliar
- uncertainty affects implementation decisions
```

### 3.4 `30-writing-plan.mdc`

- **Sources:** `05-plan.md` + `06-tasks.md`.
- **Plan validity (mandatory in the rule):** A plan is **only** valid if:
  - tasks are **explicitly listed** in `tasks.md`
  - tasks are **actionable**, **ordered**, and **independently executable** (each with verifiable output; statuses per MVP)
- **Agent Requested `description` should include:**

```text
Use when:
- a spec exists
- implementation is requested
- the work is non-trivial
```

- **Cross-rule enforcement:** Rule **00** must state the same **no implementation without plan + explicit tasks** gate (see §3.1).

### 3.5 `40-executing-plan.mdc`

- **Sources:** `07-execute.md`, `09-decision-log.md`, `10-state-update.md` (continuous updates during execution).
- **Single rule, three explicit obligations (subsection required in the file):**

```text
Execution requirements:
- Follow tasks strictly in order; do not skip or reorder without documented justification.
- Log meaningful decisions in decision-log.md when trade-offs or approach changes matter.
- Update state.json continuously to reflect real progress, blockers, and verification score.

Do not:
- Execute tasks out of order without justification
- Expand scope without updating spec/plan/tasks (and decision-log when relevant)
```

### 3.6 `50-verification-before-completion.mdc`

- **Source:** `08-verification.md` (rubric, **score ≥ 90** to treat feature as complete).

### 3.7 `60-closing-feature.mdc`

- **Source:** `11-final-review.md` (final checklist and verdict).

### 3.8 Bootstrap / feature folder

- Former prompt **`00-bootstrap.md`** does **not** become a numbered rule.
- **Operational definition:**
  - **`commands/spec-start.md`** (installed to `.cursor/commands/`) must state: if `.cursor/features/<FEATURE_ID>/` or required files are missing, **create the folder and initialize required files from `.cursor/templates/`**.
  - Rule **00** must require creating missing mandatory artifacts before continuing (§3.1).

### 3.9 Legacy skill stub

- Remove dependency on **`~/.agents/skills/spec-driven-framework`**. Replace with in-repo **rules + AGENTS.md**; optional minimal skill that only points to `.cursor/rules` if still desired.

---

## 4. Slash commands (beta)

Installed under **`.cursor/commands/`** (sources live under **`commands/`** in the product repo). Planned set:

| Command file | Purpose |
|--------------|---------|
| `spec-start.md` | Ensure feature skeleton + templates; entry to workflow |
| `spec-research.md` | Drive `20-targeted-research` phase |
| `spec-plan.md` | Drive `30-writing-plan` (plan + tasks) |
| `spec-execute.md` | Drive `40-executing-plan` |
| `spec-verify.md` | Drive `50-verification-before-completion` |
| `spec-close.md` | Drive `60-closing-feature` |

README and `docs/` must label **custom commands as beta** per Cursor docs.

---

## 5. Data flow and errors

### 5.1 Artifact paths

- **`.cursor/features/<FEATURE_ID>/`**
- **Mandatory files:** `spec.md`, `plan.md`, `tasks.md`, `state.json`
- **Optional:** `research.md`, `verification.md`, `decision-log.md`

### 5.2 CLI behavior

- **`install`:** Copy/sync from `assets/` to `.cursor/` and **`AGENTS.md`** to repo root from `agents/AGENTS.md`. Preserve semantics of today’s init (skip vs force).
- **`update`:** Same as today (missing vs diverged vs `--force`).
- **`doctor`:**
  - **Missing required bundle files** under `.cursor/` (and missing root **`AGENTS.md`** when the kit defines it as required): **non-zero exit** (always).
  - **Content drift** (files exist but bytes differ from the bundled kit): **default = warn only, exit 0**; **`--strict` = non-zero exit** (treat drift as failure). Document this in README and `docs/TECH.md`.

### 5.3 CI and contributor experience

- On PRs touching **CODEOWNERS** paths: **blocking** checks = **C**:
  1. **Build + unit tests** (`npm run build`, `npm test`).
  2. **Smoke install** into a temporary directory + **`doctor`** (and idempotent second `install` if useful).
  3. **Static validation of rules:**
     - Valid YAML frontmatter for each `.mdc`
     - Required files present under the install bundle
     - Invariants (e.g. **`alwaysApply: true`** on `00-*`)
     - **Numeric rule sequence:** exactly one file each for prefixes **`00-`**, **`10-`**, **`20-`**, **`30-`**, **`40-`**, **`50-`**, **`60-`** (no duplicates; **fail** on gaps or mis-ordering so forks cannot silently degrade predictability)

---

## 6. Governance

### 6.1 CODEOWNERS (mixed policy)

Mandatory review for changes to:

- `assets/cursor/rules/**`
- `agents/AGENTS.md`
- CLI install/update/doctor implementation and shared core (`src/commands/install.ts`, `update.ts`, `doctor.ts`, `src/core/install-files.ts`, `doctor-check.ts`, `paths.ts`, `versioning.ts` — exact paths adjusted to match implementation layout)
- Architecture / technical contract doc (e.g. `docs/TECH.md` or `docs/architecture.md`)

Optional: add **`assets/cursor/commands/**`** if maintainers want the same rigor on beta commands.

### 6.2 v1 and `modes/`

- **`experimental/modes/`** (or equivalent) may exist **only in the product repo** for documentation and optional presets.
- **Do not install `modes/` into consumer projects in v1** — avoids implied support and confusion while Custom Modes remain beta.

---

## 7. Deliverables checklist (implementation phase)

1. Restructure repository per §2; migrate content from current `assets/cursor/` into rules + commands + templates.
2. Implement rules **`00`–`60`** with §3 constraints and Agent Requested descriptions for **10**, **20**, **30**.
3. Add **`agents/AGENTS.md`** and install copy to root **`AGENTS.md`**.
4. Add **`commands/`** → `.cursor/commands/` with beta labeling in README.
5. Keep **`scripts/`** optional for feature scaffold; remove feature creation from the npm binary.
6. CLI: **`install`**, **`update`**, **`doctor`** + **`init`** alias deprecation window.
7. **`README.md`**, **`CONTRIBUTING.md`**, **`LICENSE`**, **`CODE_OF_CONDUCT.md`**, **`SECURITY.md`**, **`examples/minimal-project`**.
8. CI script implementing §5.3 (including **numeric rule file checks**).
9. **`CODEOWNERS`** per §6.1.

---

## 8. Acceptance criteria

- The product works **primarily** via **`.cursor/rules`**.
- Fallback works via **root `AGENTS.md`**.
- Rules are **modular**, **actionable**, and enforce **plan + tasks** before implementation.
- Installation is **simple** (`npx` / npm as today).
- Positioning reads as a **serious OSS product** (stable vs beta matrix, governance, CI), not a prompt dump.

---

## References (conceptual)

- Cursor: Project Rules (`.cursor/rules`, `.mdc`).
- Cursor: `AGENTS.md` at repository root.
- Cursor: Custom commands (beta), Custom Modes (beta).
