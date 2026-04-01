import { loadRun } from "../core/runtime/run-store";
import { loadPhaseState } from "../core/runtime/phase-flow";

export function resumeElfRun(
  cwd: string,
  runId: string
): { runId: string; workflowId: string; phaseId?: string; status: string } {
  const run = loadRun(cwd, runId);
  if (!run) {
    throw new Error(`elf resume: missing run ${runId}`);
  }

  console.log("elf resume");
  console.log(`Run ID: ${run.runId}`);
  console.log(`Workflow: ${run.workflowId}`);
  console.log(`Phase ID: ${run.phaseId ?? "-"}`);
  if (run.workflowId === "phase" && run.phaseId) {
    const phaseState = loadPhaseState(cwd, run.phaseId);
    console.log(`Current step: ${phaseState.currentStep}`);
  }
  console.log(`Status: ${run.status}`);

  return run;
}
