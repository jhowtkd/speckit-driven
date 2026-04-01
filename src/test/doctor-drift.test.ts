import test from "node:test";
import assert from "node:assert";
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { runInstall } from "../commands/install";
import { runDoctor } from "../core/doctor-check";
import { getAgentsTemplatePath, getAssetsCursorDir } from "../core/paths";

function prepareInstalledKit(): string {
  const cwd = mkdtempSync(join(tmpdir(), "spec-driven-kit-doctor-"));
  runInstall(cwd, { force: false, allowAnywhere: true });
  return cwd;
}

test("doctor drift detection", async (t) => {
  await t.test("fresh install passes and includes commands", () => {
    const cwd = prepareInstalledKit();
    t.after(() => rmSync(cwd, { recursive: true, force: true }));

    assert.ok(existsSync(join(cwd, ".cursor", "commands", "spec-start.md")));

    const report = runDoctor({
      cwd,
      assetsCursorDir: getAssetsCursorDir(),
      agentsTemplatePath: getAgentsTemplatePath(),
      strictContent: true,
    });

    assert.strictEqual(report.ok, true);
    assert.deepStrictEqual(report.missing, []);
    assert.deepStrictEqual(report.mismatched, []);
  });

  await t.test("modified rule file is reported as drift", () => {
    const cwd = prepareInstalledKit();
    t.after(() => rmSync(cwd, { recursive: true, force: true }));

    const target = join(cwd, ".cursor", "rules", "00-using-spec-driven.mdc");
    writeFileSync(target, `${readFileSync(target, "utf8")}\n<!-- drift -->\n`, "utf8");

    const report = runDoctor({
      cwd,
      assetsCursorDir: getAssetsCursorDir(),
      agentsTemplatePath: getAgentsTemplatePath(),
      strictContent: true,
    });

    assert.strictEqual(report.ok, false);
    assert.ok(report.mismatched.includes("rules/00-using-spec-driven.mdc"));
    assert.ok(report.issues.some((i) => i.kind === "error"));
  });

  await t.test("removed file is reported as missing", () => {
    const cwd = prepareInstalledKit();
    t.after(() => rmSync(cwd, { recursive: true, force: true }));

    unlinkSync(join(cwd, ".cursor", "commands", "spec-close.md"));

    const report = runDoctor({
      cwd,
      assetsCursorDir: getAssetsCursorDir(),
      agentsTemplatePath: getAgentsTemplatePath(),
      strictContent: true,
    });

    assert.strictEqual(report.ok, false);
    assert.ok(report.missing.includes("commands/spec-close.md"));
    assert.ok(report.issues.some((i) => i.kind === "error"));
  });

  await t.test("AGENTS.md drift is reported as mismatch", () => {
    const cwd = prepareInstalledKit();
    t.after(() => rmSync(cwd, { recursive: true, force: true }));

    writeFileSync(join(cwd, "AGENTS.md"), "# drift\n", "utf8");

    const report = runDoctor({
      cwd,
      assetsCursorDir: getAssetsCursorDir(),
      agentsTemplatePath: getAgentsTemplatePath(),
      strictContent: true,
    });

    assert.strictEqual(report.ok, false);
    assert.ok(report.mismatched.includes("AGENTS.md"));
    assert.ok(report.issues.some((i) => i.kind === "error"));
  });
});
