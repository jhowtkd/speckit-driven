import { existsSync } from "fs";
import { join } from "path";
import { listFilesRecursive, fileBuffersEqual } from "./fs-utils";
import { readInstalledKitMeta } from "./versioning";

export type DoctorIssue = { kind: "error" | "warn"; message: string };

export type DoctorReport = {
  ok: boolean;
  issues: DoctorIssue[];
  checkedFiles: number;
  missing: string[];
  mismatched: string[];
};

/**
 * Validates target `.cursor/` and root `AGENTS.md` against bundled kit.
 * Content drift: warn by default; --strict promotes drift to errors.
 */
export function runDoctor(options: {
  cwd: string;
  assetsCursorDir: string;
  agentsTemplatePath: string;
  strictContent: boolean;
}): DoctorReport {
  const { cwd, assetsCursorDir, agentsTemplatePath, strictContent } = options;
  const issues: DoctorIssue[] = [];
  const missing: string[] = [];
  const mismatched: string[] = [];

  const cursorDir = join(cwd, ".cursor");
  if (!existsSync(cursorDir)) {
    issues.push({
      kind: "error",
      message: "Missing .cursor/ — run spec-driven-kit install",
    });
    return {
      ok: false,
      issues,
      checkedFiles: 0,
      missing,
      mismatched,
    };
  }

  const meta = readInstalledKitMeta(cursorDir);
  if (!meta) {
    issues.push({
      kind: "warn",
      message:
        "Missing .cursor/spec-driven-kit.json (kit metadata). Run install or update.",
    });
  }

  const bundleRel = listFilesRecursive(assetsCursorDir);
  let checkedFiles = 0;

  for (const rel of bundleRel) {
    checkedFiles += 1;
    const src = join(assetsCursorDir, rel);
    const dest = join(cursorDir, rel);
    if (!existsSync(dest)) {
      missing.push(rel);
      issues.push({
        kind: "error",
        message: `Kit file missing in project: .cursor/${rel}`,
      });
      continue;
    }
    if (!fileBuffersEqual(src, dest)) {
      mismatched.push(rel);
      const msg = `Content differs from installed kit: .cursor/${rel} (compare or run update --force)`;
      issues.push({
        kind: strictContent ? "error" : "warn",
        message: msg,
      });
    }
  }

  const agentsDest = join(cwd, "AGENTS.md");
  checkedFiles += 1;
  if (!existsSync(agentsDest)) {
    missing.push("AGENTS.md");
    issues.push({
      kind: "error",
      message:
        "Kit file missing in project: AGENTS.md (run spec-driven-kit install)",
    });
  } else if (
    existsSync(agentsTemplatePath) &&
    !fileBuffersEqual(agentsTemplatePath, agentsDest)
  ) {
    mismatched.push("AGENTS.md");
    issues.push({
      kind: strictContent ? "error" : "warn",
      message:
        "Content differs from installed kit: AGENTS.md (compare or run update --force)",
    });
  }

  const ok = !issues.some((i) => i.kind === "error");
  return { ok, issues, checkedFiles, missing, mismatched };
}
