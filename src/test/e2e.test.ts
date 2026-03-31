import test from "node:test";
import assert from "node:assert";
import { execSync } from "child_process";
import { mkdtempSync, existsSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

test("E2E CLI Flow", async (t) => {
  const kitRoot = join(__dirname, "..", "..");
  const binPath = join(kitRoot, "bin", "spec-driven-kit.js");
  
  assert.ok(existsSync(binPath), "CLI Bin file must exist for tests");

  const cwd = mkdtempSync(join(tmpdir(), "spec-driven-kit-test-"));
  
  // Cleanup test directory after run
  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  const runCmd = (args: string) => {
    try {
      return execSync(`node "${binPath}" ${args}`, { cwd, encoding: "utf8" });
    } catch (e: any) {
      if (e.stdout) console.error("STDOUT:", e.stdout);
      if (e.stderr) console.error("STDERR:", e.stderr);
      throw e;
    }
  };

  await t.test("init --allow-anywhere", () => {
    const out = runCmd("init --allow-anywhere");
    assert.match(out, /Wrote \.cursor\/spec-driven-kit\.json/);
    assert.ok(existsSync(join(cwd, ".cursor", "spec-driven-kit.json")));
    assert.ok(existsSync(join(cwd, ".cursor", "constitution.md")));
  });

  await t.test("doctor --strict on fresh init", () => {
    const out = runCmd("doctor --strict");
    assert.match(out, /Result: OK/);
  });

  await t.test("new feature login-flow", () => {
    const out = runCmd("new feature login-flow");
    assert.match(out, /Feature ID: 001-login-flow/);
    assert.ok(existsSync(join(cwd, ".cursor", "features", "001-login-flow", "spec.md")));
    assert.ok(existsSync(join(cwd, ".cursor", "features", "001-login-flow", "state.json")));
    
    const spec = readFileSync(join(cwd, ".cursor", "features", "001-login-flow", "spec.md"), "utf8");
    assert.match(spec, /# Spec — login-flow/);
    assert.match(spec, /\*\*ID:\*\* `001-login-flow`/);
    
    const state = readFileSync(join(cwd, ".cursor", "features", "001-login-flow", "state.json"), "utf8");
    const parsedState = JSON.parse(state);
    assert.ok(parsedState.last_updated && parsedState.last_updated.length > 0, "Last updated should contain a timestamp");
  });

  await t.test("update on identical files", () => {
    const out = runCmd("update");
    assert.match(out, /Identical \(ignored\):/);
    assert.match(out, /Created: 0/);
    assert.match(out, /Updated: 0/);
  });
});
