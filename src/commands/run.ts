import { toKebabCase } from "../core/naming";
import { advanceWorkflowState } from "../core/runtime/chain-engine";
import { buildRuntimeContext } from "../core/runtime/context-builder";
import { createRun } from "../core/runtime/run-store";

export type RunOptions = {
  workflowId: string;
  title: string;
};

export function runElfWorkflow(
  cwd: string,
  opts: RunOptions
): { runId: string; workflowId: string; phaseId?: string; status: string } {
  const context = buildRuntimeContext(cwd);
  if (!context.config || !context.runtimeMeta) {
    throw new Error("elf run: run elf init first");
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
