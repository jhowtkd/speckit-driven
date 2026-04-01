import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { join } from "path";
import {
  ensurePhaseArtifactStore,
  getCurrentRunPath,
  getRunJsonPath,
  getRunEventsPath,
  persistRun,
  readRunArtifacts,
} from "./artifact-store";
import type { RunRecord, RunStatus } from "./types";

export type CreateRunOptions = {
  cwd: string;
  workflowId: string;
  phaseId?: string;
};

function createRunId(workflowId: string, phaseId?: string): string {
  const suffix = randomUUID().split("-")[0];
  return phaseId ? `${workflowId}-${phaseId}-${suffix}` : `${workflowId}-${suffix}`;
}

export function createRun(options: CreateRunOptions): RunRecord {
  const createdAt = new Date().toISOString();
  const runId = createRunId(options.workflowId, options.phaseId);

  if (options.phaseId) {
    ensurePhaseArtifactStore(options.cwd, options.phaseId, options.workflowId, createdAt);
  }

  const run: RunRecord = {
    runId,
    workflowId: options.workflowId,
    phaseId: options.phaseId,
    status: "pending",
    createdAt,
    updatedAt: createdAt,
  };

  persistRun(options.cwd, run, {
    type: "run-created",
    at: createdAt,
    runId,
    workflowId: options.workflowId,
    phaseId: options.phaseId,
  });

  return run;
}

export function loadRun(cwd: string, runId: string): RunRecord {
  return readRunArtifacts(cwd, runId);
}

export function saveRun(cwd: string, run: RunRecord, event: Record<string, unknown>): RunRecord {
  return persistRun(cwd, run, event);
}

export function readRunExists(cwd: string, runId: string): boolean {
  return existsSync(getRunJsonPath(cwd, runId)) && existsSync(getRunEventsPath(cwd, runId));
}

export function hasCurrentRun(cwd: string): boolean {
  return existsSync(getCurrentRunPath(cwd));
}

export type { RunRecord, RunStatus } from "./types";
