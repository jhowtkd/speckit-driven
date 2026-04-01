import type { ElfIntent } from "./types";

function normalizeText(prompt: string): string {
  return prompt.trim().toLowerCase().replace(/\s+/g, " ");
}

export function normalizeIntent(prompt: string, hasExistingSpec: boolean): ElfIntent {
  const text = normalizeText(prompt);

  if (
    text.includes("review") ||
    text.includes("code review") ||
    text.includes("verify") ||
    text.includes("validation") ||
    text.includes("check this run") ||
    text.includes("against the spec") ||
    text.includes("feedback") ||
    (text.includes("branch") && text.includes("regression"))
  ) {
    if (text.includes("verify") || text.includes("validation") || text.includes("against the spec")) {
      return "verify-run";
    }
    return "review-change";
  }

  if (hasExistingSpec && (text.includes("continue") || text.includes("resume"))) {
    return "continue-run";
  }

  if (
    (text.startsWith("fix ") || text.startsWith("patch ") || text.includes("small fix") || text.includes("bounded fix") || text.includes("typo") || text.includes("one-line")) &&
    !text.includes("crash") &&
    !text.includes("stack trace") &&
    !text.includes("error") &&
    !text.includes("broken") &&
    !text.includes("reproduce") &&
    !text.includes("investigate")
  ) {
    return "new-task";
  }

  if (
    text.includes("crash") ||
    text.includes("stack trace") ||
    text.includes("failing") ||
    text.includes("failed") ||
    text.includes("error") ||
    text.includes("broken") ||
    text.includes("reproduce") ||
    text.includes("investigate") ||
    text.includes("bug report")
  ) {
    return "debug-issue";
  }

  if (
    text.includes("redesign") ||
    text.includes("rewrite") ||
    text.includes("rebuild") ||
    text.includes("overhaul") ||
    text.includes("migration") ||
    text.includes("initiative") ||
    text.includes("platform") ||
    text.includes("architecture")
  ) {
    return "new-epic";
  }

  if (text.includes("ship") || text.includes("release")) {
    return "ship-phase";
  }

  return hasExistingSpec ? "new-task" : "new-phase";
}
