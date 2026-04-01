import { readFileSync } from "fs";
import { join } from "path";

export type ElfRuntimeConfig = {
  schemaVersion: number;
  runtime: string;
  version: string;
  defaultWorkflow: string;
  workflowsDir: string;
  templatesDir: string;
  stateDir: string;
};

export function readElfRuntimeConfig(elfDir: string): ElfRuntimeConfig {
  const filePath = join(elfDir, "config.toml");
  const raw = readFileSync(filePath, "utf8");
  const entries: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    entries[key] = value;
  }

  return {
    schemaVersion: Number(entries.schemaVersion ?? "1"),
    runtime: entries.runtime ?? "elf",
    version: entries.version ?? "1",
    defaultWorkflow: entries.defaultWorkflow ?? "phase",
    workflowsDir: entries.workflowsDir ?? "workflows",
    templatesDir: entries.templatesDir ?? "templates",
    stateDir: entries.stateDir ?? "state",
  };
}
