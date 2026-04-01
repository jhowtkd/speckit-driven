import type { ElfIntent, HostCapabilities, RiskClass } from "./types";

export const DEFAULT_HOST_CAPABILITIES: HostCapabilities = {
  supportsMcp: true,
  supportsSubagents: true,
  supportsLocalCli: true,
  supportsFileStore: true,
};

export function inferRisk(intent: ElfIntent): RiskClass {
  switch (intent) {
    case "new-epic":
    case "debug-issue":
      return "high";
    case "review-change":
    case "ship-phase":
    case "continue-run":
      return "medium";
    default:
      return "low";
  }
}
