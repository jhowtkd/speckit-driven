# Spec-Driven for Cursor

Enforce a spec -> plan -> execute -> verify workflow inside Cursor using native rules.

## What this is

A lightweight workflow system that makes Cursor follow a spec-driven process for non-trivial work.

It helps prevent:
- jumping into code too early
- vague plans
- unverified "done"

And it enforces:
- clear specs
- structured plans with tasks
- disciplined execution
- evidence-based verification

## Install

```bash
npx spec-driven-kit install
```

That is the main path.

If you already use the package locally:

```bash
npm install spec-driven-kit
npx spec-driven-kit install
```

The CLI also provides:
- `install` - copies kit files into `./.cursor/` and `./AGENTS.md` (skips existing files unless `--force`)
- `init` - deprecated alias for `install`
- `update` - adds missing files; leaves divergent files untouched unless `--force`
- `doctor` - checks `.cursor/` and `AGENTS.md` against the bundled kit

### Doctor semantics

- Missing required files -> non-zero exit
- Content drift -> warnings, exit 0 by default
- `doctor --strict` -> drift is treated as failure

### After install

The install step sets up:

- `.cursor/rules/*.mdc`
- `AGENTS.md`
- optional `.cursor/commands/*` when supported

### Outside a classic repo

```bash
npx spec-driven-kit install --allow-anywhere
```

## How it works

1. Describe what you want to build.
2. The agent guides you through spec -> plan -> execution.
3. Work is only considered done after verification.

No special commands are required.

## Core surface

This project is built on official Cursor primitives:

- `.cursor/rules/*.mdc` -> behavior and enforcement
- `AGENTS.md` -> fallback instructions

These are the only required surfaces.

## Optional, beta surface

- `.cursor/commands/*` -> shortcuts like `spec-start`, `spec-plan`, and friends

Commands are optional and may change.
The system works without them.

## Example

User:

> build a login system with email and password

What happens:

- the agent clarifies scope and creates a spec
- it generates a plan with ordered tasks
- it executes step by step
- it verifies before marking the work done

## What this does not do

- Not a framework
- Not a code generator
- Not a plugin with hidden behavior
- Not dependent on private Cursor APIs

This is a behavioral layer, not a runtime.

## Philosophy

- Spec before code
- Plan before execution
- Evidence before completion

## Compatibility

| Feature | Status |
|---------|--------|
| `.cursor/rules` | Stable |
| `AGENTS.md` | Stable |
| Commands | Beta |
| Modes | Experimental |

## Contributing

- Core rules (`.cursor/rules`) are protected via CODEOWNERS
- Changes must preserve workflow integrity
- See [CONTRIBUTING.md](CONTRIBUTING.md)

## Documentation

- Design spec: [docs/superpowers/specs/2026-03-31-cursor-spec-driven-kit-design.md](docs/superpowers/specs/2026-03-31-cursor-spec-driven-kit-design.md)
- Implementation plan: [docs/plans/2026-03-31-cursor-first-spec-driven-kit.md](docs/plans/2026-03-31-cursor-first-spec-driven-kit.md)
- Technical notes: [docs/TECH.md](docs/TECH.md)
- Human principles: [docs/constitution.md](docs/constitution.md)

## License

MIT
