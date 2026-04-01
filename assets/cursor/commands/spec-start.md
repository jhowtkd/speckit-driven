# Spec start

Ensure the feature folder and mandatory files exist before other phases.

## When to run

At the beginning of work on a feature, or when `.cursor/features/<FEATURE_ID>/` is missing files.

## Instructions

1. Set `FEATURE_ID` (e.g. `001-my-feature`).
2. If `.cursor/features/<FEATURE_ID>/` does not exist, create it.
3. For each missing mandatory file, copy from `.cursor/templates/`:
   - `spec-template.md` → `spec.md`
   - `plan-template.md` → `plan.md`
   - `tasks-template.md` → `tasks.md`
   - `state-template.json` → `state.json`
4. Replace template placeholders (`{{FEATURE_ID}}`, etc.) if the template uses them.
5. Do **not** implement product code in this step.

Optional: run `node scripts/new-feature.mjs <slug>` from this repository clone to scaffold `NNN-slug` automatically.
