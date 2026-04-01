import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  doctorCodexGlobalAdapter,
  installCodexGlobalAdapter,
  uninstallCodexGlobalAdapter,
  updateCodexGlobalAdapter,
} from "../core/adapters/codex";
import { loadGlobalManifest } from "../core/adapters/global-manifest";
import {
  getCodexGlobalAgentsDir,
  getCodexGlobalHooksPath,
  getCodexGlobalManifestPath,
  getCodexGlobalRulesDir,
  getCodexGlobalSkillsDir,
} from "../core/paths";

test("global Codex install writes the managed bundle and manifest", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-codex-global-install-"));

  try {
    installCodexGlobalAdapter({ homeDir, force: false });

    assert.deepEqual(readdirSync(getCodexGlobalSkillsDir(homeDir)).sort(), [
      "elf-review",
      "elf-run",
      "elf-verify",
    ]);
    assert.ok(existsSync(join(getCodexGlobalSkillsDir(homeDir), "elf-run", "SKILL.md")));
    assert.ok(existsSync(join(getCodexGlobalAgentsDir(homeDir), "verifier.toml")));
    assert.ok(existsSync(join(getCodexGlobalRulesDir(homeDir), "default.rules")));
    assert.ok(existsSync(getCodexGlobalHooksPath(homeDir)));
    assert.ok(existsSync(getCodexGlobalManifestPath(homeDir)));

    const manifest = loadGlobalManifest({ host: "codex", homeDir });
    assert.ok(manifest);
    assert.deepEqual(manifest.managedPaths, [
      ".codex/skills/elf-review",
      ".codex/skills/elf-run",
      ".codex/skills/elf-verify",
      ".codex/rules/default.rules",
      ".codex/agents/verifier.toml",
      ".codex/hooks.json",
    ]);

    const doctor = doctorCodexGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(doctor.ok, true, JSON.stringify(doctor.issues));
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Codex update repairs a missing adapter subtree", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-codex-global-update-"));

  try {
    installCodexGlobalAdapter({ homeDir, force: false });
    rmSync(join(getCodexGlobalSkillsDir(homeDir), "elf-run"), {
      recursive: true,
      force: true,
    });

    const before = doctorCodexGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(before.ok, false);

    updateCodexGlobalAdapter({ homeDir, force: false });

    assert.ok(existsSync(join(getCodexGlobalSkillsDir(homeDir), "elf-run", "SKILL.md")));

    const after = doctorCodexGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(after.ok, true, JSON.stringify(after.issues));
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Codex uninstall removes only ELF-managed files", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-codex-global-uninstall-"));

  try {
    installCodexGlobalAdapter({ homeDir, force: false });

    uninstallCodexGlobalAdapter({ homeDir });

    assert.equal(existsSync(join(getCodexGlobalSkillsDir(homeDir), "elf-run")), false);
    assert.equal(existsSync(join(getCodexGlobalSkillsDir(homeDir), "elf-review")), false);
    assert.equal(existsSync(join(getCodexGlobalSkillsDir(homeDir), "elf-verify")), false);
    assert.equal(existsSync(join(getCodexGlobalAgentsDir(homeDir), "verifier.toml")), false);
    assert.equal(existsSync(join(getCodexGlobalRulesDir(homeDir), "default.rules")), false);
    assert.equal(existsSync(getCodexGlobalHooksPath(homeDir)), false);
    assert.equal(existsSync(getCodexGlobalManifestPath(homeDir)), false);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Codex doctor fails on managed paths outside .codex", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-codex-global-invalid-manifest-"));

  try {
    installCodexGlobalAdapter({ homeDir, force: false });

    const manifestPath = getCodexGlobalManifestPath(homeDir);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      managedPaths: string[];
    };
    manifest.managedPaths = ["../.ssh"];
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

    const doctor = doctorCodexGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(doctor.ok, false);
    assert.match(
      JSON.stringify(doctor.issues),
      /Invalid managed path outside homeDir/
    );
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});
