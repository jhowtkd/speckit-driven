import test from "node:test";
import assert from "node:assert/strict";
import { getAssetsElfDir } from "../core/paths";
import {
  loadBundledRuntimeTemplates,
  loadBundledWorkflowDefinitions,
} from "../core/runtime/workflow-loader";

test("bundled ELF runtime assets are discoverable", () => {
  assert.match(getAssetsElfDir(), /assets\/elf$/);

  const defs = loadBundledWorkflowDefinitions();
  assert.deepStrictEqual(
    defs.map((def) => def.id),
    ["task", "phase", "epic", "review", "debug", "ship"]
  );

  const templates = loadBundledRuntimeTemplates();
  assert.deepStrictEqual(Object.keys(templates).sort(), [
    "plan-template",
    "research-template",
    "spec-template",
    "state-template",
    "tasks-template",
    "verification-template",
  ]);
});
