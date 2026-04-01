# spec-driven-kit

Open-source **spec-driven workflow** for [Cursor](https://cursor.com): install **Project Rules** (`.cursor/rules/*.mdc`), templates, optional **custom commands** (beta), and root **`AGENTS.md`**. The npm CLI is only an **installer / updater / doctor** — the product behavior lives in rules and agent instructions.

## Requirements

- Node.js **18+**
- Cursor (recommended) for Project Rules and commands

## Quick install

In your project root:

```bash
npx spec-driven-kit install
```

Or with a local dependency:

```bash
npm install spec-driven-kit
npx spec-driven-kit install
```

- **`install`** — copies kit files into `./.cursor/` and **`./AGENTS.md`** (skips existing files unless `--force`).
- **`init`** — deprecated alias for **`install`** (warns on stderr).
- **`update`** — adds missing files; leaves divergent files untouched unless `--force`.
- **`doctor`** — checks `.cursor/` and `AGENTS.md` against the bundled kit.

### Doctor semantics

- **Missing** required files → **non-zero exit** (failure).
- **Content drift** (files differ from the kit) → **warnings**, **exit 0** by default.
- **`doctor --strict`** → drift is treated as **failure** (non-zero exit).

### Outside a classic repo

```bash
npx spec-driven-kit install --allow-anywhere
```

## Compatibility matrix (Cursor surfaces)

| Surface | Location | Stability |
|---------|-----------|-----------|
| Project Rules | `.cursor/rules/*.mdc` | Documented |
| Agent instructions | `AGENTS.md` (repo root) | Documented |
| Custom commands | `.cursor/commands/*.md` | **Beta** |
| Custom Modes | Cursor app | **Beta** — optional presets live under `experimental/modes/` in this repo only (not installed to your project in v1) |

## Optional: scaffold a feature

Not part of the CLI binary:

```bash
node node_modules/spec-driven-kit/scripts/new-feature.mjs my-feature-name
```

Creates `.cursor/features/NNN-my-feature-name/` from templates.

## Development of this package

```bash
npm install
npm run build
npm test
npm run validate:rules
node bin/spec-driven-kit.js --help
```

## Documentation

- Design spec: [docs/superpowers/specs/2026-03-31-cursor-spec-driven-kit-design.md](docs/superpowers/specs/2026-03-31-cursor-spec-driven-kit-design.md)
- Implementation plan: [docs/plans/2026-03-31-cursor-first-spec-driven-kit.md](docs/plans/2026-03-31-cursor-first-spec-driven-kit.md)
- Technical notes: [docs/TECH.md](docs/TECH.md)
- Human principles (non-normative): [docs/constitution.md](docs/constitution.md)

## License

MIT — see [LICENSE](LICENSE).
