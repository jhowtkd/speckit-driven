import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { createRun, loadRun } from "../core/runtime/run-store";
import {
  advanceWorkflowState,
  loadCurrentRun,
} from "../core/runtime/chain-engine";

test("chain engine advances and persists run state transitions", () => {
  const cwd = mkdtempSync(join(tmpdir(), "elf-chain-engine-"));

  try {
    const created = createRun({
      cwd,
      workflowId: "phase",
      phaseId: "042-user-auth",
    });

    const active = advanceWorkflowState(cwd, created.runId, "active");
    assert.equal(active.status, "active");

    const waiting = advanceWorkflowState(cwd, created.runId, "waiting-verification");
    assert.equal(waiting.status, "waiting-verification");

    const reopened = advanceWorkflowState(cwd, created.runId, "reopened");
    assert.equal(reopened.status, "reopened");

    const loaded = loadRun(cwd, created.runId);
    assert.equal(loaded.status, "reopened");

    const current = loadCurrentRun(cwd);
    assert.equal(current?.runId, created.runId);
    assert.equal(current?.status, "reopened");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("loadCurrentRun returns null when the run record is missing or corrupted", () => {
  const cwd = mkdtempSync(join(tmpdir(), "elf-chain-engine-missing-"));

  try {
    const created = createRun({
      cwd,
      workflowId: "phase",
      phaseId: "042-user-auth",
    });

    const runPath = join(cwd, ".elf", "runs", created.runId, "run.json");
    rmSync(runPath, { force: true });
    assert.equal(loadCurrentRun(cwd), null);

    const second = createRun({
      cwd,
      workflowId: "phase",
      phaseId: "042-user-auth",
    });
    const secondRunPath = join(cwd, ".elf", "runs", second.runId, "run.json");
    writeFileSync(secondRunPath, "{not-json", "utf8");
    assert.equal(loadCurrentRun(cwd), null);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
