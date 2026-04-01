# Technical decisions (ELF v1)

## Runtime and build

- **TypeScript → CommonJS** in `dist/`: stable `__dirname`, works with `bin/elf.js` and the `spec-driven-kit` compatibility alias.
- **`prepublishOnly` → `build`**: publishing runs `tsc` before pack.

## CLI surface

- **Primary runtime commands**: `init`, `run`, `resume`, `review`, `verify`, `doctor`, `mcp serve`.
- **Adapter commands**: `adapter install`, `adapter update`, `adapter doctor` for `cursor` and `codex`.
- **Global adapter commands**: `global install`, `global update`, `global doctor`, `global uninstall` for `cursor`, `codex`, and `all`.
- **Legacy compatibility commands**: `install` and `update` remain available for the old Cursor-first bundle, but they are not the primary ELF workflow entrypoint.

## Runtime store

- **`elf init`** bootstraps `.elf/` and root `AGENTS.md`.
- **Source of truth**: `.elf/` holds runtime state, workflow definitions, templates, and metadata.
- **Runtime metadata**: `.elf/state/metadata.json` stores the installed ELF runtime version and provenance.

## Legacy compatibility store

- The legacy Cursor-first bundle still uses `.cursor/spec-driven-kit.json` for compatibility metadata.
- `install` / `update` continue to manage the legacy `.cursor/` payload and `AGENTS.md` for existing migrations.

## Adapters

- **Cursor adapter payload**: `assets/adapters/cursor/` installs to `.cursor/`.
- **Cursor global payload**: global rules come from `assets/adapters/cursor/rules/` and merge into `~/.cursor/rules/`, `~/.cursor/mcp.json`, and `~/.cursor/hooks.json`.
- **Legacy Cursor bundle**: `assets/cursor/` remains the compatibility source for the older installer.
- **Codex adapter payload**: `assets/adapters/codex/` installs to `.agents/`, `codex/`, and `.codex/`.
- **Codex global payload**: installs to `~/.codex/skills/`, `~/.codex/rules/`, `~/.codex/agents/`, and `~/.codex/hooks.json`.
- The adapter bundles are thin delivery surfaces; workflow semantics live in the ELF runtime.

## Global manifest ownership

- **Codex global manifest**: `~/.codex/.elf-global.json`
- **Cursor global manifest**: `~/.cursor/.elf-global.json`
- These manifests track ELF-managed files and shared-config entries so `global update`, `global doctor`, and `global uninstall` stay ownership-aware.

## Doctor semantics

- `elf doctor` validates `.elf/` against the bundled runtime.
- `elf adapter doctor cursor|codex` validates the installed adapter bundle against its assets.
- `elf global doctor cursor|codex|all` validates host-global integrations and warns when a project-local adapter is also present in the current working directory.
- Missing files are errors; drift is warnings by default and failures under `--strict`.

## MCP bridge

- `elf mcp serve` exposes the runtime over stdio MCP.
- MCP tools are the shared local integration point for Codex and Cursor in v1.

## Validation

- `npm run validate:rules` checks both the legacy Cursor rules bundle and the Cursor adapter rules bundle.
- Rule validation is path-aware and should stay cross-platform.

## Package paths

- `getPackageRoot()` resolves from `dist/core/*.js` two levels up. Changing build layout requires updating `src/core/paths.ts`.

## Out of scope (v1)

- Telemetry, installing `experimental/modes/` into consumer projects, smart three-way merge beyond `update --force`, hosted UI, cloud sync.

## Future (v1.1+)

- `doctor --fix` for missing files only; `install --dry-run`.
