import { appendFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { ensureDir } from "../fs-utils";
import type { PhaseRecord, RunRecord, RunStatus } from "./types";

export function getRuntimeDir(cwd: string): string {
  return join(cwd, ".elf");
}

export function getStateDir(cwd: string): string {
  return join(getRuntimeDir(cwd), "state");
}

export function getPhasesDir(cwd: string): string {
  return join(getRuntimeDir(cwd), "phases");
}

export function getPhaseDir(cwd: string, phaseId: string): string {
  return join(getPhasesDir(cwd), phaseId);
}

export function getRunsDir(cwd: string): string {
  return join(getRuntimeDir(cwd), "runs");
}

export function getRunDir(cwd: string, runId: string): string {
  return join(getRunsDir(cwd), runId);
}

export function getRunJsonPath(cwd: string, runId: string): string {
  return join(getRunDir(cwd, runId), "run.json");
}

export function getRunEventsPath(cwd: string, runId: string): string {
  return join(getRunDir(cwd, runId), "events.jsonl");
}

export function getCurrentRunPath(cwd: string): string {
  return join(getStateDir(cwd), "current-run.json");
}

export function getPhaseJsonPath(cwd: string, phaseId: string): string {
  return join(getPhaseDir(cwd, phaseId), "phase.json");
}

export function writeJsonFile(path: string, value: unknown): void {
  ensureDir(join(path, ".."));
  writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");
}

export function readJsonFile<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function appendJsonLine(path: string, value: unknown): void {
  ensureDir(join(path, ".."));
  appendFileSync(path, JSON.stringify(value) + "\n", "utf8");
}

export function ensurePhaseArtifactStore(
  cwd: string,
  phaseId: string,
  workflowId: string,
  createdAt = new Date().toISOString()
): PhaseRecord {
  const phasePath = getPhaseJsonPath(cwd, phaseId);
  const existing = existsSync(phasePath);
  let phase: PhaseRecord = {
    phaseId,
    workflowId,
    createdAt,
    updatedAt: createdAt,
  };

  if (existing) {
    try {
      const current = readJsonFile<PhaseRecord>(phasePath);
      phase = {
        phaseId: current.phaseId ?? phaseId,
        workflowId: current.workflowId ?? workflowId,
        createdAt: current.createdAt ?? createdAt,
        updatedAt: createdAt,
      };
    } catch {
      /* keep new record */
    }
  }

  ensureDir(getPhaseDir(cwd, phaseId));
  writeJsonFile(phasePath, phase);
  return phase;
}

export function ensureRunArtifacts(
  cwd: string,
  run: RunRecord,
  event: Record<string, unknown>
): RunRecord {
  ensureDir(getRunDir(cwd, run.runId));
  writeJsonFile(getRunJsonPath(cwd, run.runId), run);
  appendJsonLine(getRunEventsPath(cwd, run.runId), event);
  writeJsonFile(getCurrentRunPath(cwd), {
    runId: run.runId,
    workflowId: run.workflowId,
    phaseId: run.phaseId,
    status: run.status,
    updatedAt: run.updatedAt,
  });
  return run;
}

export function persistRun(
  cwd: string,
  run: RunRecord,
  event: Record<string, unknown>
): RunRecord {
  return ensureRunArtifacts(cwd, run, event);
}

export function readRunArtifacts(cwd: string, runId: string): RunRecord {
  const runPath = getRunJsonPath(cwd, runId);
  if (!existsSync(runPath)) {
    throw new Error(`Missing run record: ${runPath}`);
  }
  return readJsonFile<RunRecord>(runPath);
}

export function readCurrentRunPointer(cwd: string): {
  runId: string;
  workflowId: string;
  phaseId?: string;
  status: RunStatus;
  updatedAt: string;
} | null {
  const path = getCurrentRunPath(cwd);
  if (!existsSync(path)) return null;
  try {
    return readJsonFile<{
      runId: string;
      workflowId: string;
      phaseId?: string;
      status: RunStatus;
      updatedAt: string;
    }>(path);
  } catch {
    return null;
  }
}
