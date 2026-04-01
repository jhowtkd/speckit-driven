import test from "node:test";
import assert from "node:assert";
import { execSync, spawnSync } from "child_process";
import { mkdtempSync, existsSync, rmSync, readFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

test("E2E CLI Flow", async (t) => {
  const kitRoot = join(__dirname, "..", "..");
  const binPath = join(kitRoot, "bin", "spec-driven-kit.js");

  assert.ok(existsSync(binPath), "CLI Bin file must exist for tests");

  const cwd = mkdtempSync(join(tmpdir(), "spec-driven-kit-test-"));

  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  const runCmd = (args: string) => {
    try {
      return execSync(`node "${binPath}" ${args}`, { cwd, encoding: "utf8" });
    } catch (e: unknown) {
      const err = e as { stdout?: string; stderr?: string };
      if (err.stdout) console.error("STDOUT:", err.stdout);
      if (err.stderr) console.error("STDERR:", err.stderr);
      throw e;
    }
  };

  await t.test("install --allow-anywhere", () => {
    const out = runCmd("install --allow-anywhere");
    assert.match(out, /Wrote \.cursor\/spec-driven-kit\.json/);
    assert.ok(existsSync(join(cwd, ".cursor", "spec-driven-kit.json")));
    assert.ok(existsSync(join(cwd, ".cursor", "constitution.md")));
    assert.ok(existsSync(join(cwd, "AGENTS.md")));
    assert.ok(existsSync(join(cwd, ".cursor", "rules", "00-using-spec-driven.mdc")));
  });

  await t.test("doctor --strict on fresh install", () => {
    const out = runCmd("doctor --strict");
    assert.match(out, /Result: OK/);
  });

  await t.test("update on identical files", () => {
    const out = runCmd("update");
    assert.match(out, /Identical \(ignored\):/);
    assert.match(out, /Created: 0/);
    assert.match(out, /Updated: 0/);
  });

  await t.test("init alias still runs install", () => {
    const cwd2 = mkdtempSync(join(tmpdir(), "spec-driven-kit-init-alias-"));
    t.after(() => rmSync(cwd2, { recursive: true, force: true }));
    const r = spawnSync(
      process.execPath,
      [binPath, "init", "--allow-anywhere"],
      { cwd: cwd2, encoding: "utf8" }
    );
    assert.strictEqual(r.status, 0, r.stderr ?? r.stdout);
    assert.match(String(r.stderr), /deprecated/i);
    assert.ok(existsSync(join(cwd2, "AGENTS.md")));
  });
});
