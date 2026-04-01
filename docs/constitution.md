# Constitution — human principles (non-normative)

**Read this for onboarding.** **Authoritative agent behavior** lives in **`.cursor/rules/*.mdc`**, especially **`00-using-spec-driven.mdc`**.

## Purpose

Encourage disciplined delivery: clear intent before code, proportional process, and verifiable outcomes — without treating documentation as a substitute for shipping.

## Principles

- Spec before code; clarity before needless complexity.
- Tests and checks **proportional to risk**.
- Every meaningful change should be **reviewable** by another competent reader.
- Operational truth in tracked artifacts (e.g. `state.json`), not only chat memory.
- No “vibe coding” as the default delivery mode for non-trivial work.

## Artifact roles (conceptual)

| Artifact | Role |
|----------|------|
| Spec | What and why; scope and verifiable acceptance |
| Plan | How; order, risks, test strategy |
| Tasks | Executable breakdown |
| Verification | Exit gate with rubric and evidence |
| State | Current progress and blockers |

## Documentation time budget (guidance)

- Quick fix: ~5 minutes  
- Small feature: ~15 minutes  
- Sensitive or medium work: ~30 minutes  

If overhead grows without clear payoff, simplify the process.

## Authority

If ad-hoc shortcuts conflict with **Project Rules**, the rules win unless the user explicitly overrides. Exceptions should be explicit and scoped.

## v1 scope

Suited to small/medium features and light refactors. Large epics or heavy brownfield may need extra planning outside this kit.
