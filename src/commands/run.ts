import { toKebabCase } from "../core/naming";
import { advanceWorkflowState } from "../core/runtime/chain-engine";
import { buildRuntimeContext } from "../core/runtime/context-builder";
import { startPhaseFlow } from "../core/runtime/phase-flow";
import { createRun } from "../core/runtime/run-store";

export type RunOptions = {
  workflowId: string;
  title: string;
};

export function runElfWorkflow(
  cwd: string,
  opts: RunOptions
): {
  runId: string;
  workflowId: string;
  phaseId?: string;
  status: string;
  currentStep?: string;
  nextStep?: string | null;
} {
  const context = buildRuntimeContext(cwd);
  if (!context.config || !context.runtimeMeta) {
    throw new Error("elf run: run elf init first");
  }

  if (opts.workflowId === "phase") {
    const started = startPhaseFlow(cwd, opts.title);
    console.log("elf run");
    console.log(`Run ID: ${started.runId}`);
    console.log("Workflow: phase");
    console.log(`Phase ID: ${started.phaseId}`);
    console.log(`Current step: ${started.currentStep}`);
    console.log(`Next step: ${started.nextStep ?? "-"}`);
    console.log(`Status: ${started.status}`);
    return {
      runId: started.runId,
      workflowId: "phase",
      phaseId: started.phaseId,
      status: started.status,
      currentStep: started.currentStep,
      nextStep: started.nextStep,
    };
  }

  const phaseId = toKebabCase(opts.title) || opts.workflowId;
  const created = createRun({
    cwd,
    workflowId: opts.workflowId,
    phaseId,
  });
  const active = advanceWorkflowState(cwd, created.runId, "active");

  console.log("elf run");
  console.log(`Run ID: ${active.runId}`);
  console.log(`Workflow: ${active.workflowId}`);
  console.log(`Phase ID: ${active.phaseId ?? "-"}`);
  console.log(`Status: ${active.status}`);

  return active;
}
