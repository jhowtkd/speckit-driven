# TODO

## 2026-04-01 - Host-Native Flow Reset

### Goal

Turn ELF from adapter/runtime plumbing into a real chained workflow experience
inside Cursor and Codex, starting with a concrete `phase` vertical slice.

### Plan

- [x] Audit the current gap between the intended product and the shipped adapters/runtime.
- [x] Define the vertical slice to build first: `start -> research -> plan -> execute -> verify -> close`.
- [x] Add runtime phase-step state and durable phase artifacts under `.elf/phases/<phase-id>/`.
- [x] Add real CLI step commands that advance the phase chain.
- [x] Make `elf run --workflow phase` initialize the phase chain instead of only flipping run status.
- [x] Rewire Cursor commands to drive the real runtime chain.
- [x] Rewire Codex skills to drive the real runtime chain.
- [x] Add tests for runtime step progression and host adapter content.
- [x] Verify the full CLI and adapter suites.

## Review

- The current implementation successfully ships runtime scaffolding, adapters,
  MCP, and global installers.
- This pivot adds a first real host-native vertical slice for `phase`:
  `start -> research -> plan -> execute -> verify -> close`.
- The adapters now drive runtime steps instead of only describing them.

## 2026-04-01 - Host-Native Completion Pass

### Goal

Close the remaining gaps that still make the host-native experience feel
unfinished after the phase-flow pivot.

### Plan

- [x] Expose the real phase chain through MCP so hosts can drive the same steps over the bridge.
- [x] Make `elf_run` over MCP delegate to the real phase chain when `workflow=phase`.
- [x] Add real MCP handshake coverage for the phase chain end-to-end.
- [x] Simplify README onboarding around the real `phase` workflow and advanced/global commands.
- [x] Ignore generated local runtime/adapter artifacts so testing the repo does not dirty the branch.
