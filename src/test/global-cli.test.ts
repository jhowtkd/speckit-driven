import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import { join } from "path";

test("ELF exposes a dedicated global command tree", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");

  const rootHelp = spawnSync(process.execPath, [binPath, "--help"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(rootHelp.status, 0, rootHelp.stderr ?? rootHelp.stdout);
  assert.match(rootHelp.stdout, /\bglobal\b/);
  assert.match(rootHelp.stdout, /Validate \.elf\/ against the bundled ELF runtime/);

  const globalHelp = spawnSync(process.execPath, [binPath, "global", "--help"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(globalHelp.status, 0, globalHelp.stderr ?? globalHelp.stdout);
  assert.match(globalHelp.stdout, /install(?:\s+\[options\])?\s+<host>/);
  assert.match(globalHelp.stdout, /update(?:\s+\[options\])?\s+<host>/);
  assert.match(globalHelp.stdout, /doctor(?:\s+\[options\])?\s+<host>/);
  assert.match(globalHelp.stdout, /uninstall <host>/);
  assert.match(globalHelp.stdout, /Validate host-global ELF setup/);
});
