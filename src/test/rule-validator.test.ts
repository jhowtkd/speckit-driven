import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "child_process";
import { join } from "path";

test("validate:rules checks both legacy and ELF adapter bundles", () => {
  const root = join(__dirname, "..", "..");
  const script = join(root, "scripts", "validate-rules.mjs");

  const out = execFileSync(process.execPath, [script], {
    cwd: root,
    encoding: "utf8",
  });

  assert.match(out, /assets\/cursor\/rules/);
  assert.match(out, /assets\/adapters\/cursor\/rules/);
});
