import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawnSync } from "child_process";

test("elf adapter install codex writes the Codex adapter bundle", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const cwd = mkdtempSync(join(tmpdir(), "elf-codex-adapter-"));

  try {
    const result = spawnSync(
      process.execPath,
      [binPath, "adapter", "install", "codex", "--allow-anywhere"],
      { cwd, encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr ?? result.stdout);
    assert.match(result.stdout, /elf adapter install codex/);

    assert.deepStrictEqual(
      readdirSync(join(cwd, ".agents", "skills")).sort(),
      [
        "elf-close",
        "elf-execute",
        "elf-plan",
        "elf-research",
        "elf-review",
        "elf-run",
        "elf-start",
        "elf-verify",
      ]
    );
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-start", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-research", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-plan", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-execute", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-close", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-run", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-review", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-verify", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".codex", "hooks.json")));
    assert.ok(existsSync(join(cwd, "codex", "rules", "default.rules")));
    assert.ok(existsSync(join(cwd, ".codex", "agents", "verifier.toml")));

    const runSkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-run", "SKILL.md"),
      "utf8"
    );
    assert.match(runSkill, /elf phase start/);

    const startSkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-start", "SKILL.md"),
      "utf8"
    );
    assert.match(startSkill, /elf phase start/);

    const researchSkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-research", "SKILL.md"),
      "utf8"
    );
    assert.match(researchSkill, /elf phase research/);

    const planSkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-plan", "SKILL.md"),
      "utf8"
    );
    assert.match(planSkill, /elf phase plan/);

    const executeSkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-execute", "SKILL.md"),
      "utf8"
    );
    assert.match(executeSkill, /elf phase execute/);

    const reviewSkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-review", "SKILL.md"),
      "utf8"
    );
    assert.match(reviewSkill, /elf review/);
    assert.match(reviewSkill, /elf mcp serve/);

    const verifySkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-verify", "SKILL.md"),
      "utf8"
    );
    assert.match(verifySkill, /elf phase verify/);

    const closeSkill = readFileSync(
      join(cwd, ".agents", "skills", "elf-close", "SKILL.md"),
      "utf8"
    );
    assert.match(closeSkill, /elf phase close/);

    const hooks = readFileSync(join(cwd, ".codex", "hooks.json"), "utf8");
    assert.match(hooks, /elf mcp serve/);
    assert.match(hooks, /elf init/);

    const rules = readFileSync(join(cwd, "codex", "rules", "default.rules"), "utf8");
    assert.match(rules, /elf phase start/);
    assert.match(rules, /elf phase plan/);
    assert.match(rules, /elf phase execute/);
    assert.match(rules, /elf phase verify/);

    const verifier = readFileSync(join(cwd, ".codex", "agents", "verifier.toml"), "utf8");
    assert.match(verifier, /elf phase verify/);
    assert.match(verifier, /elf phase close/);

    const doctor = spawnSync(
      process.execPath,
      [binPath, "adapter", "doctor", "codex", "--strict"],
      { cwd, encoding: "utf8" }
    );
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /Result: OK/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("elf adapter update codex repairs a missing adapter subtree", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const cwd = mkdtempSync(join(tmpdir(), "elf-codex-adapter-update-"));

  try {
    const install = spawnSync(
      process.execPath,
      [binPath, "adapter", "install", "codex", "--allow-anywhere"],
      { cwd, encoding: "utf8" }
    );

    assert.equal(install.status, 0, install.stderr ?? install.stdout);

    rmSync(join(cwd, ".agents", "skills"), { recursive: true, force: true });

    const update = spawnSync(
      process.execPath,
      [binPath, "adapter", "update", "codex"],
      { cwd, encoding: "utf8" }
    );

    assert.equal(update.status, 0, update.stderr ?? update.stdout);
    assert.match(update.stdout, /elf adapter update codex/);

    assert.deepStrictEqual(
      readdirSync(join(cwd, ".agents", "skills")).sort(),
      [
        "elf-close",
        "elf-execute",
        "elf-plan",
        "elf-research",
        "elf-review",
        "elf-run",
        "elf-start",
        "elf-verify",
      ]
    );
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-start", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-research", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-plan", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-execute", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-close", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-run", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-review", "SKILL.md")));
    assert.ok(existsSync(join(cwd, ".agents", "skills", "elf-verify", "SKILL.md")));

    const doctor = spawnSync(
      process.execPath,
      [binPath, "adapter", "doctor", "codex", "--strict"],
      { cwd, encoding: "utf8" }
    );
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /Result: OK/);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
