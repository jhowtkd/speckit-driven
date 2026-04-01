# ELF

ELF is a lightweight orchestrator runtime for spec-driven workflows. The runtime owns workflow state, verification, and replay under `.elf/`; Cursor and Codex are thin adapters that surface the same runtime through their native features.

> Migration note: `spec-driven-kit` remains as a compatibility alias while existing projects move over, but new projects should use `elf-orchestrator` and the `elf` CLI.

## Requirements

- Node.js **18+**
- Cursor or Codex only if you want host integration

## Quick start

In your project root:

```bash
npm install elf-orchestrator
npx elf-orchestrator init
npx elf-orchestrator run --workflow phase --title "User auth"
```

If you are opening the project in Cursor or Codex, install the matching adapter:

```bash
npx elf-orchestrator adapter install cursor --allow-anywhere
npx elf-orchestrator adapter install codex --allow-anywhere
```

To expose the local runtime over MCP:

```bash
npx elf-orchestrator mcp serve
```

## Primary commands

- `init` bootstraps `.elf/` runtime state and `AGENTS.md`.
- `run` starts a new ELF run from the selected workflow.
- `resume` reloads an existing run from disk.
- `review` prints a review scaffold for a path or run id.
- `verify` stores an independent verification result for a run.
- `mcp serve` exposes the local ELF runtime over MCP.
- `adapter install`, `adapter update`, and `adapter doctor` manage the Cursor and Codex adapter bundles.

## Legacy compatibility

The older `install`, `update`, and `doctor` commands remain available for existing Cursor-first projects. They manage the legacy `.cursor/` bundle and `AGENTS.md`; new work should prefer the ELF runtime commands above.

## Compatibility matrix

| Surface | Location | Role |
|---------|-----------|------|
| Runtime store | `.elf/` | Source of truth for workflow state, artifacts, and verification |
| Cursor adapter | `.cursor/rules/*.mdc`, `.cursor/commands/*.md`, `AGENTS.md` | Cursor-facing delivery surface |
| Codex adapter | `.agents/skills/`, `codex/rules/`, `.codex/` | Codex-facing delivery surface |
| MCP bridge | `elf mcp serve` | Shared local bridge into the runtime |

## Development

```bash
npm install
npm run build
npm test
npm run validate:rules
node bin/elf.js --help
```

## Documentation

- Design spec: [docs/plans/2026-04-01-elf-orchestrator-first-design.md](docs/plans/2026-04-01-elf-orchestrator-first-design.md)
- Technical notes: [docs/TECH.md](docs/TECH.md)
- Human principles: [docs/constitution.md](docs/constitution.md)

## License

MIT — see [LICENSE](LICENSE).
