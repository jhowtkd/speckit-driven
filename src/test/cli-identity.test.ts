import test from "node:test";
import assert from "node:assert";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

test("ELF CLI identity", () => {
  const root = join(__dirname, "..", "..");
  const elfBin = join(root, "bin", "elf.js");
  const aliasBin = join(root, "bin", "spec-driven-kit.js");

  assert.ok(existsSync(aliasBin), "compatibility alias must exist");

  const version = spawnSync(process.execPath, [elfBin, "--version"], {
    encoding: "utf8",
  });
  assert.strictEqual(version.status, 0, version.stderr ?? version.stdout);
  assert.match(version.stdout, /\d+\.\d+\.\d+/);

  const help = spawnSync(process.execPath, [elfBin, "--help"], {
    encoding: "utf8",
  });
  assert.strictEqual(help.status, 0, help.stderr ?? help.stdout);
  assert.match(help.stdout, /ELF/);

  const aliasVersion = spawnSync(process.execPath, [aliasBin, "--version"], {
    encoding: "utf8",
  });
  assert.strictEqual(aliasVersion.status, 0, aliasVersion.stderr ?? aliasVersion.stdout);
  assert.match(aliasVersion.stdout, /\d+\.\d+\.\d+/);
});
