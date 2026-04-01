# Contributing

Thanks for helping improve **spec-driven-kit**.

## Principles

- Keep changes aligned with the [design spec](docs/superpowers/specs/2026-03-31-cursor-spec-driven-kit-design.md).
- **Core behavior** lives in `assets/cursor/rules/` and `agents/AGENTS.md` — treat edits there as high impact.
- Prefer small, reviewable PRs; run `npm test` and `npm run validate:rules` locally.

## Pull requests

1. Fork and branch from `main`.
2. Run `npm ci`, `npm run validate:rules`, and `npm test`.
3. Describe what changed and why; link issues when relevant.

## CODEOWNERS

Paths listed in `.github/CODEOWNERS` require maintainer review for changes to the core workflow and installer.

## Code of conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
