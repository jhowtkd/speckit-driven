# ELF

ELF is a lightweight orchestrator runtime for spec-driven workflows. The runtime owns workflow state, verification, and replay under `.elf/`; Cursor and Codex are thin adapters that surface the same runtime through their native features.

> Migration note: `spec-driven-kit` remains as a compatibility alias while existing projects move over, but new projects should use `elf-orchestrator` and the `elf` CLI.

## Requirements

- Node.js **18+**
- Cursor or Codex only if you want host integration

## Quick start

Install the CLI globally:

```bash
npm install -g elf-orchestrator
```

Install the host integrations you want:

```bash
elf global install cursor
elf global install codex
# or
elf global install all
```

Then bootstrap each project locally:

```bash
cd /path/to/project
elf init
elf run --workflow phase --title "User auth"
```

If you prefer not to install the CLI globally, the package still works through `npx`:

```bash
npm install elf-orchestrator
npx elf-orchestrator init
npx elf-orchestrator run --workflow phase --title "User auth"
```

To expose the local runtime over MCP:

```bash
elf mcp serve
```

## Primary commands

- `init` bootstraps `.elf/` runtime state and `AGENTS.md`.
- `run` starts a new ELF run from the selected workflow.
- `resume` reloads an existing run from disk.
- `review` prints a review scaffold for a path or run id.
- `verify` stores an independent verification result for a run.
- `doctor` validates `.elf/` against the bundled runtime.
- `mcp serve` exposes the local ELF runtime over MCP.
- `adapter install`, `adapter update`, and `adapter doctor` manage the Cursor and Codex adapter bundles.
- `global install`, `global update`, `global doctor`, and `global uninstall` manage the host-global Codex and Cursor integrations.

## Legacy compatibility

The older `install` and `update` commands remain available for existing Cursor-first projects. They manage the legacy `.cursor/` bundle and `AGENTS.md`; `doctor` validates the ELF runtime after `elf init`, so new work should prefer the ELF runtime commands above.

## Global vs project-local

- `npm install -g elf-orchestrator` installs the `elf` CLI globally.
- `elf global install ...` installs host-global integration into `~/.codex/` or `~/.cursor/`.
- `elf init` bootstraps the project-local runtime in `.elf/`.
- `elf doctor` validates the project runtime.
- `elf global doctor` validates the host-global integration.

## Compatibility matrix

| Surface | Location | Role |
|---------|-----------|------|
| Runtime store | `.elf/` | Source of truth for workflow state, artifacts, and verification |
| Cursor adapter (project-local) | `.cursor/rules/*.mdc`, `.cursor/commands/*.md` | Project-scoped Cursor delivery surface |
| Cursor adapter (host-global) | `~/.cursor/rules/`, `~/.cursor/mcp.json`, `~/.cursor/hooks.json` | Host-global Cursor integration |
| Codex adapter (project-local) | `.agents/skills/`, `codex/rules/`, `.codex/` | Project-scoped Codex delivery surface |
| Codex adapter (host-global) | `~/.codex/skills/`, `~/.codex/rules/`, `~/.codex/agents/`, `~/.codex/hooks.json` | Host-global Codex integration |
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
- Global installer design: [docs/plans/2026-04-01-elf-global-installer-design.md](docs/plans/2026-04-01-elf-global-installer-design.md)
- Global installer plan: [docs/plans/2026-04-01-elf-global-installer.md](docs/plans/2026-04-01-elf-global-installer.md)
- Technical notes: [docs/TECH.md](docs/TECH.md)
- Human principles: [docs/constitution.md](docs/constitution.md)

## License

MIT — see [LICENSE](LICENSE).
