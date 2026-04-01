import { existsSync } from "fs";
import { isAbsolute, resolve } from "path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { toKebabCase } from "../core/naming";
import { advanceWorkflowState, loadCurrentRun } from "../core/runtime/chain-engine";
import { buildRuntimeContext } from "../core/runtime/context-builder";
import {
  advancePhaseStep,
  getPhaseProgress,
  startPhaseFlow,
} from "../core/runtime/phase-flow";
import { createRun, loadRun } from "../core/runtime/run-store";
import { verifyElfRun } from "../core/runtime/verifier";
import { buildElfMcpTools } from "./tools";
import { z } from "zod";

type TextResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: true;
};

function textResult(text: string): TextResult {
  return { content: [{ type: "text", text }] };
}

function errorResult(message: string): TextResult {
  return { content: [{ type: "text", text: message }], isError: true };
}

function readStringArg(
  args: Record<string, unknown>,
  key: string
): string | null {
  const value = args[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function formatRunSummary(label: string, run: {
  runId: string;
  workflowId: string;
  phaseId?: string;
  status: string;
}): string {
  return [
    label,
    `Run ID: ${run.runId}`,
    `Workflow: ${run.workflowId}`,
    `Phase ID: ${run.phaseId ?? "-"}`,
    `Status: ${run.status}`,
  ].join("\n");
}

function formatPhaseSummary(label: string, result: {
  runId: string;
  phaseId: string;
  status: string;
  currentStep: string;
  nextStep: string | null;
}): string {
  return [
    label,
    `Run ID: ${result.runId}`,
    "Workflow: phase",
    `Phase ID: ${result.phaseId}`,
    `Current step: ${result.currentStep}`,
    `Next step: ${result.nextStep ?? "-"}`,
    `Status: ${result.status}`,
  ].join("\n");
}

function buildStatusText(cwd: string): string {
  const context = buildRuntimeContext(cwd);
  const currentRun = loadCurrentRun(cwd);
  const status = {
    initialized: Boolean(context.config && context.runtimeMeta),
    runtimeVersion: context.runtimeMeta?.version ?? null,
    currentRun: currentRun
      ? {
          runId: currentRun.runId,
          workflowId: currentRun.workflowId,
          phaseId: currentRun.phaseId ?? null,
          status: currentRun.status,
        }
      : null,
  };

  return JSON.stringify(status, null, 2);
}

function buildReviewText(
  cwd: string,
  target: string
): { kind: "path" | "run"; text: string } {
  const pathTarget = isAbsolute(target) ? target : resolve(cwd, target);
  if (existsSync(pathTarget)) {
    return {
      kind: "path",
      text: [
        "elf review",
        `Target: ${pathTarget}`,
        "Review scaffold:",
        "- Findings",
        "- Notes",
      ].join("\n"),
    };
  }

  const run = loadRun(cwd, target);
  if (!run) {
    throw new Error(`elf review: missing run or path ${target}`);
  }

  return {
    kind: "run",
    text: [
      "elf review",
      `Target: run ${run.runId}`,
      `Workflow: ${run.workflowId}`,
      "Review scaffold:",
      "- Findings",
      "- Notes",
    ].join("\n"),
  };
}

function callTool(
  cwd: string,
  name: string,
  args: Record<string, unknown>
): TextResult {
  switch (name) {
    case "elf_run": {
      const workflow = readStringArg(args, "workflow");
      const title = readStringArg(args, "title");
      if (!workflow) {
        return errorResult("elf run: missing workflow");
      }
      if (!title) {
        return errorResult("elf run: missing title");
      }

      const context = buildRuntimeContext(cwd);
      if (!context.config || !context.runtimeMeta) {
        return errorResult("elf run: run elf init first");
      }

      if (workflow === "phase") {
        const started = startPhaseFlow(cwd, title);
        return textResult(formatPhaseSummary("elf run", started));
      }

      const phaseId = toKebabCase(title) || workflow;
      const created = createRun({
        cwd,
        workflowId: workflow,
        phaseId,
      });
      const active = advanceWorkflowState(cwd, created.runId, "active");
      return textResult(formatRunSummary("elf run", active));
    }
    case "elf_phase_start": {
      const title = readStringArg(args, "title");
      if (!title) {
        return errorResult("elf phase start: missing title");
      }

      const context = buildRuntimeContext(cwd);
      if (!context.config || !context.runtimeMeta) {
        return errorResult("elf phase start: run elf init first");
      }

      const started = startPhaseFlow(cwd, title);
      return textResult(formatPhaseSummary("elf phase start", started));
    }
    case "elf_phase_research":
    case "elf_phase_plan":
    case "elf_phase_execute":
    case "elf_phase_verify":
    case "elf_phase_close": {
      const runId = readStringArg(args, "runId");
      if (!runId) {
        return errorResult(`${name.replaceAll("_", " ")}: missing runId`);
      }

      const step = name.replace("elf_phase_", "");
      try {
        const result = advancePhaseStep(
          cwd,
          runId,
          step as "research" | "plan" | "execute" | "verify" | "close"
        );
        return textResult(formatPhaseSummary(name.replaceAll("_", " "), result));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return errorResult(message);
      }
    }
    case "elf_phase_status": {
      const runId = readStringArg(args, "runId");
      if (!runId) {
        return errorResult("elf phase status: missing runId");
      }

      try {
        const result = getPhaseProgress(cwd, runId);
        return textResult(formatPhaseSummary("elf phase status", result));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return errorResult(message);
      }
    }
    case "elf_resume": {
      const runId = readStringArg(args, "runId");
      if (!runId) {
        return errorResult("elf resume: missing runId");
      }

      const run = loadRun(cwd, runId);
      if (!run) {
        return errorResult(`elf resume: missing run ${runId}`);
      }

      return textResult(formatRunSummary("elf resume", run));
    }
    case "elf_verify": {
      const runId = readStringArg(args, "runId");
      if (!runId) {
        return errorResult("elf verify: missing runId");
      }

      try {
        const result = verifyElfRun(cwd, runId);
        return textResult(
          [
            "elf verify",
            `Run ID: ${result.runId}`,
            `Verification result: ${result.status}`,
            `Status: ${result.runStatus}`,
          ].join("\n")
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return errorResult(message);
      }
    }
    case "elf_review": {
      const target = readStringArg(args, "target");
      if (!target) {
        return errorResult("elf review: missing target");
      }

      try {
        const review = buildReviewText(cwd, target);
        return textResult(review.text);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return errorResult(message);
      }
    }
    case "elf_status": {
      return textResult(buildStatusText(cwd));
    }
    default:
      return errorResult(`Unknown ELF MCP tool: ${name}`);
  }
}

export async function startElfMcpServer(): Promise<void> {
  const server = new McpServer({ name: "elf", version: "1.0.0" });
  const tools = buildElfMcpTools();
  const cwd = process.cwd();

  for (const tool of tools) {
    switch (tool.name) {
      case "elf_run":
        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema: z.object({
              workflow: z.string(),
              title: z.string(),
            }),
          },
          async (args) => callTool(cwd, tool.name, args)
        );
        break;
      case "elf_phase_start":
        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema: z.object({
              title: z.string(),
            }),
          },
          async (args) => callTool(cwd, tool.name, args)
        );
        break;
      case "elf_phase_research":
      case "elf_phase_plan":
      case "elf_phase_execute":
      case "elf_phase_verify":
      case "elf_phase_close":
      case "elf_phase_status":
        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema: z.object({
              runId: z.string(),
            }),
          },
          async (args) => callTool(cwd, tool.name, args)
        );
        break;
      case "elf_resume":
        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema: z.object({
              runId: z.string(),
            }),
          },
          async (args) => callTool(cwd, tool.name, args)
        );
        break;
      case "elf_verify":
        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema: z.object({
              runId: z.string(),
            }),
          },
          async (args) => callTool(cwd, tool.name, args)
        );
        break;
      case "elf_review":
        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema: z.object({
              target: z.string(),
            }),
          },
          async (args) => callTool(cwd, tool.name, args)
        );
        break;
      case "elf_status":
        server.registerTool(
          tool.name,
          { description: tool.description },
          async () => callTool(cwd, tool.name, {})
        );
        break;
      default:
        break;
    }
  }

  await server.connect(new StdioServerTransport());
}
