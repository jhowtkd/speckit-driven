import { normalizeIntent } from "./intent";
import { inferRisk, DEFAULT_HOST_CAPABILITIES } from "./policy";
import type {
  HostCapabilities,
  WorkflowDefinition,
  WorkflowResolution,
} from "./types";

export type ResolveWorkflowInput = {
  prompt: string;
  hasExistingSpec: boolean;
  availableWorkflows?: WorkflowDefinition[];
  hostCapabilities?: HostCapabilities;
};

const DEFAULT_WORKFLOW_IDS = new Set([
  "task",
  "phase",
  "epic",
  "review",
  "debug",
  "ship",
]);

function workflowIdForIntent(intent: WorkflowResolution["intent"]): string {
  switch (intent) {
    case "new-task":
      return "task";
    case "new-phase":
      return "phase";
    case "new-epic":
      return "epic";
    case "continue-run":
      return "phase";
    case "verify-run":
      return "review";
    case "review-change":
      return "review";
    case "debug-issue":
      return "debug";
    case "ship-phase":
      return "ship";
  }
}

export function resolveWorkflow(input: ResolveWorkflowInput): WorkflowResolution {
  const capabilities = input.hostCapabilities ?? DEFAULT_HOST_CAPABILITIES;
  const intent = normalizeIntent(input.prompt, input.hasExistingSpec);
  const workflowId = workflowIdForIntent(intent);
  const available = input.availableWorkflows?.length
    ? new Set(input.availableWorkflows.map((workflow) => workflow.id))
    : DEFAULT_WORKFLOW_IDS;

  const selectedWorkflowId = available.has(workflowId) ? workflowId : "phase";

  const reason =
    selectedWorkflowId === workflowId
      ? `Resolved ${intent} from prompt heuristics.`
      : `Workflow ${workflowId} unavailable; falling back to phase.`;

  const risk = inferRisk(intent);

  if (!capabilities.supportsMcp && selectedWorkflowId === "review") {
    return {
      intent,
      workflowId: "phase",
      risk,
      reason: "Review workflow requires MCP support; falling back to phase.",
    };
  }

  return {
    intent,
    workflowId: selectedWorkflowId,
    risk,
    reason,
  };
}
