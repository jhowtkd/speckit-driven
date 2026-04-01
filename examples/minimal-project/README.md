# Minimal example

This folder is a **blank sample**: there is no vendored `.cursor/` here on purpose.

## Try the kit

From an empty directory (or this folder):

```bash
npm init -y
npm install spec-driven-kit
npx spec-driven-kit install
npx spec-driven-kit doctor
```

Optional scaffold:

```bash
node node_modules/spec-driven-kit/scripts/new-feature.mjs demo-feature
```

Then open the repo in **Cursor** and use Project Rules under `.cursor/rules/` and `AGENTS.md` at the root.

## Notes

- **Custom commands** under `.cursor/commands/` are **beta** in Cursor; rules remain the source of truth.
- See the main repository README for the stability matrix.
