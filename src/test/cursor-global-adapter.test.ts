import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  doctorCursorGlobalAdapter,
  installCursorGlobalAdapter,
  uninstallCursorGlobalAdapter,
  updateCursorGlobalAdapter,
} from "../core/adapters/cursor";
import { loadGlobalManifest } from "../core/adapters/global-manifest";
import {
  getCursorGlobalHooksPath,
  getCursorGlobalManifestPath,
  getCursorGlobalMcpPath,
  getCursorGlobalRulesDir,
} from "../core/paths";

test("global Cursor install writes rules, merges shared config, and persists a manifest", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-cursor-global-install-"));

  try {
    mkdirSync(join(homeDir, ".cursor"), { recursive: true });
    writeFileSync(
      getCursorGlobalMcpPath(homeDir),
      JSON.stringify(
        {
          mcpServers: {
            existing: { command: "npx", args: ["existing-mcp"] },
          },
        },
        null,
        2
      ) + "\n"
    );
    writeFileSync(
      getCursorGlobalHooksPath(homeDir),
      JSON.stringify(
        {
          version: 1,
          hooks: {
            beforeSubmitPrompt: [{ command: "existing-hook" }],
          },
        },
        null,
        2
      ) + "\n"
    );

    installCursorGlobalAdapter({ homeDir, force: false });

    assert.deepEqual(readdirSync(getCursorGlobalRulesDir(homeDir)).sort(), [
      "00-using-elf.mdc",
      "10-brainstorming-spec.mdc",
      "20-targeted-research.mdc",
      "30-writing-plan.mdc",
      "40-executing-plan.mdc",
      "50-verification-before-completion.mdc",
      "60-closing-feature.mdc",
    ]);

    const mcpConfig = JSON.parse(readFileSync(getCursorGlobalMcpPath(homeDir), "utf8")) as {
      mcpServers: Record<string, { command: string; args?: string[] }>;
    };
    assert.deepEqual(Object.keys(mcpConfig.mcpServers).sort(), ["elf", "existing"]);
    assert.equal(mcpConfig.mcpServers.existing.command, "npx");
    assert.equal(mcpConfig.mcpServers.elf.command, "elf");

    const hooksConfig = JSON.parse(
      readFileSync(getCursorGlobalHooksPath(homeDir), "utf8")
    ) as {
      hooks: Record<string, Array<{ command: string }>>;
    };
    assert.deepEqual(
      hooksConfig.hooks.beforeSubmitPrompt.map((entry) => entry.command).sort(),
      ["elf doctor --strict", "existing-hook"]
    );
    assert.deepEqual(
      hooksConfig.hooks.beforeMCPExecution.map((entry) => entry.command),
      ["elf doctor --strict"]
    );

    assert.ok(existsSync(getCursorGlobalManifestPath(homeDir)));
    const manifest = loadGlobalManifest({ host: "cursor", homeDir });
    assert.ok(manifest);
    assert.ok(manifest.managedPaths.includes(".cursor/rules/00-using-elf.mdc"));
    assert.deepEqual(manifest.managedEntries, {
      mcpServers: ["elf"],
      hooks: [
        "beforeMCPExecution:elf doctor --strict",
        "beforeSubmitPrompt:elf doctor --strict",
      ],
    });

    const doctor = doctorCursorGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(doctor.ok, true, JSON.stringify(doctor.issues));
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Cursor update repairs a missing rule file", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-cursor-global-update-"));

  try {
    installCursorGlobalAdapter({ homeDir, force: false });
    rmSync(join(getCursorGlobalRulesDir(homeDir), "00-using-elf.mdc"), {
      force: true,
    });

    const before = doctorCursorGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(before.ok, false);

    updateCursorGlobalAdapter({ homeDir, force: false });

    assert.ok(existsSync(join(getCursorGlobalRulesDir(homeDir), "00-using-elf.mdc")));

    const after = doctorCursorGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(after.ok, true, JSON.stringify(after.issues));
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Cursor uninstall removes only ELF-managed entries and files", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-cursor-global-uninstall-"));

  try {
    mkdirSync(join(homeDir, ".cursor"), { recursive: true });
    writeFileSync(
      getCursorGlobalMcpPath(homeDir),
      JSON.stringify(
        {
          mcpServers: {
            existing: { command: "npx", args: ["existing-mcp"] },
          },
        },
        null,
        2
      ) + "\n"
    );
    writeFileSync(
      getCursorGlobalHooksPath(homeDir),
      JSON.stringify(
        {
          version: 1,
          hooks: {
            beforeSubmitPrompt: [{ command: "existing-hook" }],
          },
        },
        null,
        2
      ) + "\n"
    );

    installCursorGlobalAdapter({ homeDir, force: false });
    uninstallCursorGlobalAdapter({ homeDir });

    assert.equal(existsSync(join(getCursorGlobalRulesDir(homeDir), "00-using-elf.mdc")), false);
    assert.equal(existsSync(getCursorGlobalManifestPath(homeDir)), false);

    const mcpConfig = JSON.parse(readFileSync(getCursorGlobalMcpPath(homeDir), "utf8")) as {
      mcpServers: Record<string, { command: string }>;
    };
    assert.deepEqual(Object.keys(mcpConfig.mcpServers), ["existing"]);

    const hooksConfig = JSON.parse(
      readFileSync(getCursorGlobalHooksPath(homeDir), "utf8")
    ) as {
      hooks: Record<string, Array<{ command: string }>>;
    };
    assert.deepEqual(
      hooksConfig.hooks.beforeSubmitPrompt.map((entry) => entry.command),
      ["existing-hook"]
    );
    assert.equal(hooksConfig.hooks.beforeMCPExecution, undefined);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Cursor doctor and uninstall consume historical managed entries from the manifest", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-cursor-global-history-"));

  try {
    mkdirSync(join(homeDir, ".cursor"), { recursive: true });
    writeFileSync(
      getCursorGlobalMcpPath(homeDir),
      JSON.stringify(
        {
          mcpServers: {
            existing: { command: "npx", args: ["existing-mcp"] },
          },
        },
        null,
        2
      ) + "\n"
    );
    writeFileSync(
      getCursorGlobalHooksPath(homeDir),
      JSON.stringify(
        {
          version: 1,
          hooks: {
            beforeSubmitPrompt: [{ command: "existing-hook" }],
          },
        },
        null,
        2
      ) + "\n"
    );

    installCursorGlobalAdapter({ homeDir, force: false });

    writeFileSync(
      getCursorGlobalMcpPath(homeDir),
      JSON.stringify(
        {
          mcpServers: {
            existing: { command: "npx", args: ["existing-mcp"] },
            elf: { command: "elf", args: ["mcp", "serve"] },
            "elf-legacy": { command: "elf", args: ["mcp", "serve", "--legacy"] },
          },
        },
        null,
        2
      ) + "\n"
    );
    writeFileSync(
      getCursorGlobalHooksPath(homeDir),
      JSON.stringify(
        {
          version: 1,
          hooks: {
            beforeSubmitPrompt: [
              { command: "existing-hook" },
              { command: "elf doctor --strict" },
              { command: "elf doctor --strict --legacy" },
            ],
            beforeMCPExecution: [
              { command: "elf doctor --strict" },
              { command: "elf doctor --strict --legacy" },
            ],
          },
        },
        null,
        2
      ) + "\n"
    );

    const manifestPath = getCursorGlobalManifestPath(homeDir);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      managedEntries?: Record<string, string[]>;
    };
    manifest.managedEntries = {
      mcpServers: ["elf", "elf-legacy"],
      hooks: [
        "beforeMCPExecution:elf doctor --strict",
        "beforeMCPExecution:elf doctor --strict --legacy",
        "beforeSubmitPrompt:elf doctor --strict",
        "beforeSubmitPrompt:elf doctor --strict --legacy",
      ],
    };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

    const doctor = doctorCursorGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(doctor.ok, false);
    assert.match(JSON.stringify(doctor.issues), /historical managed/i);

    uninstallCursorGlobalAdapter({ homeDir });

    const mcpConfig = JSON.parse(readFileSync(getCursorGlobalMcpPath(homeDir), "utf8")) as {
      mcpServers: Record<string, { command: string }>;
    };
    assert.deepEqual(Object.keys(mcpConfig.mcpServers), ["existing"]);

    const hooksConfig = JSON.parse(
      readFileSync(getCursorGlobalHooksPath(homeDir), "utf8")
    ) as {
      hooks: Record<string, Array<{ command: string }>>;
    };
    assert.deepEqual(
      hooksConfig.hooks.beforeSubmitPrompt.map((entry) => entry.command),
      ["existing-hook"]
    );
    assert.equal(hooksConfig.hooks.beforeMCPExecution, undefined);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Cursor doctor fails when the legacy base rule remains", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-cursor-global-legacy-"));

  try {
    installCursorGlobalAdapter({ homeDir, force: false });
    writeFileSync(
      join(getCursorGlobalRulesDir(homeDir), "00-using-spec-driven.mdc"),
      "legacy\n",
      "utf8"
    );

    const doctor = doctorCursorGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(doctor.ok, false);
    assert.match(JSON.stringify(doctor.issues), /legacy/i);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Cursor doctor fails when the managed MCP entry drifts", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-cursor-global-mcp-drift-"));

  try {
    installCursorGlobalAdapter({ homeDir, force: false });

    writeFileSync(
      getCursorGlobalMcpPath(homeDir),
      JSON.stringify(
        {
          mcpServers: {
            elf: {
              command: "node",
              args: ["wrong-server.js"],
            },
          },
        },
        null,
        2
      ) + "\n"
    );

    const doctor = doctorCursorGlobalAdapter({
      homeDir,
      strictContent: true,
    });
    assert.equal(doctor.ok, false);
    assert.match(JSON.stringify(doctor.issues), /MCP server entry drifted/);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});

test("global Cursor update preserves prior managed ownership for uninstall", () => {
  const homeDir = mkdtempSync(join(tmpdir(), "elf-cursor-global-ownership-"));

  try {
    installCursorGlobalAdapter({ homeDir, force: false });

    const retiredPath = join(getCursorGlobalRulesDir(homeDir), "99-retired.mdc");
    writeFileSync(retiredPath, "retired\n", "utf8");

    const manifestPath = getCursorGlobalManifestPath(homeDir);
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as {
      managedPaths: string[];
    };
    manifest.managedPaths.push(".cursor/rules/99-retired.mdc");
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

    updateCursorGlobalAdapter({ homeDir, force: false });
    uninstallCursorGlobalAdapter({ homeDir });

    assert.equal(existsSync(retiredPath), false);
  } finally {
    rmSync(homeDir, { recursive: true, force: true });
  }
});
