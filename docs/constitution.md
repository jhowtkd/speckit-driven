# Constitution — human principles (non-normative)

**Read this for onboarding.** **Authoritative workflow behavior** lives in the ELF runtime under **`.elf/`**; host adapters surface that behavior through Cursor rules, Codex assets, and `AGENTS.md`.

## Purpose

Encourage disciplined delivery: clear intent before code, proportional process, and verifiable outcomes — without treating documentation as a substitute for shipping.

## Principles

- Spec before code; clarity before needless complexity.
- Tests and checks **proportional to risk**.
- Every meaningful change should be **reviewable** by another competent reader.
- Operational truth in tracked artifacts under `.elf/`, not only chat memory or host-local state.
- No “vibe coding” as the default delivery mode for non-trivial work.

## Artifact roles (conceptual)

| Artifact | Role |
|----------|------|
| Spec | What and why; scope and verifiable acceptance |
| Plan | How; order, risks, test strategy |
| Tasks | Executable breakdown |
| Verification | Exit gate with rubric and evidence |
| Runtime state | Current progress, blockers, and resumable ELF execution state |

## Documentation time budget (guidance)

- Quick fix: ~5 minutes  
- Small feature: ~15 minutes  
- Sensitive or medium work: ~30 minutes  

If overhead grows without clear payoff, simplify the process.

## Authority

If host-adapter guidance conflicts with the ELF runtime or explicit user overrides, the runtime wins unless the user explicitly overrides. Exceptions should be explicit and scoped.

## v1 scope

Suited to small/medium features and light refactors. Large epics or heavy brownfield may need extra planning outside this kit.
