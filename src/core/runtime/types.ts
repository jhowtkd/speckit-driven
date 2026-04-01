export type ElfIntent =
  | "new-task"
  | "new-phase"
  | "new-epic"
  | "continue-run"
  | "verify-run"
  | "review-change"
  | "debug-issue"
  | "ship-phase";

export type RiskClass = "low" | "medium" | "high";

export type HostCapabilities = {
  supportsMcp: boolean;
  supportsSubagents: boolean;
  supportsLocalCli: boolean;
  supportsFileStore: boolean;
};

export type WorkflowDefinition = {
  id: string;
  title?: string;
  description?: string;
  intent?: ElfIntent;
  risk?: RiskClass;
};

export type WorkflowResolution = {
  intent: ElfIntent;
  workflowId: string;
  risk: RiskClass;
  reason: string;
};

export type RunStatus =
  | "pending"
  | "active"
  | "waiting-verification"
  | "completed"
  | "reopened";

export type RunEventType = "run-created" | "run-status-changed";

export type RunEvent = {
  type: RunEventType;
  at: string;
  runId: string;
  workflowId: string;
  phaseId?: string;
  fromStatus?: RunStatus;
  toStatus?: RunStatus;
};

export type RunRecord = {
  runId: string;
  workflowId: string;
  phaseId?: string;
  status: RunStatus;
  createdAt: string;
  updatedAt: string;
};

export type PhaseRecord = {
  phaseId: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentRunRecord = {
  runId: string;
  workflowId: string;
  phaseId?: string;
  status: RunStatus;
  updatedAt: string;
};
