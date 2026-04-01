import { existsSync } from "fs";
import { isAbsolute, join, resolve } from "path";
import { loadRun } from "../core/runtime/run-store";

export type ReviewTargetKind = "path" | "run";

export function reviewElfTarget(
  cwd: string,
  target: string
): { kind: ReviewTargetKind; target: string } {
  const pathTarget = isAbsolute(target) ? target : resolve(cwd, target);
  if (existsSync(pathTarget)) {
    console.log("elf review");
    console.log(`Target: ${pathTarget}`);
    console.log("Review scaffold:");
    console.log("- Findings");
    console.log("- Notes");
    return { kind: "path", target: pathTarget };
  }

  const run = loadRun(cwd, target);
  if (!run) {
    throw new Error(`elf review: missing run or path ${target}`);
  }

  console.log("elf review");
  console.log(`Target: run ${run.runId}`);
  console.log(`Workflow: ${run.workflowId}`);
  console.log("Review scaffold:");
  console.log("- Findings");
  console.log("- Notes");
  return { kind: "run", target: run.runId };
}
