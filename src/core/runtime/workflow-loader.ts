import { existsSync, readFileSync } from "fs";
import { join } from "path";
import {
  ELF_TEMPLATE_BASENAMES,
  ELF_WORKFLOW_IDS,
} from "./defaults";
import {
  getAssetsElfDir,
  getAssetsElfTemplatesDir,
  getAssetsElfWorkflowsDir,
} from "../paths";
import type { WorkflowDefinition } from "./types";

export type RuntimeTemplateMap = Record<string, string>;

function readJson<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

export function loadBundledWorkflowDefinitions(): WorkflowDefinition[] {
  const workflowsDir = getAssetsElfWorkflowsDir();
  return ELF_WORKFLOW_IDS.map((id) => {
    const filePath = join(workflowsDir, `${id}.json`);
    if (!existsSync(filePath)) {
      throw new Error(`Missing bundled workflow definition: ${filePath}`);
    }
    return readJson<WorkflowDefinition>(filePath);
  });
}

export function loadBundledRuntimeTemplates(): RuntimeTemplateMap {
  const templatesDir = getAssetsElfTemplatesDir();
  const templates: RuntimeTemplateMap = {};
  for (const basename of ELF_TEMPLATE_BASENAMES) {
    const filePath = join(templatesDir, `${basename}.${basename === "state-template" ? "json" : "md"}`);
    if (!existsSync(filePath)) {
      throw new Error(`Missing bundled runtime template: ${filePath}`);
    }
    templates[basename] = readFileSync(filePath, "utf8");
  }
  return templates;
}

export function getBundledElfAssetRoot(): string {
  return getAssetsElfDir();
}
