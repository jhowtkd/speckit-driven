import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

test("elf global install and doctor codex operate on host-global paths", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const homeDir = mkdtempSync(join(tmpdir(), "elf-global-cli-codex-"));

  try {
    const env = { ...process.env, HOME: homeDir };

    const install = spawnSync(
      process.execPath,
      [binPath, "global", "install", "codex"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(install.status, 0, install.stderr ?? install.stdout);
    assert.match(install.stdout, /elf global install codex/);
    assert.ok(existsSync(join(homeDir, ".codex", ".elf-global.json")));

    const doctor = spawnSync(
      process.execPath,
      [binPath, "global", "doctor", "codex", "--strict"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /Result: OK/);
    assert.match(doctor.stdout, /\.codex/);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("elf global install and doctor cursor operate on host-global paths", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const homeDir = mkdtempSync(join(tmpdir(), "elf-global-cli-cursor-"));

  try {
    const env = { ...process.env, HOME: homeDir };

    const install = spawnSync(
      process.execPath,
      [binPath, "global", "install", "cursor"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(install.status, 0, install.stderr ?? install.stdout);
    assert.match(install.stdout, /elf global install cursor/);
    assert.ok(existsSync(join(homeDir, ".cursor", ".elf-global.json")));

    const doctor = spawnSync(
      process.execPath,
      [binPath, "global", "doctor", "cursor", "--strict"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /Result: OK/);
    assert.match(doctor.stdout, /\.cursor/);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("elf global doctor all checks both host-global installs", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const homeDir = mkdtempSync(join(tmpdir(), "elf-global-cli-all-"));

  try {
    const env = { ...process.env, HOME: homeDir };

    const install = spawnSync(
      process.execPath,
      [binPath, "global", "install", "all"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(install.status, 0, install.stderr ?? install.stdout);

    const doctor = spawnSync(
      process.execPath,
      [binPath, "global", "doctor", "all", "--strict"],
      { cwd: root, env, encoding: "utf8" }
    );
    assert.equal(doctor.status, 0, doctor.stderr ?? doctor.stdout);
    assert.match(doctor.stdout, /elf global doctor codex/);
    assert.match(doctor.stdout, /elf global doctor cursor/);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});
