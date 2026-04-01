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
      ["elf-review", "elf-run", "elf-verify"]
    );
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
    assert.match(runSkill, /elf init/);
    assert.match(runSkill, /elf mcp serve/);

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
    assert.match(verifySkill, /elf verify/);
    assert.match(verifySkill, /elf mcp serve/);

    const hooks = readFileSync(join(cwd, ".codex", "hooks.json"), "utf8");
    assert.match(hooks, /elf mcp serve/);
    assert.match(hooks, /elf init/);

    const rules = readFileSync(join(cwd, "codex", "rules", "default.rules"), "utf8");
    assert.match(rules, /elf init/);
    assert.match(rules, /elf mcp serve/);

    const verifier = readFileSync(join(cwd, ".codex", "agents", "verifier.toml"), "utf8");
    assert.match(verifier, /elf verify/);
    assert.match(verifier, /elf mcp serve/);

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
      ["elf-review", "elf-run", "elf-verify"]
    );
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
