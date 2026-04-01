import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawnSync } from "child_process";

test("elf init bootstraps the runtime store", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const cwd = mkdtempSync(join(tmpdir(), "elf-init-runtime-"));

  try {
    const result = spawnSync(
      process.execPath,
      [binPath, "init", "--allow-anywhere"],
      {
        cwd,
        encoding: "utf8",
      }
    );

    assert.strictEqual(result.status, 0, result.stderr ?? result.stdout);
    assert.ok(existsSync(join(cwd, ".elf", "config.toml")));
    assert.ok(existsSync(join(cwd, ".elf", "workflows")));
    assert.ok(existsSync(join(cwd, ".elf", "templates")));
    assert.ok(existsSync(join(cwd, "AGENTS.md")));
    assert.ok(existsSync(join(cwd, ".elf", "state", "metadata.json")));

    const packageVersion = JSON.parse(
      readFileSync(join(root, "package.json"), "utf8")
    ) as { version?: string };
    const metadata = JSON.parse(
      readFileSync(join(cwd, ".elf", "state", "metadata.json"), "utf8")
    ) as { schemaVersion?: number; runtime?: string; version?: string };
    assert.equal(metadata.schemaVersion, 1);
    assert.equal(metadata.runtime, "elf");
    assert.equal(metadata.version, packageVersion.version);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
