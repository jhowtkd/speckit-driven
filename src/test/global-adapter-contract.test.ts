import test from "node:test";
import assert from "node:assert/strict";
import { join } from "path";
import { describeCodexAdapter } from "../core/adapters/codex";
import { describeCursorAdapter } from "../core/adapters/cursor";

function normalizePath(value: string): string {
  return value.split("\\").join("/");
}

function assertUniquePaths(paths: string[]): void {
  assert.equal(new Set(paths).size, paths.length);
}

test("adapters expose distinct project and global plans", () => {
  const cwd = join("/tmp", "elf-project");
  const homeDir = join("/tmp", "elf-home");

  const cursorProject = describeCursorAdapter({ cwd, scope: "project", homeDir });
  const cursorGlobal = describeCursorAdapter({ cwd, scope: "global", homeDir });
  const codexProject = describeCodexAdapter({ cwd, scope: "project", homeDir });
  const codexGlobal = describeCodexAdapter({ cwd, scope: "global", homeDir });

  assert.deepEqual(
    cursorProject.installPaths.map(normalizePath),
    ["/tmp/elf-project/.cursor"]
  );
  assert.equal(cursorProject.manifestPath, null);
  assertUniquePaths(cursorProject.installPaths);
  assertUniquePaths(cursorProject.doctorPaths);
  assertUniquePaths(cursorProject.uninstallPaths);

  assert.deepEqual(cursorGlobal.installPaths.map(normalizePath), [
    "/tmp/elf-home/.cursor/rules",
    "/tmp/elf-home/.cursor/mcp.json",
    "/tmp/elf-home/.cursor/hooks.json",
  ]);
  assert.equal(
    normalizePath(cursorGlobal.manifestPath ?? ""),
    "/tmp/elf-home/.cursor/.elf-global.json"
  );
  assertUniquePaths(cursorGlobal.installPaths);
  assertUniquePaths(cursorGlobal.doctorPaths);
  assertUniquePaths(cursorGlobal.uninstallPaths);

  assert.deepEqual(codexProject.installPaths.map(normalizePath), [
    "/tmp/elf-project/.agents/skills",
    "/tmp/elf-project/codex/rules",
    "/tmp/elf-project/.codex/agents",
    "/tmp/elf-project/.codex/hooks.json",
  ]);
  assert.equal(codexProject.manifestPath, null);
  assertUniquePaths(codexProject.installPaths);
  assertUniquePaths(codexProject.doctorPaths);
  assertUniquePaths(codexProject.uninstallPaths);

  assert.deepEqual(codexGlobal.installPaths.map(normalizePath), [
    "/tmp/elf-home/.codex/skills",
    "/tmp/elf-home/.codex/rules",
    "/tmp/elf-home/.codex/agents",
    "/tmp/elf-home/.codex/hooks.json",
  ]);
  assert.equal(
    normalizePath(codexGlobal.manifestPath ?? ""),
    "/tmp/elf-home/.codex/.elf-global.json"
  );
  assertUniquePaths(codexGlobal.installPaths);
  assertUniquePaths(codexGlobal.doctorPaths);
  assertUniquePaths(codexGlobal.uninstallPaths);
});
