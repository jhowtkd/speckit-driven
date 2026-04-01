# Minimal example

This folder is intentionally blank. It exists so you can bootstrap an ELF runtime in a fresh project without any preloaded `.elf/` or adapter state.

## Try ELF

From an empty directory, or from this folder:

```bash
npm init -y
npm install elf-orchestrator
npx elf-orchestrator init
npx elf-orchestrator run --workflow phase --title "Demo feature"
```

If you want host integration, add the adapter that matches your editor:

```bash
npx elf-orchestrator adapter install cursor --allow-anywhere
npx elf-orchestrator adapter install codex --allow-anywhere
```

To expose the runtime over MCP:

```bash
npx elf-orchestrator mcp serve
```

## Notes

- `.elf/` is the source of truth for workflow state and verification.
- `spec-driven-kit` still exists as a compatibility alias while older projects migrate.
- Cursor and Codex are adapters, not the workflow engine.
