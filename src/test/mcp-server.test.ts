import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import { join } from "path";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { buildElfMcpTools } from "../mcp/tools";

test("buildElfMcpTools exposes the ELF bridge tool registry", () => {
  const tools = buildElfMcpTools();
  assert.deepStrictEqual(
    tools.map((tool) => tool.name),
    [
      "elf_run",
      "elf_phase_start",
      "elf_phase_research",
      "elf_phase_plan",
      "elf_phase_execute",
      "elf_phase_verify",
      "elf_phase_close",
      "elf_phase_status",
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
  const cwd = mkdtempSync(join(tmpdir(), "elf-mcp-cwd-"));
  const init = spawnSync(
    process.execPath,
    [elfBin, "init", "--allow-anywhere"],
    { cwd, encoding: "utf8" }
  );
  assert.equal(init.status, 0, init.stderr ?? init.stdout);

  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [elfBin, "mcp", "serve"],
    cwd,
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
        "elf_phase_start",
        "elf_phase_research",
        "elf_phase_plan",
        "elf_phase_execute",
        "elf_phase_verify",
        "elf_phase_close",
        "elf_phase_status",
        "elf_resume",
        "elf_verify",
        "elf_review",
        "elf_status",
      ]
    );

    const status = await client.callTool({ name: "elf_status" });
    const content = status.content as Array<{ type: "text"; text: string }>;
    assert.ok(content.length > 0, "expected a text result");
    const payload = content[0];
    assert.equal(payload.type, "text");
    const parsed = JSON.parse(payload.text) as { initialized?: boolean };
    assert.equal(parsed.initialized, true);

    const started = await client.callTool({
      name: "elf_run",
      arguments: {
        workflow: "phase",
        title: "MCP auth",
      },
    });
    const startedContent = started.content as Array<{ type: "text"; text: string }>;
    const startedText = startedContent[0]?.text ?? "";
    assert.match(startedText, /Workflow:\s*phase/);
    assert.match(startedText, /Current step:\s*research/);
    assert.match(startedText, /Next step:\s*research/);
    const runIdMatch = startedText.match(/Run ID:\s*(.+)/);
    assert.ok(runIdMatch, startedText);
    const runId = runIdMatch[1].trim();

    const phaseStatus = await client.callTool({
      name: "elf_phase_status",
      arguments: { runId },
    });
    const phaseStatusText =
      (phaseStatus.content as Array<{ type: "text"; text: string }>)[0]?.text ?? "";
    assert.match(phaseStatusText, /Current step:\s*research/);

    const research = await client.callTool({
      name: "elf_phase_research",
      arguments: { runId },
    });
    const researchText =
      (research.content as Array<{ type: "text"; text: string }>)[0]?.text ?? "";
    assert.match(researchText, /Next step:\s*plan/);

    const plan = await client.callTool({
      name: "elf_phase_plan",
      arguments: { runId },
    });
    const planText =
      (plan.content as Array<{ type: "text"; text: string }>)[0]?.text ?? "";
    assert.match(planText, /Next step:\s*execute/);

    const execute = await client.callTool({
      name: "elf_phase_execute",
      arguments: { runId },
    });
    const executeText =
      (execute.content as Array<{ type: "text"; text: string }>)[0]?.text ?? "";
    assert.match(executeText, /Next step:\s*verify/);

    const verify = await client.callTool({
      name: "elf_phase_verify",
      arguments: { runId },
    });
    const verifyText =
      (verify.content as Array<{ type: "text"; text: string }>)[0]?.text ?? "";
    assert.match(verifyText, /Next step:\s*close/);

    const close = await client.callTool({
      name: "elf_phase_close",
      arguments: { runId },
    });
    const closeText =
      (close.content as Array<{ type: "text"; text: string }>)[0]?.text ?? "";
    assert.match(closeText, /Status:\s*completed/);
  } finally {
    await transport.close();
    rmSync(cwd, { recursive: true, force: true });
  }
});
