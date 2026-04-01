import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import {
  mergeCursorGlobalHooksFile,
  mergeCursorGlobalMcpFile,
  removeCursorGlobalHooksFile,
  removeCursorGlobalMcpFile,
} from "../core/adapters/cursor-global-merge";

test("Cursor global MCP merge preserves unrelated servers and can remove only ELF entries", () => {
  const root = mkdtempSync(join(tmpdir(), "elf-cursor-global-mcp-"));
  const filePath = join(root, "mcp.json");

  try {
    writeFileSync(
      filePath,
      JSON.stringify(
        {
          mcpServers: {
            existing: {
              command: "npx",
              args: ["existing-mcp"],
            },
          },
        },
        null,
        2
      ) + "\n"
    );

    const merged = mergeCursorGlobalMcpFile({
      filePath,
      mcpServers: {
        elf: {
          command: "elf",
          args: ["mcp", "serve"],
        },
      },
    });

    assert.deepEqual(merged.managedServerNames, ["elf"]);

    const afterMerge = JSON.parse(readFileSync(filePath, "utf8")) as {
      mcpServers: Record<string, { command: string; args?: string[] }>;
    };
    assert.deepEqual(Object.keys(afterMerge.mcpServers).sort(), ["elf", "existing"]);
    assert.equal(afterMerge.mcpServers.existing.command, "npx");
    assert.equal(afterMerge.mcpServers.elf.command, "elf");

    removeCursorGlobalMcpFile({
      filePath,
      serverNames: ["elf"],
    });

    const afterRemove = JSON.parse(readFileSync(filePath, "utf8")) as {
      mcpServers: Record<string, { command: string; args?: string[] }>;
    };
    assert.deepEqual(Object.keys(afterRemove.mcpServers), ["existing"]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Cursor global hooks merge preserves unrelated commands and can remove only ELF entries", () => {
  const root = mkdtempSync(join(tmpdir(), "elf-cursor-global-hooks-"));
  const filePath = join(root, "hooks.json");

  try {
    writeFileSync(
      filePath,
      JSON.stringify(
        {
          version: 1,
          metadata: {
            owner: "cursor-user",
          },
          hooks: {
            beforeSubmitPrompt: [{ command: "existing-hook" }],
          },
        },
        null,
        2
      ) + "\n"
    );

    const merged = mergeCursorGlobalHooksFile({
      filePath,
      hooks: {
        beforeSubmitPrompt: [{ command: "elf prompt-hook" }],
        beforeMCPExecution: [{ command: "elf mcp-hook" }],
      },
    });

    assert.deepEqual(merged.managedHookRefs.sort(), [
      "beforeMCPExecution:elf mcp-hook",
      "beforeSubmitPrompt:elf prompt-hook",
    ]);

    const afterMerge = JSON.parse(readFileSync(filePath, "utf8")) as {
      version: number;
      metadata?: { owner: string };
      hooks: Record<string, Array<{ command: string }>>;
    };
    assert.equal(afterMerge.version, 1);
    assert.equal(afterMerge.metadata?.owner, "cursor-user");
    assert.deepEqual(
      afterMerge.hooks.beforeSubmitPrompt.map((entry) => entry.command).sort(),
      ["elf prompt-hook", "existing-hook"]
    );
    assert.deepEqual(
      afterMerge.hooks.beforeMCPExecution.map((entry) => entry.command),
      ["elf mcp-hook"]
    );

    removeCursorGlobalHooksFile({
      filePath,
      hooks: {
        beforeSubmitPrompt: [{ command: "elf prompt-hook" }],
        beforeMCPExecution: [{ command: "elf mcp-hook" }],
      },
    });

    const afterRemove = JSON.parse(readFileSync(filePath, "utf8")) as {
      hooks: Record<string, Array<{ command: string }>>;
    };
    assert.deepEqual(
      afterRemove.hooks.beforeSubmitPrompt.map((entry) => entry.command),
      ["existing-hook"]
    );
    assert.equal(existsSync(filePath), true);
    assert.equal(afterRemove.hooks.beforeMCPExecution, undefined);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Cursor global merge fails cleanly on malformed shared JSON", () => {
  const root = mkdtempSync(join(tmpdir(), "elf-cursor-global-malformed-"));
  const mcpPath = join(root, "mcp.json");

  try {
    writeFileSync(mcpPath, "{ not-json }\n");

    assert.throws(
      () =>
        mergeCursorGlobalMcpFile({
          filePath: mcpPath,
          mcpServers: {
            elf: { command: "elf", args: ["mcp", "serve"] },
          },
        }),
      /Failed to parse Cursor shared config/
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("Cursor global remove helpers are no-ops when the shared file is absent", () => {
  const root = mkdtempSync(join(tmpdir(), "elf-cursor-global-remove-noop-"));
  const mcpPath = join(root, "mcp.json");
  const hooksPath = join(root, "hooks.json");

  try {
    removeCursorGlobalMcpFile({
      filePath: mcpPath,
      serverNames: ["elf"],
    });
    removeCursorGlobalHooksFile({
      filePath: hooksPath,
      hooks: {
        beforeSubmitPrompt: [{ command: "elf prompt-hook" }],
      },
    });

    assert.equal(existsSync(mcpPath), false);
    assert.equal(existsSync(hooksPath), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
