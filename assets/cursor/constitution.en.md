# Constitution — Spec-Driven Coding MVP
## Version 1.0
## Status: Active

## 1. Purpose

This constitution defines the principles, constraints, quality criteria, progression rules, and operational invariants of the Spec-Driven Coding MVP.

Its purpose is to prevent agentic development from operating through improvisation, reduce rework, increase technical quality, and preserve operational continuity across execution cycles.

It takes precedence over local execution preferences, ad hoc prompts, informal shortcuts, and opportunistic decisions that conflict with its principles.

---

## 2. System Objective

This system exists to transform improvised agentic coding into specification-driven execution.

More specifically, it exists to ensure that:
- every implementation has explicit intent
- every change has bounded scope
- every execution has traceability
- every completion has formal or equivalent verification
- every added layer of complexity has objective justification

---

## 3. Scope of Application

This constitution applies to the entire MVP workflow, especially:
- feature creation
- light refactors
- small and medium changes
- new low-to-medium impact integrations
- research, planning, execution, and review cycles

In this version, it does not assume multi-team governance, advanced multi-agent orchestration, or deep external automation.

---

## 4. Operational Invariants

The following rules are invariants. If any of them is violated, execution is considered outside the system.

### 4.1 No implementation starts without specification
No code should be written, changed, or proposed as a final solution without a minimally valid spec.

### 4.2 No implementation starts without a plan
No execution should occur without a plan describing approach, execution order, risks, and testing strategy.

### 4.3 No execution without decomposition
Every change must be broken into executable, traceable, and verifiable tasks.

### 4.4 No task is complete without verification
No task or feature may be considered complete without risk-compatible verification and the minimum score defined by this constitution.

### 4.5 No complexity without justification
Architecture, abstractions, layers, dependencies, indirections, and extensions may only be introduced when they directly improve:
- acceptance criteria
- change safety
- real maintainability
- testability
- technical risk reduction

### 4.6 No operational state may depend only on memory
Execution state must be represented in system files, not only in implicit context or operator memory.

### 4.7 No relevant change may be unreviewable
Every change must be readable, traceable, and reviewable by a competent technical reviewer.

---

## 5. Mandatory Technical Principles

### 5.1 Specification first
The spec defines what and why before how.

### 5.2 Planning before execution
The plan exists to convert intent into operational approach before implementation.

### 5.3 Tasked execution
Execution must happen through clear work units, not amorphous implementation blocks.

### 5.4 Verification as a gate
Verification is not an after-the-fact comment. It is an exit condition.

### 5.5 Simplicity as default
The simplest solution that safely satisfies the goal must be preferred.

### 5.6 Tests proportional to risk
Testing requirements increase with impact, criticality, coupling, and regression surface.

### 5.7 Explicit trade-offs
Every relevant choice must state what it gained and what it sacrificed.

### 5.8 Local consistency before global ambition
Before scaling abstraction, generalization, or extensibility, the solution must be locally correct, clear, and stable.

### 5.9 No vibe coding in the production flow
Improvisation may exist in exploration, never as the basis of the main delivery flow.

### 5.10 Documentation must earn its cost
Documentation that does not improve execution, review, recovery, or decision-making is excess and must be reduced.

---

## 6. Official Workflow Structure

The official workflow is:

Constitution  
Spec  
Clarify, when needed  
Research, when needed  
Plan  
Tasks  
Execute  
Verification  
Final Review

### 6.1 Sequence rule
Phases are sequential. The system allows compressed depth, not structural omission.

### 6.2 Allowed compression
It is allowed to:
- embed clarify into the spec
- shorten research for simple tasks
- summarize the verification document

It is not allowed to:
- skip spec
- skip plan
- skip tasks
- skip verification as a stage

---

## 7. Entry Criteria by Phase

### 7.1 To start Spec
There must be:
- intent to change
- minimal context
- a recognizable problem

### 7.2 To start Plan
The spec must contain at least:
- context
- problem
- objective
- scope
- out of scope
- acceptance criteria

### 7.3 To start Tasks
The plan must contain at least:
- technical approach
- impacted parts
- execution order
- testing strategy

### 7.4 To start Execute
There must be:
- a clear spec
- a coherent plan
- sequenced tasks
- recorded initial state

### 7.5 To start Verification
There must be:
- implemented output
- available evidence
- updated tasks
- executed or justified tests

---

## 8. Exit Criteria by Phase

### 8.1 Spec is ready when
- the problem is clearly defined
- the objective is explicit
- scope is bounded
- out of scope is explicit
- acceptance criteria are verifiable
- material ambiguities were removed or recorded

### 8.2 Plan is ready when
- the technical approach is defined
- execution order is coherent
- main technical risks are identified
- testing strategy matches the risk
- the solution does not contain ornamental complexity

### 8.3 Tasks are ready when
- they fully cover the plan
- dependencies are explicit
- outputs are verifiable
- expected tests or justifications are defined
- they can be executed without excessive interpretation

### 8.4 Execute is ready for review when
- planned tasks were completed or justifiably replanned
- output exists
- blockers were resolved or recorded
- execution stayed aligned with the spec and plan, or deviations were documented

### 8.5 Verification is complete when
- the rubric was applied
- the final score was calculated
- evidence was registered
- the final verdict was issued

---

## 9. Research Policy

### 9.1 Research is mandatory when there is
- a new integration
- a new language
- a new technology
- a relevant external dependency
- material technical uncertainty
- external behavior that is not reliable or sufficiently known

### 9.2 Research is optional when there is
- a low-uncertainty small or medium feature
- a localized light refactor
- a change using already mastered technical patterns
- a need to increase confidence before planning

### 9.3 Research must not
- replace the spec
- become endless exploration
- block a simple task that is already sufficiently understood
- become an excuse to avoid necessary decisions

### 9.4 Valid research must produce
- findings
- implications
- decisions
- concrete adjustments to the spec and/or plan

---

## 10. Overhead Policy

The process must be proportional to the size and risk of the change.

### 10.1 Operational limits
- quick adjustment: up to 5 minutes of documentation overhead
- small feature: up to 15 minutes
- medium feature or more sensitive light refactor: up to 30 minutes

### 10.2 Containment rule
If overhead exceeds these limits without clear gains in:
- clarity
- safety
- quality
- reviewability
- context recovery

the process must be simplified.

### 10.3 Excess documentation is a design failure
More documentation than necessary is an operational failure, not a sign of maturity.

---

## 11. Testing Policy

### 11.1 Every change must declare expected tests
No valid task exists without expected tests or formal justification for their absence.

### 11.2 Tests must be proportional to risk
Higher impact changes require stronger validation.

### 11.3 Tests should prioritize
- regression risk
- altered core behavior
- sensitive integration
- functional contract
- readability of validation

### 11.4 “Seems to work” is not evidence
Intuitive validation does not replace tests, evidence, or explicit justification.

---

## 12. Verification Policy

Verification is an exit gate.

### 12.1 Official rubric
- spec adherence: 25
- plan adherence: 20
- output quality: 20
- tests and evidence: 20
- reviewability and clarity: 15

### 12.2 Score bands
- 0–59: failed
- 60–79: incomplete
- 80–89: acceptable but not complete
- 90–100: complete

### 12.3 Completion condition
No feature or task closes with a final score below 90.

### 12.4 Invalid verification
Verification is invalid when:
- there is no justification per dimension
- there is no real evidence
- there is no traceability between output and acceptance criteria
- a critical pending issue remains open
- the score was inflated without basis

---

## 13. Scope Change Policy

### 13.1 Scope may not silently expand
Any relevant scope expansion must be recorded and reflected in the spec, the plan, and, when needed, the tasks.

### 13.2 Structural change requires documentation updates
If the actual solution materially diverges from the plan, it must be documented before closure.

### 13.3 Scope creep is an operational failure
Adding unrequested value, extra abstraction, or adjacent capabilities without scope review is considered deviation.

---

## 14. Technical Decision Policy

### 14.1 Relevant decisions must be recorded
Whenever there is:
- a significant change in approach
- a relevant trade-off
- a deliberate simplification
- the rejection of a meaningful alternative
- a change in technical risk

there must be a decision log entry or equivalent record.

### 14.2 A good technical decision is auditable
Every important technical decision must answer:
- what was decided
- why it was decided
- what was discarded
- what impact it creates

---

## 15. Operational State Policy

### 15.1 State must be explicit
`state.json` is the minimum source of operational truth for the feature.

### 15.2 State must reflect reality
It is forbidden to mark progress that did not happen or inflate feature maturity.

### 15.3 Minimum required fields
State must reflect:
- current phase
- current checkpoint
- blockers
- verification score
- artifact presence
- per-stage progress

### 15.4 Inconsistent state is a failure
If `state.json` materially diverges from execution reality, the feature must be considered operationally inconsistent.

---

## 16. Mandatory Checkpoints

The system’s mandatory checkpoints are:
- after constitution
- after spec/clarify
- after research, when applicable
- after plan
- after tasks
- before final closure

### 16.1 Purpose of checkpoints
A checkpoint exists to verify coherence and reduce accumulated error.

### 16.2 Checkpoints are not ceremonial
If there is structural misalignment, the phase must be corrected before proceeding.

---

## 17. Prohibited Anti-Patterns

The following are prohibited anti-patterns:

- starting from code without a spec
- defining scope mid-flight without updating the spec
- using overly vague tasks
- creating abstraction before real need
- using research to avoid decisions
- treating verification as empty ceremony
- closing with a critical pending issue
- marking done without evidence
- expanding the feature without scope review
- operating with implicit state
- hiding complexity behind “flexibility”
- accepting ambiguity that compromises planning or review

---

## 18. Solution Quality Criteria

A solution is technically adequate when it:
- satisfies the declared objective
- respects the defined scope
- has proportional complexity
- is reviewable
- treats risk explicitly
- has sufficient evidence
- can be resumed without rebuilding context from scratch

---

## 19. Process Failure Criteria

The process fails when:
- execution depends on tacit memory
- implementation drifts from the spec without updates
- the plan no longer governs execution
- tasks do not represent real work
- verification is merely symbolic
- future recovery becomes costly or ambiguous
- delivered complexity unnecessarily exceeds the problem solved

---

## 20. MVP Success Criteria

The MVP is operationally successful when, through repeated use, it:
- reduces rework
- improves context recovery
- increases satisfaction of use
- preserves quality without excessive bureaucracy
- creates a clear trail from intent to execution to review

---

## 21. Authority of the Constitution

In case of conflict between:
- an ad hoc prompt
- a temporary preference
- an execution shortcut
- an informal habit

and this constitution, this constitution prevails.

Exceptions are allowed only when they are:
- explicitly recorded
- justified
- compatible with system goals
- limited to the specific case

---

## 22. Evolution Clause

This constitution may be revised in future versions, but every revision must:
- preserve or improve operational coherence
- reduce ambiguity
- maintain rule testability
- avoid ornamental process growth

Changes to the constitution must not make the system more “elegant”; they must make it more reliable.
