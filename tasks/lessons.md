# Lessons

## 2026-04-01

- When the user revises the preferred product strategy, stop and realign the design immediately instead of continuing from the previously selected recommendation.
- For architecture choice points, restate the active choice in the next design section so the direction is explicit and auditable.
- Do not rename the publishable npm package to a name that is already taken; verify package availability before treating a branding change as release-safe.
- When adding a new CLI entrypoint, ensure the git executable bit is set on the bin file so direct execution and packaged usage behave the same.
- Do not hard-code POSIX path separators in tests when the implementation uses `path.join()`; normalize paths or assert via path-aware helpers so Windows CI stays green.
- When a command handler throws for expected user mistakes, catch the error at the CLI boundary and print a clean message to stderr instead of leaking a Node stack trace.
- In workflow routing, treat explicit review requests as review first, and only route to debug when the prompt clearly asks for incident investigation rather than a bounded fix.
