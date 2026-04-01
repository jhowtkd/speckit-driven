import test from "node:test";
import assert from "node:assert/strict";
import { resolveWorkflow } from "../core/runtime/workflow-resolver";

test("resolveWorkflow routes common prompts to the expected workflow", () => {
  assert.equal(
    resolveWorkflow({
      prompt: "build a new onboarding flow for the app",
      hasExistingSpec: false,
    }).workflowId,
    "phase"
  );

  assert.equal(
    resolveWorkflow({
      prompt: "fix the failing login bug",
      hasExistingSpec: false,
    }).workflowId,
    "task"
  );

  assert.equal(
    resolveWorkflow({
      prompt: "the build is crashing with a stack trace",
      hasExistingSpec: false,
    }).workflowId,
    "debug"
  );

  assert.equal(
    resolveWorkflow({
      prompt: "review this branch for regressions",
      hasExistingSpec: false,
    }).workflowId,
    "review"
  );

  assert.equal(
    resolveWorkflow({
      prompt: "plan a complete redesign of the workflow engine",
      hasExistingSpec: false,
    }).workflowId,
    "epic"
  );

  assert.equal(
    resolveWorkflow({
      prompt: "resume the redesign of the workflow engine",
      hasExistingSpec: true,
    }).workflowId,
    "phase"
  );

  assert.equal(
    resolveWorkflow({
      prompt: "verify this run against the spec",
      hasExistingSpec: true,
    }).workflowId,
    "review"
  );
});
