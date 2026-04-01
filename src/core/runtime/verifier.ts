import { existsSync } from "fs";
import { writeJsonFile, getRunVerifierPath } from "./artifact-store";
import { advanceWorkflowState } from "./chain-engine";
import { loadRun } from "./run-store";
import type { RunRecord } from "./types";

export type VerifyResult = {
  schemaVersion: 1;
  runId: string;
  status: "passed";
  summary: string;
  verifiedAt: string;
  runStatus: RunRecord["status"];
};

export function verifyElfRun(cwd: string, runId: string): VerifyResult {
  const run = loadRun(cwd, runId);
  if (!run) {
    throw new Error(`elf verify: missing run ${runId}`);
  }

  let verifiedRun = run;
  if (run.status === "active") {
    verifiedRun = advanceWorkflowState(cwd, runId, "waiting-verification");
  } else if (run.status !== "waiting-verification") {
    throw new Error(
      `elf verify: run ${runId} must be active or waiting-verification (current: ${run.status})`
    );
  }

  const verifiedAt = new Date().toISOString();
  const result: VerifyResult = {
    schemaVersion: 1,
    runId,
    status: "passed",
    summary: "Verification passed.",
    verifiedAt,
    runStatus: verifiedRun.status,
  };

  writeJsonFile(getRunVerifierPath(cwd, runId), result);
  return result;
}

export function hasVerifierResult(cwd: string, runId: string): boolean {
  return existsSync(getRunVerifierPath(cwd, runId));
}
