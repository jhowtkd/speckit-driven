import { existsSync } from "fs";
import { toKebabCase } from "../naming";
import { writeUtf8 } from "../fs-utils";
import {
  getPhaseArtifactPath,
  getPhaseStatePath,
  readJsonFile,
  writeJsonFile,
} from "./artifact-store";
import { advanceWorkflowState } from "./chain-engine";
import { createRun, loadRun } from "./run-store";
import type { PhaseFlowState, PhaseStep, RunRecord } from "./types";
import { loadBundledRuntimeTemplates } from "./workflow-loader";
import { hasVerifierResult, verifyElfRun } from "./verifier";

const PHASE_STEP_ORDER = [
  "start",
  "research",
  "plan",
  "execute",
  "verify",
  "close",
] as const satisfies readonly Exclude<PhaseStep, "done">[];

type PhaseActionStep = Exclude<PhaseStep, "start" | "done">;

const NEXT_PHASE_STEP: Record<Exclude<PhaseStep, "done">, PhaseActionStep | null> = {
  start: "research",
  research: "plan",
  plan: "execute",
  execute: "verify",
  verify: "close",
  close: null,
};

export type PhaseStepResult = {
  runId: string;
  phaseId: string;
  status: RunRecord["status"];
  currentStep: PhaseStep;
  nextStep: PhaseActionStep | null;
};

function nextPhaseStep(
  step: Exclude<PhaseStep, "done">
): PhaseActionStep | null {
  return NEXT_PHASE_STEP[step];
}

function phaseArtifactContent(options: {
  artifactName: string;
  template: string;
  phaseId: string;
  runId: string;
  title: string;
}): string {
  const metadata = [
    `**Phase ID:** \`${options.phaseId}\``,
    `**Run ID:** \`${options.runId}\``,
    `**Title:** ${options.title}`,
  ].join("\n");
  return `${options.template}\n\n${metadata}\n`;
}

function ensurePhaseArtifacts(
  cwd: string,
  phaseId: string,
  runId: string,
  title: string
): void {
  const templates = loadBundledRuntimeTemplates();
  const markdownArtifacts: Record<string, string> = {
    "spec.md": templates["spec-template"],
    "research.md": templates["research-template"],
    "plan.md": templates["plan-template"],
    "tasks.md": templates["tasks-template"],
    "verification.md": templates["verification-template"],
  };

  for (const [artifactName, template] of Object.entries(markdownArtifacts)) {
    const artifactPath = getPhaseArtifactPath(cwd, phaseId, artifactName);
    if (!existsSync(artifactPath)) {
      writeUtf8(
        artifactPath,
        phaseArtifactContent({
          artifactName,
          template,
          phaseId,
          runId,
          title,
        })
      );
    }
  }

  const decisionLogPath = getPhaseArtifactPath(cwd, phaseId, "decision-log.md");
  if (!existsSync(decisionLogPath)) {
    writeUtf8(
      decisionLogPath,
      `# Decision Log\n\n**Phase ID:** \`${phaseId}\`\n**Run ID:** \`${runId}\`\n\n- Decision 1\n`
    );
  }
}

function writePhaseState(cwd: string, phaseId: string, state: PhaseFlowState): void {
  writeJsonFile(getPhaseStatePath(cwd, phaseId), state);
}

export function loadPhaseState(cwd: string, phaseId: string): PhaseFlowState {
  const statePath = getPhaseStatePath(cwd, phaseId);
  if (!existsSync(statePath)) {
    throw new Error(`Missing phase state: ${statePath}`);
  }
  return readJsonFile<PhaseFlowState>(statePath);
}

function loadPhaseStateForRun(cwd: string, runId: string): {
  run: RunRecord;
  state: PhaseFlowState;
} {
  const run = loadRun(cwd, runId);
  if (run.workflowId !== "phase" || !run.phaseId) {
    throw new Error(`elf phase: run ${runId} is not a phase workflow`);
  }

  return {
    run,
    state: loadPhaseState(cwd, run.phaseId),
  };
}

export function startPhaseFlow(
  cwd: string,
  title: string
): PhaseStepResult {
  const phaseId = toKebabCase(title) || "phase";
  const created = createRun({
    cwd,
    workflowId: "phase",
    phaseId,
  });
  const active = advanceWorkflowState(cwd, created.runId, "active");
  ensurePhaseArtifacts(cwd, phaseId, active.runId, title);

  const now = new Date().toISOString();
  const state: PhaseFlowState = {
    schemaVersion: 1,
    phaseId,
    runId: active.runId,
    workflowId: "phase",
    title,
    currentStep: "research",
    completedSteps: ["start"],
    status: "active",
    lastUpdatedAt: now,
  };
  writePhaseState(cwd, phaseId, state);

  return {
    runId: active.runId,
    phaseId,
    status: active.status,
    currentStep: state.currentStep,
    nextStep: "research",
  };
}

export function getPhaseProgress(cwd: string, runId: string): PhaseStepResult {
  const { run, state } = loadPhaseStateForRun(cwd, runId);
  return {
    runId: run.runId,
    phaseId: run.phaseId ?? state.phaseId,
    status: run.status,
    currentStep: state.currentStep,
    nextStep:
      state.currentStep === "done"
        ? null
        : (state.currentStep as PhaseActionStep),
  };
}

export function advancePhaseStep(
  cwd: string,
  runId: string,
  step: PhaseActionStep
): PhaseStepResult {
  const { run, state } = loadPhaseStateForRun(cwd, runId);
  if (state.currentStep !== step) {
    throw new Error(
      `elf phase ${step}: current step is ${state.currentStep}, not ${step}`
    );
  }

  const now = new Date().toISOString();
  let nextRun = run;
  let nextCurrentStep: PhaseStep = "done";
  let nextStatus: PhaseFlowState["status"] = state.status;

  if (step === "verify") {
    const result = verifyElfRun(cwd, runId);
    nextRun = loadRun(cwd, runId);
    nextCurrentStep = "close";
    nextStatus = result.runStatus as PhaseFlowState["status"];
  } else if (step === "close") {
    if (!hasVerifierResult(cwd, runId)) {
      throw new Error(
        `elf phase close: run ${runId} must be verified before closing`
      );
    }
    if (run.status === "waiting-verification") {
      nextRun = advanceWorkflowState(cwd, runId, "completed");
    } else if (run.status !== "completed") {
      throw new Error(
        `elf phase close: run ${runId} must be waiting-verification or completed`
      );
    }
    nextCurrentStep = "done";
    nextStatus = "completed";
  } else {
    nextCurrentStep = nextPhaseStep(step) ?? "done";
    nextStatus = state.status;
  }

  const nextState: PhaseFlowState = {
    ...state,
    runId: nextRun.runId,
    currentStep: nextCurrentStep,
    completedSteps: Array.from(
      new Set([...state.completedSteps, step])
    ) as PhaseFlowState["completedSteps"],
    status: nextStatus,
    lastUpdatedAt: now,
  };
  writePhaseState(cwd, state.phaseId, nextState);

  return {
    runId: nextRun.runId,
    phaseId: state.phaseId,
    status: nextRun.status,
    currentStep: nextState.currentStep,
    nextStep:
      nextState.currentStep === "done"
        ? null
        : (nextState.currentStep as PhaseActionStep),
  };
}
