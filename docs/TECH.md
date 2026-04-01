# Technical decisions (v1)

## Runtime and build

- **TypeScript → CommonJS** in `dist/`: stable `__dirname`, works with `bin/spec-driven-kit.js`.
- **`prepublishOnly` → `build`**: publishing runs `tsc` before pack.

## CLI (installer only)

- **Commander** for `install` (alias `init`), `update`, `doctor`.
- **No** `new feature` in the binary; optional **`scripts/new-feature.mjs`** for scaffolding.

## Install and update

- **`install`**: copies **`assets/cursor/`** → **`.cursor/`** and **`agents/AGENTS.md`** → **`./AGENTS.md`**. Existing files are **skipped** unless `--force`.
- **`update`**: same merge semantics for `.cursor/` and root **`AGENTS.md`** (missing → create; identical → ignore; diverged → skip unless `--force`).
- **Metadata**: `.cursor/spec-driven-kit.json` stores `kitVersion`, `installedAt` (preserved), `lastKitUpdate`.

## Doctor

- Validates **every** bundled path under `.cursor/` **and** **`AGENTS.md`** at the repo root against the package.
- **Missing** files → **error**, exit **1**.
- **Content drift** → **warnings**, exit **0** by default; **`--strict`** treats drift as **error**, exit **1**.

## Authoritative layout

- **Installable payload**: **`assets/cursor/`** (includes **`rules/*.mdc`**, **`commands/`**, **`templates/`**, etc.).
- **Canonical `AGENTS.md` template**: **`agents/AGENTS.md`** in the package (also listed in npm `"files"`).
- **Human constitution**: **`docs/constitution.md`** only; not part of the installed bundle.

## Optional feature scaffold

- **`scripts/new-feature.mjs`**: sequential **001–999**, **kebab-case** slug; templates from `.cursor/templates/` with fallback to bundled templates.

## Package paths

- `getPackageRoot()` resolves from `dist/core/*.js` two levels up. Changing build layout requires updating `src/core/paths.ts`.

## CI

- **`npm run validate:rules`**: static checks on `assets/cursor/rules` (required `00`–`60` prefixes, `alwaysApply: true` on `00`).

## Out of scope (v1)

- Telemetry, installing `experimental/modes/` into consumer projects, smart three-way merge beyond `update --force`.

## Future (v1.1+)

- `doctor --fix` for missing files only; `install --dry-run`.
