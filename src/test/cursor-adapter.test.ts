import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { spawnSync } from "child_process";

test("elf adapter install cursor writes the Cursor adapter bundle", () => {
  const root = join(__dirname, "..", "..");
  const binPath = join(root, "bin", "elf.js");
  const cwd = mkdtempSync(join(tmpdir(), "elf-cursor-adapter-"));

  try {
    const result = spawnSync(
      process.execPath,
      [binPath, "adapter", "install", "cursor", "--allow-anywhere"],
      { cwd, encoding: "utf8" }
    );

    assert.equal(result.status, 0, result.stderr ?? result.stdout);
    assert.match(result.stdout, /elf adapter install cursor/);

    assert.deepStrictEqual(
      readdirSync(join(cwd, ".cursor", "rules")).sort(),
      [
        "00-using-elf.mdc",
        "10-brainstorming-spec.mdc",
        "20-targeted-research.mdc",
        "30-writing-plan.mdc",
        "40-executing-plan.mdc",
        "50-verification-before-completion.mdc",
        "60-closing-feature.mdc",
      ]
    );
    assert.deepStrictEqual(
      readdirSync(join(cwd, ".cursor", "commands")).sort(),
      [
        "spec-close.md",
        "spec-execute.md",
        "spec-plan.md",
        "spec-research.md",
        "spec-start.md",
        "spec-verify.md",
      ]
    );

    const usingRule = readFileSync(
      join(cwd, ".cursor", "rules", "00-using-elf.mdc"),
      "utf8"
    );
    assert.match(usingRule, /elf init/);
    assert.match(usingRule, /elf run/);
    assert.match(usingRule, /elf mcp serve/);

    const startCommand = readFileSync(
      join(cwd, ".cursor", "commands", "spec-start.md"),
      "utf8"
    );
    assert.match(startCommand, /elf init/);
    assert.match(startCommand, /elf run/);
    assert.match(startCommand, /elf mcp serve/);

    assert.ok(existsSync(join(cwd, ".cursor", "constitution.md")));
    assert.equal(existsSync(join(cwd, "AGENTS.md")), false);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
