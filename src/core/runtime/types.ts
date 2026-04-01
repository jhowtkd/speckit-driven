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
