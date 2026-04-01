import {
  advancePhaseStep,
  getPhaseProgress,
  startPhaseFlow,
} from "../core/runtime/phase-flow";

export type PhaseAction = "research" | "plan" | "execute" | "verify" | "close";

function printPhaseResult(
  label: string,
  result: {
    runId: string;
    phaseId: string;
    status: string;
    currentStep: string;
    nextStep: string | null;
  }
): void {
  console.log(label);
  console.log(`Run ID: ${result.runId}`);
  console.log(`Phase ID: ${result.phaseId}`);
  console.log(`Current step: ${result.currentStep}`);
  console.log(`Next step: ${result.nextStep ?? "-"}`);
  console.log(`Status: ${result.status}`);
}

export function runPhaseStart(
  cwd: string,
  title: string
): ReturnType<typeof startPhaseFlow> {
  const result = startPhaseFlow(cwd, title);
  printPhaseResult("elf phase start", result);
  return result;
}

export function runPhaseAction(
  cwd: string,
  step: PhaseAction,
  runId: string
): ReturnType<typeof advancePhaseStep> {
  const result = advancePhaseStep(cwd, runId, step);
  printPhaseResult(`elf phase ${step}`, result);
  return result;
}

export function runPhaseStatus(
  cwd: string,
  runId: string
): ReturnType<typeof getPhaseProgress> {
  const result = getPhaseProgress(cwd, runId);
  printPhaseResult("elf phase status", result);
  return result;
}
