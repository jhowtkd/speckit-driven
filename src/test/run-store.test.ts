import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { createRun, loadRun } from "../core/runtime/run-store";

test("run store creates durable runtime state", () => {
  const cwd = mkdtempSync(join(tmpdir(), "elf-run-store-"));

  try {
    const run = createRun({
      cwd,
      workflowId: "phase",
      phaseId: "042-user-auth",
    });

    assert.equal(run.status, "pending");
    assert.ok(run.runId.length > 0);
    assert.ok(existsSync(join(cwd, ".elf", "phases", "042-user-auth")));
    assert.ok(existsSync(join(cwd, ".elf", "runs", run.runId, "run.json")));
    assert.ok(existsSync(join(cwd, ".elf", "runs", run.runId, "events.jsonl")));
    assert.ok(existsSync(join(cwd, ".elf", "state", "current-run.json")));

    const loaded = loadRun(cwd, run.runId);
    assert.equal(loaded.runId, run.runId);
    assert.equal(loaded.workflowId, "phase");
    assert.equal(loaded.phaseId, "042-user-auth");
    assert.equal(loaded.status, "pending");

    const eventLog = readFileSync(
      join(cwd, ".elf", "runs", run.runId, "events.jsonl"),
      "utf8"
    );
    assert.match(eventLog, /"type":"run-created"/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
