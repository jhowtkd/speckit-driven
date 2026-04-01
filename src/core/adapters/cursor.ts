import { existsSync } from "fs";
import { join } from "path";
import { fileBuffersEqual, listFilesRecursive } from "../fs-utils";
import { installBundleFiles, type InstallReport } from "../install-files";
import { updateKitFiles, writeKitMeta, type UpdateReport } from "../update-assets";
import { getPackageRoot } from "../paths";
import { readInstalledKitMeta, readKitVersion } from "../versioning";
import type { DoctorIssue } from "../doctor-check";

export type CursorAdapterDoctorReport = {
  ok: boolean;
  issues: DoctorIssue[];
  checkedFiles: number;
  missing: string[];
  mismatched: string[];
};

export function getCursorAdapterAssetsDir(): string {
  return join(getPackageRoot(), "assets", "adapters", "cursor");
}

export function getCursorAdapterTargetDir(cwd: string): string {
  return join(cwd, ".cursor");
}

export function assertProjectRoot(
  cwd: string,
  allowAnywhere: boolean,
  commandLabel: string
): void {
  if (allowAnywhere) return;
  const hasGit = existsSync(join(cwd, ".git"));
  const hasPkg = existsSync(join(cwd, "package.json"));
  if (!hasGit && !hasPkg) {
    throw new Error(
      `${commandLabel}: no .git or package.json in the current directory. Run from a project root, or pass --allow-anywhere.`
    );
  }
}

export function installCursorAdapter(options: {
  cwd: string;
  force: boolean;
  allowAnywhere: boolean;
}): { targetDir: string; report: InstallReport; kitVersion: string } {
  const { cwd, force, allowAnywhere } = options;
  assertProjectRoot(cwd, allowAnywhere, "elf adapter install cursor");

  const assetsDir = getCursorAdapterAssetsDir();
  if (!existsSync(assetsDir)) {
    throw new Error(`elf adapter install cursor: bundled assets missing at ${assetsDir}`);
  }

  const targetDir = getCursorAdapterTargetDir(cwd);
  const report = installBundleFiles({
    sourceDir: assetsDir,
    targetDir,
    force,
  });

  const kitVersion = readKitVersion(getPackageRoot());
  writeKitMeta(targetDir, kitVersion);

  return { targetDir, report, kitVersion };
}

export function updateCursorAdapter(options: {
  cwd: string;
  force: boolean;
}): { targetDir: string; report: UpdateReport; kitVersion: string } {
  const { cwd, force } = options;
  const targetDir = getCursorAdapterTargetDir(cwd);
  if (!existsSync(targetDir)) {
    throw new Error(
      'elf adapter update cursor: .cursor/ not found. Run "elf adapter install cursor" first.'
    );
  }

  const assetsDir = getCursorAdapterAssetsDir();
  if (!existsSync(assetsDir)) {
    throw new Error(`elf adapter update cursor: bundled assets missing at ${assetsDir}`);
  }

  const report = updateKitFiles({
    assetsCursorDir: assetsDir,
    targetCursorDir: targetDir,
    force,
  });

  const kitVersion = readKitVersion(getPackageRoot());
  writeKitMeta(targetDir, kitVersion);

  return { targetDir, report, kitVersion };
}

export function doctorCursorAdapter(options: {
  cwd: string;
  strictContent: boolean;
}): CursorAdapterDoctorReport {
  const { cwd, strictContent } = options;
  const issues: DoctorIssue[] = [];
  const missing: string[] = [];
  const mismatched: string[] = [];

  const targetDir = getCursorAdapterTargetDir(cwd);
  if (!existsSync(targetDir)) {
    issues.push({
      kind: "error",
      message: "Missing .cursor/ — run elf adapter install cursor",
    });
    return { ok: false, issues, checkedFiles: 0, missing, mismatched };
  }

  const meta = readInstalledKitMeta(targetDir);
  if (!meta) {
    issues.push({
      kind: "warn",
      message:
        "Missing .cursor/spec-driven-kit.json (kit metadata). Run adapter install or update.",
    });
  }

  const assetsDir = getCursorAdapterAssetsDir();
  if (!existsSync(assetsDir)) {
    issues.push({
      kind: "error",
      message: `Missing adapter assets at ${assetsDir}`,
    });
    return { ok: false, issues, checkedFiles: 0, missing, mismatched };
  }

  const relPaths = listFilesRecursive(assetsDir);
  let checkedFiles = 0;
  for (const rel of relPaths) {
    checkedFiles += 1;
    const src = join(assetsDir, rel);
    const dest = join(targetDir, rel);
    if (!existsSync(dest)) {
      missing.push(rel);
      issues.push({
        kind: "error",
        message: `Adapter file missing in project: .cursor/${rel}`,
      });
      continue;
    }
    if (!fileBuffersEqual(src, dest)) {
      mismatched.push(rel);
      issues.push({
        kind: strictContent ? "error" : "warn",
        message: `Content differs from adapter bundle: .cursor/${rel}`,
      });
    }
  }

  const ok = !issues.some((issue) => issue.kind === "error");
  return { ok, issues, checkedFiles, missing, mismatched };
}
