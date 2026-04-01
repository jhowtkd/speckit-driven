import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import { join } from "path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { buildElfMcpTools } from "../mcp/tools";

test("buildElfMcpTools exposes the ELF bridge tool registry", () => {
  const tools = buildElfMcpTools();
  assert.deepStrictEqual(
    tools.map((tool) => tool.name),
    [
      "elf_run",
      "elf_resume",
      "elf_verify",
      "elf_review",
      "elf_status",
    ]
  );
});

test("elf mcp exposes a serve subcommand", () => {
  const root = join(__dirname, "..", "..");
  const elfBin = join(root, "bin", "elf.js");

  const result = spawnSync(process.execPath, [elfBin, "mcp", "--help"], {
    encoding: "utf8",
  });

  assert.strictEqual(result.status, 0, result.stderr ?? result.stdout);
  assert.match(result.stdout, /\bserve\b/);
});

test("elf mcp serve completes an MCP handshake and lists tools", async () => {
  const root = join(__dirname, "..", "..");
  const elfBin = join(root, "bin", "elf.js");

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [elfBin, "mcp", "serve"],
    cwd: root,
    stderr: "pipe",
  });
  const client = new Client({ name: "elf-mcp-test", version: "1.0.0" });

  try {
    await client.connect(transport);
    const result = await client.listTools();
    assert.deepStrictEqual(
      result.tools.map((tool) => tool.name),
      [
        "elf_run",
        "elf_resume",
        "elf_verify",
        "elf_review",
        "elf_status",
      ]
    );
  } finally {
    await transport.close();
  }
});
