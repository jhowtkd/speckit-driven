# Minimal Example

This folder is a blank sample. There is no vendored `.cursor/` here on purpose.

## What this example shows

- the smallest usable setup for Spec-Driven for Cursor
- how the kit installs into a real project
- what the agent should do after install

## Try the kit

From an empty directory, or from this folder:

```bash
npm init -y
npm install spec-driven-kit
npx spec-driven-kit install
npx spec-driven-kit doctor
```

After install, you should see:

- `.cursor/rules/*.mdc`
- `AGENTS.md`
- optional `.cursor/commands/*` when supported

## Expected behavior

After your first request in Cursor, you should see:

- clarification or spec creation before coding
- a plan with ordered tasks
- step-by-step execution
- explicit verification before completion

If you do not see that flow, the install or project setup is incomplete.

## Try this prompt in Cursor

> build a login flow with email and password

What should happen:

- the agent clarifies the scope
- it creates or refines a spec
- it produces a plan with ordered tasks
- it executes step by step
- it verifies before claiming completion

Open the folder in Cursor before trying the prompt so the rules and `AGENTS.md` are active.

## Optional scaffold

```bash
node node_modules/spec-driven-kit/scripts/new-feature.mjs demo-feature
```

## Notes

- Custom commands under `.cursor/commands/` are beta in Cursor; rules remain the source of truth
- See the main repository README for the stability matrix
