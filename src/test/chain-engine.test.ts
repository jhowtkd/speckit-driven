import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "fs";
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
