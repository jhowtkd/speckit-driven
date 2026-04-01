# Minimal example

This folder is intentionally blank. It exists so you can bootstrap an ELF runtime in a fresh project without any preloaded `.elf/` or adapter state.

## Try ELF

From an empty directory, or from this folder, first install the CLI globally and wire the hosts you care about:

```bash
npm install -g elf-orchestrator
elf global install all
```

Then bootstrap the project runtime locally:

```bash
npm init -y
elf init
elf run --workflow phase --title "Demo feature"
```

To expose the runtime over MCP:

```bash
elf mcp serve
```

## Notes

- `.elf/` is the source of truth for workflow state and verification.
- `elf global install ...` prepares the host; `elf init` prepares the current project.
- `elf global doctor` validates the host install; `elf doctor` validates the current project's runtime.
- `spec-driven-kit` still exists as a compatibility alias while older projects migrate.
- Cursor and Codex are adapters, not the workflow engine.
