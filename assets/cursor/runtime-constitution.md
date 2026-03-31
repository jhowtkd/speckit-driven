# Runtime Constitution — Spec-Driven Coding MVP
## Runtime Version 1.0

## Core Rule
No implementation starts without spec, plan, tasks, and state.

## Mandatory Flow
Constitution → Spec → Clarify (if needed) → Research (if needed) → Plan → Tasks → Execute → Verify → Final Review

## Hard Gates
- No code before spec
- No execution before plan
- No execution before tasks
- No completion before verification >= 90
- No hidden scope expansion
- No state kept only in memory

## Required Artifacts
Mandatory:
- `spec.md`
- `plan.md`
- `tasks.md`
- `state.json`

Optional:
- `research.md`
- `verification.md`
- `decision-log.md`

## Execution Rules
- Follow the approved scope
- Keep complexity proportional
- Record relevant trade-offs
- Declare expected tests for every task
- Do not mark done without evidence
- If reality diverges from the plan, update the documents

## Research Rule
Research is mandatory when there is:
- new integration
- new language
- new technology
- relevant external dependency
- material technical uncertainty

Research is optional for small or well-understood changes.

## Testing Rule
Tests must be proportional to risk.
“Seems to work” is not evidence.

## Verification Rule
Use this scoring:
- spec adherence: 25
- plan adherence: 20
- output quality: 20
- tests and evidence: 20
- reviewability and clarity: 15

Score bands:
- 0–59: failed
- 60–79: incomplete
- 80–89: acceptable but not complete
- 90–100: complete

## Anti-Patterns
Do not:
- start from code
- define scope mid-flight without updating spec
- use vague tasks
- add abstraction without need
- use research to avoid decisions
- treat verification as ceremony
- mark progress that did not happen

## Final Exit Condition
A feature is only complete when:
- output is reviewable
- tests were executed or justified
- evidence is registered
- verification score is >= 90
- no critical blocker remains
