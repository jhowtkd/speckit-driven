import {
  persistRun,
  readCurrentRunPointer,
  readRunArtifacts,
} from "./artifact-store";
import type { RunRecord, RunStatus } from "./types";

const ALLOWED_TRANSITIONS: Record<RunStatus, RunStatus[]> = {
  pending: ["active"],
  active: ["waiting-verification"],
  "waiting-verification": ["completed", "reopened"],
  completed: [],
  reopened: [],
};

export function advanceWorkflowState(
  cwd: string,
  runId: string,
  nextStatus: RunStatus
): RunRecord {
  const current = readRunArtifacts(cwd, runId);
  const allowed = ALLOWED_TRANSITIONS[current.status] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid transition ${current.status} -> ${nextStatus} for run ${runId}`
    );
  }

  const now = new Date().toISOString();
  const next: RunRecord = {
    ...current,
    status: nextStatus,
    updatedAt: now,
  };

  persistRun(cwd, next, {
    type: "run-status-changed",
    at: now,
    runId,
    workflowId: next.workflowId,
    phaseId: next.phaseId,
    fromStatus: current.status,
    toStatus: nextStatus,
  });

  return next;
}

export function loadCurrentRun(cwd: string): RunRecord | null {
  const pointer = readCurrentRunPointer(cwd);
  if (!pointer) return null;

  try {
    return readRunArtifacts(cwd, pointer.runId);
  } catch {
    return null;
  }
}
