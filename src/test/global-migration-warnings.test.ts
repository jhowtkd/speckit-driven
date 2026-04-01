import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

test("global doctor cursor warns when a project-local adapter is also present", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const homeDir = mkdtempSync(join(tmpdir(), "elf-global-warning-home-"));
  const cwd = mkdtempSync(join(tmpdir(), "elf-global-warning-cursor-project-"));

  try {
    const env = { ...process.env, HOME: homeDir };

    const globalInstall = spawnSync(
      process.execPath,
      [binPath, "global", "install", "cursor"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(globalInstall.status, 0, globalInstall.stderr ?? globalInstall.stdout);

    const localInstall = spawnSync(
      process.execPath,
      [binPath, "adapter", "install", "cursor", "--allow-anywhere"],
      { cwd, env, encoding: "utf8" }
    );
    assert.equal(localInstall.status, 0, localInstall.stderr ?? localInstall.stdout);

    const doctor = spawnSync(
      process.execPath,
      [binPath, "global", "doctor", "cursor", "--strict"],
      { cwd, env, encoding: "utf8" }
    );
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /project-local Cursor adapter is also present/i);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
    rmSync(cwd, { recursive: true, force: true });
  }
});

test("global doctor codex warns when a project-local adapter is also present", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const homeDir = mkdtempSync(join(tmpdir(), "elf-global-warning-home-"));
  const cwd = mkdtempSync(join(tmpdir(), "elf-global-warning-codex-project-"));

  try {
    const env = { ...process.env, HOME: homeDir };

    const globalInstall = spawnSync(
      process.execPath,
      [binPath, "global", "install", "codex"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(globalInstall.status, 0, globalInstall.stderr ?? globalInstall.stdout);

    const localInstall = spawnSync(
      process.execPath,
      [binPath, "adapter", "install", "codex", "--allow-anywhere"],
      { cwd, env, encoding: "utf8" }
    );
    assert.equal(localInstall.status, 0, localInstall.stderr ?? localInstall.stdout);

    const doctor = spawnSync(
      process.execPath,
      [binPath, "global", "doctor", "codex", "--strict"],
      { cwd, env, encoding: "utf8" }
    );
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /project-local Codex adapter is also present/i);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
    rmSync(cwd, { recursive: true, force: true });
  }
});
