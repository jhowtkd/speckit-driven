import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { loadRun } from "../core/runtime/run-store";

test("elf phase commands drive a real chained phase workflow", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const cwd = mkdtempSync(join(tmpdir(), "elf-phase-cli-"));

  try {
    const init = spawnSync(
      process.execPath,
      [binPath, "init", "--allow-anywhere"],
      { cwd, encoding: "utf8" }
    );
    assert.equal(init.status, 0, init.stderr ?? init.stdout);

    const start = spawnSync(
      process.execPath,
      [binPath, "phase", "start", "--title", "User auth"],
      { cwd, encoding: "utf8" }
    );
    assert.equal(start.status, 0, start.stderr ?? start.stdout);
    assert.match(start.stdout, /Next step:\s*research/);

    const currentRun = JSON.parse(
      readFileSync(join(cwd, ".elf", "state", "current-run.json"), "utf8")
    ) as { runId: string; phaseId: string };
    assert.ok(currentRun.runId);
    assert.equal(currentRun.phaseId, "user-auth");

    const research = spawnSync(
      process.execPath,
      [binPath, "phase", "research", currentRun.runId],
      { cwd, encoding: "utf8" }
    );
    assert.equal(research.status, 0, research.stderr ?? research.stdout);
    assert.match(research.stdout, /Next step:\s*plan/);

    const plan = spawnSync(
      process.execPath,
      [binPath, "phase", "plan", currentRun.runId],
      { cwd, encoding: "utf8" }
    );
    assert.equal(plan.status, 0, plan.stderr ?? plan.stdout);
    assert.match(plan.stdout, /Next step:\s*execute/);

    const execute = spawnSync(
      process.execPath,
      [binPath, "phase", "execute", currentRun.runId],
      { cwd, encoding: "utf8" }
    );
    assert.equal(execute.status, 0, execute.stderr ?? execute.stdout);
    assert.match(execute.stdout, /Next step:\s*verify/);

    const verify = spawnSync(
      process.execPath,
      [binPath, "phase", "verify", currentRun.runId],
      { cwd, encoding: "utf8" }
    );
    assert.equal(verify.status, 0, verify.stderr ?? verify.stdout);
    assert.match(verify.stdout, /Next step:\s*close/);
    assert.ok(
      existsSync(join(cwd, ".elf", "runs", currentRun.runId, "verifier.json"))
    );

    const close = spawnSync(
      process.execPath,
      [binPath, "phase", "close", currentRun.runId],
      { cwd, encoding: "utf8" }
    );
    assert.equal(close.status, 0, close.stderr ?? close.stdout);
    assert.match(close.stdout, /Status:\s*completed/);

    const phaseState = JSON.parse(
      readFileSync(join(cwd, ".elf", "phases", currentRun.phaseId, "state.json"), "utf8")
    ) as { currentStep: string; completedSteps: string[]; status: string };
    assert.equal(phaseState.currentStep, "done");
    assert.equal(phaseState.status, "completed");
    assert.deepEqual(phaseState.completedSteps, [
      "start",
      "research",
      "plan",
      "execute",
      "verify",
      "close",
    ]);

    const run = loadRun(cwd, currentRun.runId);
    assert.equal(run.status, "completed");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
