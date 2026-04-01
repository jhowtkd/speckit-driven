import { copyFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join, relative } from "path";
import { fileBuffersEqual, listFilesRecursive } from "../fs-utils";
import { installBundleFiles, type InstallReport } from "../install-files";
import { updateKitFiles, type UpdateReport } from "../update-assets";
import {
  getCodexGlobalAgentsDir,
  getCodexGlobalHooksPath,
  getCodexGlobalManifestPath,
  getCodexGlobalRulesDir,
  getCodexGlobalSkillsDir,
  getPackageRoot,
} from "../paths";
import { readKitVersion } from "../versioning";
import type { DoctorIssue } from "../doctor-check";
import type { AdapterPlan, AdapterScope } from "./global-types";

export type CodexSyncReport = {
  created: string[];
  updated: string[];
  skipped: string[];
  identical: string[];
  divergedSkipped: string[];
};

export type CodexAdapterDoctorReport = {
  ok: boolean;
  issues: DoctorIssue[];
  checkedFiles: number;
  missing: string[];
  mismatched: string[];
  unexpected: string[];
};

export type CodexAdapterInstallResult = {
  report: CodexSyncReport;
  kitVersion: string;
  removedLegacy: string[];
};

export type CodexAdapterUpdateResult = CodexAdapterInstallResult;

const CODEx_SKILLS_TARGET = join(".agents", "skills");
const CODEx_RULES_TARGET = join("codex", "rules");
const CODEx_AGENTS_TARGET = join(".codex", "agents");
const CODEx_HOOKS_TARGET = join(".codex", "hooks.json");

function normalizeRel(value: string): string {
  return value.split("\\").join("/");
}

function prefixRel(prefix: string, rel: string): string {
  return normalizeRel(join(prefix, rel));
}

function emptySyncReport(): CodexSyncReport {
  return {
    created: [],
    updated: [],
    skipped: [],
    identical: [],
    divergedSkipped: [],
  };
}

function mergeInstallReport(
  report: CodexSyncReport,
  prefix: string,
  child: InstallReport
): void {
  report.created.push(...child.created.map((rel) => prefixRel(prefix, rel)));
  report.updated.push(...child.updated.map((rel) => prefixRel(prefix, rel)));
  report.skipped.push(...child.skipped.map((rel) => prefixRel(prefix, rel)));
}

function mergeUpdateReport(
  report: CodexSyncReport,
  prefix: string,
  child: UpdateReport
): void {
  report.created.push(...child.created.map((rel) => prefixRel(prefix, rel)));
  report.updated.push(...child.updated.map((rel) => prefixRel(prefix, rel)));
  report.identical.push(...child.identical.map((rel) => prefixRel(prefix, rel)));
  report.divergedSkipped.push(
    ...child.divergedSkipped.map((rel) => prefixRel(prefix, rel))
  );
}

function assertProjectRoot(
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

function syncTreeInstall(
  cwd: string,
  sourceDir: string,
  targetDir: string,
  force: boolean,
  report: CodexSyncReport
): void {
  if (!existsSync(sourceDir)) {
    throw new Error(`elf adapter install codex: bundled assets missing at ${sourceDir}`);
  }
  const child = installBundleFiles({
    sourceDir,
    targetDir,
    force,
  });
  mergeInstallReport(report, normalizeRel(relative(cwd, targetDir)), child);
}

function syncTreeUpdate(
  cwd: string,
  sourceDir: string,
  targetDir: string,
  force: boolean,
  report: CodexSyncReport
): void {
  if (!existsSync(sourceDir)) {
    throw new Error(`elf adapter update codex: bundled assets missing at ${sourceDir}`);
  }
  const child = updateKitFiles({
    assetsCursorDir: sourceDir,
    targetCursorDir: targetDir,
    force,
  });
  mergeUpdateReport(report, normalizeRel(relative(cwd, targetDir)), child);
}

function syncSingleFileInstall(
  cwd: string,
  sourceFile: string,
  targetFile: string,
  force: boolean,
  report: CodexSyncReport
): void {
  if (!existsSync(sourceFile)) {
    throw new Error(`elf adapter install codex: bundled asset missing at ${sourceFile}`);
  }

  mkdirSync(join(targetFile, ".."), { recursive: true });
  const rel = normalizeRel(relative(cwd, targetFile));

  if (existsSync(targetFile)) {
    if (force) {
      copyFileSync(sourceFile, targetFile);
      report.updated.push(rel);
    } else {
      report.skipped.push(rel);
    }
    return;
  }

  copyFileSync(sourceFile, targetFile);
  report.created.push(rel);
}

function syncSingleFileUpdate(
  cwd: string,
  sourceFile: string,
  targetFile: string,
  force: boolean,
  report: CodexSyncReport
): void {
  if (!existsSync(sourceFile)) {
    throw new Error(`elf adapter update codex: bundled asset missing at ${sourceFile}`);
  }

  mkdirSync(join(targetFile, ".."), { recursive: true });
  const rel = normalizeRel(relative(cwd, targetFile));

  if (!existsSync(targetFile)) {
    copyFileSync(sourceFile, targetFile);
    report.created.push(rel);
    return;
  }

  if (readFileSync(sourceFile).equals(readFileSync(targetFile))) {
    report.identical.push(rel);
    return;
  }

  if (force) {
    copyFileSync(sourceFile, targetFile);
    report.updated.push(rel);
  } else {
    report.divergedSkipped.push(rel);
  }
}

function getCodexAdapterAssetsDir(): string {
  return join(getPackageRoot(), "assets", "adapters", "codex");
}

function getCodexSkillsTargetDir(cwd: string): string {
  return join(cwd, ".agents", "skills");
}

function getCodexRulesTargetDir(cwd: string): string {
  return join(cwd, "codex", "rules");
}

function getCodexAgentsTargetDir(cwd: string): string {
  return join(cwd, ".codex", "agents");
}

function getCodexHooksTargetPath(cwd: string): string {
  return join(cwd, ".codex", "hooks.json");
}

export function describeCodexAdapter(options: {
  cwd: string;
  scope: AdapterScope;
  homeDir?: string;
}): AdapterPlan {
  if (options.scope === "project") {
    const installPaths = [
      getCodexSkillsTargetDir(options.cwd),
      getCodexRulesTargetDir(options.cwd),
      getCodexAgentsTargetDir(options.cwd),
      getCodexHooksTargetPath(options.cwd),
    ];
    return {
      host: "codex",
      scope: "project",
      installPaths,
      doctorPaths: [...installPaths],
      uninstallPaths: [...installPaths],
      manifestPath: null,
    };
  }

  const installPaths = [
    getCodexGlobalSkillsDir(options.homeDir),
    getCodexGlobalRulesDir(options.homeDir),
    getCodexGlobalAgentsDir(options.homeDir),
    getCodexGlobalHooksPath(options.homeDir),
  ];
  const manifestPath = getCodexGlobalManifestPath(options.homeDir);

  return {
    host: "codex",
    scope: "global",
    installPaths,
    doctorPaths: [...installPaths, manifestPath],
    uninstallPaths: [...installPaths, manifestPath],
    manifestPath,
  };
}

function hasCodexAdapterFootprint(cwd: string): boolean {
  return (
    existsSync(getCodexSkillsTargetDir(cwd)) ||
    existsSync(getCodexRulesTargetDir(cwd)) ||
    existsSync(getCodexAgentsTargetDir(cwd)) ||
    existsSync(getCodexHooksTargetPath(cwd))
  );
}

export function installCodexAdapter(options: {
  cwd: string;
  force: boolean;
  allowAnywhere: boolean;
}): CodexAdapterInstallResult {
  const { cwd, force, allowAnywhere } = options;
  assertProjectRoot(cwd, allowAnywhere, "elf adapter install codex");

  const assetsDir = getCodexAdapterAssetsDir();
  const report = emptySyncReport();

  syncTreeInstall(cwd, join(assetsDir, "skills"), getCodexSkillsTargetDir(cwd), force, report);
  syncTreeInstall(cwd, join(assetsDir, "rules"), getCodexRulesTargetDir(cwd), force, report);
  syncTreeInstall(cwd, join(assetsDir, "agents"), getCodexAgentsTargetDir(cwd), force, report);
  syncSingleFileInstall(
    cwd,
    join(assetsDir, "hooks.json"),
    getCodexHooksTargetPath(cwd),
    force,
    report
  );

  const kitVersion = readKitVersion(getPackageRoot());
  return { report, kitVersion, removedLegacy: [] };
}

export function updateCodexAdapter(options: {
  cwd: string;
  force: boolean;
}): CodexAdapterUpdateResult {
  const { cwd, force } = options;
  if (!hasCodexAdapterFootprint(cwd)) {
    throw new Error(
      'elf adapter update codex: no Codex adapter footprint found. Run "elf adapter install codex" first.'
    );
  }

  const assetsDir = getCodexAdapterAssetsDir();
  const report = emptySyncReport();

  syncTreeUpdate(cwd, join(assetsDir, "skills"), getCodexSkillsTargetDir(cwd), force, report);
  syncTreeUpdate(cwd, join(assetsDir, "rules"), getCodexRulesTargetDir(cwd), force, report);
  syncTreeUpdate(cwd, join(assetsDir, "agents"), getCodexAgentsTargetDir(cwd), force, report);
  syncSingleFileUpdate(
    cwd,
    join(assetsDir, "hooks.json"),
    getCodexHooksTargetPath(cwd),
    force,
    report
  );

  const kitVersion = readKitVersion(getPackageRoot());
  return { report, kitVersion, removedLegacy: [] };
}

function verifyTree(
  cwd: string,
  sourceDir: string,
  targetDir: string,
  strictContent: boolean,
  report: CodexAdapterDoctorReport
): void {
  const relPrefix = normalizeRel(relative(cwd, targetDir));
  const relPaths = listFilesRecursive(sourceDir);
  for (const rel of relPaths) {
    report.checkedFiles += 1;
    const src = join(sourceDir, rel);
    const dest = join(targetDir, rel);
    const destRel = prefixRel(relPrefix, rel);
    if (!existsSync(dest)) {
      report.missing.push(destRel);
      report.issues.push({
        kind: "error",
        message: `Missing adapter file: ${destRel}`,
      });
      continue;
    }
    if (!fileBuffersEqual(src, dest)) {
      report.mismatched.push(destRel);
      report.issues.push({
        kind: strictContent ? "error" : "warn",
        message: `Content differs from adapter bundle: ${destRel}`,
      });
    }
  }
}

function verifySingleFile(
  cwd: string,
  sourceFile: string,
  targetFile: string,
  strictContent: boolean,
  report: CodexAdapterDoctorReport
): void {
  report.checkedFiles += 1;
  const rel = normalizeRel(relative(cwd, targetFile));
  if (!existsSync(targetFile)) {
    report.missing.push(rel);
    report.issues.push({
      kind: "error",
      message: `Missing adapter file: ${rel}`,
    });
    return;
  }

  if (!fileBuffersEqual(sourceFile, targetFile)) {
    report.mismatched.push(rel);
    report.issues.push({
      kind: strictContent ? "error" : "warn",
      message: `Content differs from adapter bundle: ${rel}`,
    });
  }
}

export function doctorCodexAdapter(options: {
  cwd: string;
  strictContent: boolean;
}): CodexAdapterDoctorReport {
  const { cwd, strictContent } = options;
  const report: CodexAdapterDoctorReport = {
    ok: false,
    issues: [],
    checkedFiles: 0,
    missing: [],
    mismatched: [],
    unexpected: [],
  };

  const skillsTarget = getCodexSkillsTargetDir(cwd);
  if (!existsSync(skillsTarget)) {
    report.issues.push({
      kind: "error",
      message: "Missing .agents/skills — run elf adapter install codex",
    });
    return report;
  }

  const assetsDir = getCodexAdapterAssetsDir();
  if (!existsSync(assetsDir)) {
    report.issues.push({
      kind: "error",
      message: `Missing adapter assets at ${assetsDir}`,
    });
    return report;
  }

  verifyTree(cwd, join(assetsDir, "skills"), getCodexSkillsTargetDir(cwd), strictContent, report);
  verifyTree(cwd, join(assetsDir, "rules"), getCodexRulesTargetDir(cwd), strictContent, report);
  verifyTree(cwd, join(assetsDir, "agents"), getCodexAgentsTargetDir(cwd), strictContent, report);
  verifySingleFile(
    cwd,
    join(assetsDir, "hooks.json"),
    getCodexHooksTargetPath(cwd),
    strictContent,
    report
  );

  report.ok = !report.issues.some((issue) => issue.kind === "error");
  return report;
}
