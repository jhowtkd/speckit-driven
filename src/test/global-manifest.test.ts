import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  getCodexGlobalAgentsDir,
  getCodexGlobalManifestPath,
  getCodexGlobalRulesDir,
  getCodexGlobalSkillsDir,
  getCursorGlobalHooksPath,
  getCursorGlobalManifestPath,
  getCursorGlobalMcpPath,
  getCursorGlobalRulesDir,
} from "../core/paths";
import {
  deleteGlobalManifest,
  loadGlobalManifest,
  writeGlobalManifest,
  type GlobalInstallManifest,
} from "../core/adapters/global-manifest";

function normalizePath(value: string): string {
  return value.split("\\").join("/");
}

test("global path helpers resolve host-global locations under a home directory", () => {
  const homeDir = join("/tmp", "elf-home");

  assert.equal(
    normalizePath(getCodexGlobalManifestPath(homeDir)),
    "/tmp/elf-home/.codex/.elf-global.json"
  );
  assert.equal(
    normalizePath(getCodexGlobalRulesDir(homeDir)),
    "/tmp/elf-home/.codex/rules"
  );
  assert.equal(
    normalizePath(getCodexGlobalSkillsDir(homeDir)),
    "/tmp/elf-home/.codex/skills"
  );
  assert.equal(
    normalizePath(getCodexGlobalAgentsDir(homeDir)),
    "/tmp/elf-home/.codex/agents"
  );

  assert.equal(
    normalizePath(getCursorGlobalManifestPath(homeDir)),
    "/tmp/elf-home/.cursor/.elf-global.json"
  );
  assert.equal(
    normalizePath(getCursorGlobalRulesDir(homeDir)),
    "/tmp/elf-home/.cursor/rules"
  );
  assert.equal(
    normalizePath(getCursorGlobalMcpPath(homeDir)),
    "/tmp/elf-home/.cursor/mcp.json"
  );
  assert.equal(
    normalizePath(getCursorGlobalHooksPath(homeDir)),
    "/tmp/elf-home/.cursor/hooks.json"
  );
});

test("global manifests can be written, loaded, and deleted per host", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-global-manifest-"));

  try {
    const manifests: GlobalInstallManifest[] = [
      {
        schemaVersion: 1,
        host: "codex",
        elfVersion: "1.2.3",
        managedPaths: [".codex/rules/elf-global.rules"],
        managedEntries: {
          hooks: ["elf-before-shell"],
        },
        installedAt: "2026-04-01T12:00:00.000Z",
        updatedAt: "2026-04-01T12:05:00.000Z",
      },
      {
        schemaVersion: 1,
        host: "cursor",
        elfVersion: "1.2.3",
        managedPaths: [".cursor/rules/elf-global.mdc"],
        managedEntries: {
          mcpServers: ["elf"],
        },
        installedAt: "2026-04-01T12:10:00.000Z",
      },
    ];

    for (const manifest of manifests) {
      writeGlobalManifest({
        host: manifest.host,
        homeDir,
        manifest,
      });

      const manifestPath =
        manifest.host === "codex"
          ? getCodexGlobalManifestPath(homeDir)
          : getCursorGlobalManifestPath(homeDir);

      assert.equal(existsSync(manifestPath), true);
      assert.deepEqual(
        loadGlobalManifest({ host: manifest.host, homeDir }),
        manifest
      );

      deleteGlobalManifest({ host: manifest.host, homeDir });

      assert.equal(existsSync(manifestPath), false);
      assert.equal(loadGlobalManifest({ host: manifest.host, homeDir }), null);
    }
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});
