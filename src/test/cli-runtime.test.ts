import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawnSync } from "child_process";
import { loadRun } from "../core/runtime/run-store";

test("elf run requires an initialized runtime", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const cwd = mkdtempSync(join(tmpdir(), "elf-runtime-uninitialized-"));

  try {
    const run = spawnSync(
      process.execPath,
      [binPath, "run", "--workflow", "phase", "--title", "User auth"],
      { cwd, encoding: "utf8" }
    );
    assert.equal(run.status, 1, run.stderr ?? run.stdout);
    assert.match(run.stderr, /elf run: run elf init first/);
    assert.equal(existsSync(join(cwd, ".elf")), false);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("elf runtime commands manage .elf state", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const cwd = mkdtempSync(join(tmpdir(), "elf-runtime-cli-"));

  try {
    const init = spawnSync(
      process.execPath,
      [binPath, "init", "--allow-anywhere"],
      { cwd, encoding: "utf8" }
    );
    assert.equal(init.status, 0, init.stderr ?? init.stdout);

    const doctor = spawnSync(process.execPath, [binPath, "doctor", "--strict"], {
      cwd,
      encoding: "utf8",
    });
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /Result:\s+OK/);
    assert.match(doctor.stdout, /\.elf/);

    const run = spawnSync(
      process.execPath,
      [binPath, "run", "--workflow", "phase", "--title", "User auth"],
      { cwd, encoding: "utf8" }
    );
    assert.equal(run.status, 0, run.stderr ?? run.stdout);
    assert.match(run.stdout, /Run ID:\s*[A-Za-z0-9-]+/);
    assert.match(run.stdout, /Workflow:\s*phase/);
    assert.match(run.stdout, /Status:\s*active/);

    const currentRun = JSON.parse(
      readFileSync(join(cwd, ".elf", "state", "current-run.json"), "utf8")
    ) as { runId: string; phaseId?: string; status: string };
    assert.ok(currentRun.runId);
    assert.equal(currentRun.status, "active");

    const loadedRun = loadRun(cwd, currentRun.runId);
    assert.equal(loadedRun.runId, currentRun.runId);
    assert.equal(loadedRun.status, "active");
    assert.ok(currentRun.phaseId);
    assert.ok(existsSync(join(cwd, ".elf", "phases", currentRun.phaseId)));
    const phaseState = JSON.parse(
      readFileSync(join(cwd, ".elf", "phases", currentRun.phaseId, "state.json"), "utf8")
    ) as { currentStep: string; completedSteps: string[] };
    assert.equal(phaseState.currentStep, "research");
    assert.deepEqual(phaseState.completedSteps, ["start"]);
    assert.ok(existsSync(join(cwd, ".elf", "phases", currentRun.phaseId, "spec.md")));
    assert.ok(existsSync(join(cwd, ".elf", "phases", currentRun.phaseId, "plan.md")));
    assert.ok(existsSync(join(cwd, ".elf", "phases", currentRun.phaseId, "tasks.md")));
    assert.ok(existsSync(join(cwd, ".elf", "phases", currentRun.phaseId, "research.md")));
    assert.ok(existsSync(join(cwd, ".elf", "phases", currentRun.phaseId, "verification.md")));
    assert.ok(existsSync(join(cwd, ".elf", "phases", currentRun.phaseId, "decision-log.md")));

    const resume = spawnSync(process.execPath, [binPath, "resume", currentRun.runId], {
      cwd,
      encoding: "utf8",
    });
    assert.equal(resume.status, 0, resume.stderr ?? resume.stdout);
    assert.match(resume.stdout, new RegExp(currentRun.runId));
    assert.match(resume.stdout, /Status:\s*active/);
    assert.match(resume.stdout, /Current step:\s*research/);

    const review = spawnSync(process.execPath, [binPath, "review", currentRun.runId], {
      cwd,
      encoding: "utf8",
    });
    assert.equal(review.status, 0, review.stderr ?? review.stdout);
    assert.match(review.stdout, /Review scaffold/);
    assert.match(review.stdout, new RegExp(currentRun.runId));

    const verify = spawnSync(process.execPath, [binPath, "verify", currentRun.runId], {
      cwd,
      encoding: "utf8",
    });
    assert.equal(verify.status, 0, verify.stderr ?? verify.stdout);
    assert.match(verify.stdout, /Verification result:\s*passed/);
    assert.match(verify.stdout, /Status:\s*waiting-verification/);

    const verification = JSON.parse(
      readFileSync(
        join(cwd, ".elf", "runs", currentRun.runId, "verifier.json"),
        "utf8"
      )
    ) as { runId: string; status: string };
    assert.equal(verification.runId, currentRun.runId);
    assert.equal(verification.status, "passed");

    const updatedRun = loadRun(cwd, currentRun.runId);
    assert.equal(updatedRun.status, "waiting-verification");
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
