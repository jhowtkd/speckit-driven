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
 * Validates target `.cursor/` against bundled assets (presence + optional byte match).
 */
export function runDoctor(options: {
  cwd: string;
  assetsCursorDir: string;
  strictContent: boolean;
}): DoctorReport {
  const { cwd, assetsCursorDir, strictContent } = options;
  const cursorDir = join(cwd, ".cursor");
  const issues: DoctorIssue[] = [];
  const missing: string[] = [];
  const mismatched: string[] = [];

  if (!existsSync(cursorDir)) {
    issues.push({
      kind: "error",
      message: "Missing .cursor/ — run spec-driven-kit init",
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
        "Missing .cursor/spec-driven-kit.json (kit metadata). Run init or update.",
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
    if (strictContent && !fileBuffersEqual(src, dest)) {
      mismatched.push(rel);
      issues.push({
        kind: "warn",
        message: `Content differs from installed kit: .cursor/${rel} (compare or run update --force)`,
      });
    }
  }

  const ok = !issues.some((i) => i.kind === "error");
  return { ok, issues, checkedFiles, missing, mismatched };
}
