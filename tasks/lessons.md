# Lessons

## 2026-04-01

- When the user revises the preferred product strategy, stop and realign the design immediately instead of continuing from the previously selected recommendation.
- For architecture choice points, restate the active choice in the next design section so the direction is explicit and auditable.
- Do not rename the publishable npm package to a name that is already taken; verify package availability before treating a branding change as release-safe.
- When adding a new CLI entrypoint, ensure the git executable bit is set on the bin file so direct execution and packaged usage behave the same.
- Do not hard-code POSIX path separators in tests when the implementation uses `path.join()`; normalize paths or assert via path-aware helpers so Windows CI stays green.
- When a command handler throws for expected user mistakes, catch the error at the CLI boundary and print a clean message to stderr instead of leaking a Node stack trace.
- In workflow routing, treat explicit review requests as review first, and only route to debug when the prompt clearly asks for incident investigation rather than a bounded fix.
- In intent normalization, let `continue/resume` win before epic keywords when there is existing work, and surface explicit verification prompts as `verify-run` instead of falling back to generic task routing.
- A loader that points at missing or corrupted on-disk state must return `null` or fail loudly, never synthesize a plausible record from a pointer file.
- Runtime commands must never create partial `.elf/` state; require a valid initialized runtime first or bootstrap all required runtime files before writing run state.
- When keeping a legacy compatibility command during migration, keep its guidance consistent with the commands that actually exist so users are not sent into guaranteed failures.
- Do not describe `doctor` as part of a legacy compatibility path once it only validates the new runtime; separate legacy installer guidance from runtime validation explicitly.
- When documenting a new adapter surface, name the adapter asset tree that the implementation actually reads from, and call out any legacy bundle path separately.
- For MCP servers, register tools through `McpServer.registerTool()` so the SDK advertises tool capability and wires `tools/list` and `tools/call` consistently.
- If runtime code imports a package directly, declare it as a direct dependency even when a transitive copy is currently hoisted into `node_modules`.
- For zero-input MCP tools, do not require `arguments: {}`; register them without an input schema and test `callTool({ name })` explicitly.
- When a smoke test covers a migration path next to a legacy path, use a fresh temp directory for file-presence assertions so earlier subtests do not contaminate the adapter contract.
- When shipping a new adapter bundle beside a legacy bundle, remove the known conflicting legacy file during install/update and make doctor fail if it is manually reintroduced.
- Static rule validation must cover the new adapter bundle as soon as it ships, not only the legacy compatibility bundle.
- Tests that assert validator output paths should normalize path separators before matching so Windows and POSIX output both pass.
- When adding a new adapter branch to a shared command handler, keep the "unknown adapter" guard after the supported branches so the new path can actually execute.
- For multi-root adapter bundles, treat any surviving bundle footprint as a valid update target; do not gate repair on a single subtree that may be missing during partial recovery.
- When a global install manifest preserves historical ownership for future cleanup, both update and uninstall paths must consume that history; preserving it without using it just creates orphaned files and shared-config entries.
