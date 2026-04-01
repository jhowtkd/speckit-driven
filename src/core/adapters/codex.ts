import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "fs";
import { dirname, join, relative, resolve } from "path";
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
import {
  deleteGlobalManifest,
  loadGlobalManifest,
  writeGlobalManifest,
  type GlobalInstallManifest,
} from "./global-manifest";

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
  baseDir: string,
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
  mergeInstallReport(report, normalizeRel(relative(baseDir, targetDir)), child);
}

function syncTreeUpdate(
  baseDir: string,
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
  mergeUpdateReport(report, normalizeRel(relative(baseDir, targetDir)), child);
}

function syncSingleFileInstall(
  baseDir: string,
  sourceFile: string,
  targetFile: string,
  force: boolean,
  report: CodexSyncReport
): void {
  if (!existsSync(sourceFile)) {
    throw new Error(`elf adapter install codex: bundled asset missing at ${sourceFile}`);
  }

  mkdirSync(dirname(targetFile), { recursive: true });
  const rel = normalizeRel(relative(baseDir, targetFile));

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
  baseDir: string,
  sourceFile: string,
  targetFile: string,
  force: boolean,
  report: CodexSyncReport
): void {
  if (!existsSync(sourceFile)) {
    throw new Error(`elf adapter update codex: bundled asset missing at ${sourceFile}`);
  }

  mkdirSync(dirname(targetFile), { recursive: true });
  const rel = normalizeRel(relative(baseDir, targetFile));

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

function hasCodexGlobalFootprint(homeDir: string): boolean {
  const plan = describeCodexAdapter({
    cwd: homeDir,
    scope: "global",
    homeDir,
  });
  return plan.doctorPaths.some((targetPath) => existsSync(targetPath));
}

function listManagedTopLevelPaths(
  sourceDir: string,
  targetDir: string,
  baseDir: string
): string[] {
  return readdirSync(sourceDir)
    .sort()
    .map((entryName) =>
    normalizeRel(relative(baseDir, join(targetDir, entryName)))
    );
}

function resolveValidatedCodexManagedPath(homeDir: string, managedPath: string): string {
  const resolvedPath = resolve(homeDir, managedPath);
  const rel = normalizeRel(relative(homeDir, resolvedPath));
  if (rel === ".." || rel.startsWith("../")) {
    throw new Error(`Invalid managed path outside homeDir: ${managedPath}`);
  }
  if (rel !== ".codex" && !rel.startsWith(".codex/")) {
    throw new Error(`Invalid managed path outside .codex/: ${managedPath}`);
  }
  return resolvedPath;
}

function buildCodexGlobalManagedPaths(homeDir: string, assetsDir: string): string[] {
  return [
    ...listManagedTopLevelPaths(
      join(assetsDir, "skills"),
      getCodexGlobalSkillsDir(homeDir),
      homeDir
    ),
    ...listManagedTopLevelPaths(
      join(assetsDir, "rules"),
      getCodexGlobalRulesDir(homeDir),
      homeDir
    ),
    ...listManagedTopLevelPaths(
      join(assetsDir, "agents"),
      getCodexGlobalAgentsDir(homeDir),
      homeDir
    ),
    normalizeRel(relative(homeDir, getCodexGlobalHooksPath(homeDir))),
  ];
}

function buildCodexGlobalManifest(options: {
  homeDir: string;
  assetsDir: string;
  installedAt?: string;
}): GlobalInstallManifest {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    host: "codex",
    elfVersion: readKitVersion(getPackageRoot()),
    managedPaths: buildCodexGlobalManagedPaths(options.homeDir, options.assetsDir),
    installedAt: options.installedAt ?? now,
    updatedAt: now,
  };
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
  baseDir: string,
  sourceDir: string,
  targetDir: string,
  strictContent: boolean,
  report: CodexAdapterDoctorReport
): void {
  const relPrefix = normalizeRel(relative(baseDir, targetDir));
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
  baseDir: string,
  sourceFile: string,
  targetFile: string,
  strictContent: boolean,
  report: CodexAdapterDoctorReport
): void {
  report.checkedFiles += 1;
  const rel = normalizeRel(relative(baseDir, targetFile));
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

export function installCodexGlobalAdapter(options: {
  homeDir: string;
  force: boolean;
}): CodexAdapterInstallResult {
  const { homeDir, force } = options;
  const assetsDir = getCodexAdapterAssetsDir();
  const report = emptySyncReport();

  syncTreeInstall(
    homeDir,
    join(assetsDir, "skills"),
    getCodexGlobalSkillsDir(homeDir),
    force,
    report
  );
  syncTreeInstall(
    homeDir,
    join(assetsDir, "rules"),
    getCodexGlobalRulesDir(homeDir),
    force,
    report
  );
  syncTreeInstall(
    homeDir,
    join(assetsDir, "agents"),
    getCodexGlobalAgentsDir(homeDir),
    force,
    report
  );
  syncSingleFileInstall(
    homeDir,
    join(assetsDir, "hooks.json"),
    getCodexGlobalHooksPath(homeDir),
    force,
    report
  );

  const manifest = buildCodexGlobalManifest({
    homeDir,
    assetsDir,
  });
  writeGlobalManifest({
    host: "codex",
    homeDir,
    manifest,
  });

  return {
    report,
    kitVersion: manifest.elfVersion,
    removedLegacy: [],
  };
}

export function updateCodexGlobalAdapter(options: {
  homeDir: string;
  force: boolean;
}): CodexAdapterUpdateResult {
  const { homeDir, force } = options;
  if (!hasCodexGlobalFootprint(homeDir)) {
    throw new Error(
      'elf global update codex: no global Codex adapter footprint found. Run "elf global install codex" first.'
    );
  }

  const assetsDir = getCodexAdapterAssetsDir();
  const report = emptySyncReport();

  syncTreeUpdate(
    homeDir,
    join(assetsDir, "skills"),
    getCodexGlobalSkillsDir(homeDir),
    force,
    report
  );
  syncTreeUpdate(
    homeDir,
    join(assetsDir, "rules"),
    getCodexGlobalRulesDir(homeDir),
    force,
    report
  );
  syncTreeUpdate(
    homeDir,
    join(assetsDir, "agents"),
    getCodexGlobalAgentsDir(homeDir),
    force,
    report
  );
  syncSingleFileUpdate(
    homeDir,
    join(assetsDir, "hooks.json"),
    getCodexGlobalHooksPath(homeDir),
    force,
    report
  );

  const existingManifest = loadGlobalManifest({
    host: "codex",
    homeDir,
  });
  const manifest = buildCodexGlobalManifest({
    homeDir,
    assetsDir,
    installedAt: existingManifest?.installedAt,
  });
  writeGlobalManifest({
    host: "codex",
    homeDir,
    manifest,
  });

  return {
    report,
    kitVersion: manifest.elfVersion,
    removedLegacy: [],
  };
}

export function doctorCodexGlobalAdapter(options: {
  homeDir: string;
  strictContent: boolean;
}): CodexAdapterDoctorReport {
  const { homeDir, strictContent } = options;
  const report: CodexAdapterDoctorReport = {
    ok: false,
    issues: [],
    checkedFiles: 0,
    missing: [],
    mismatched: [],
    unexpected: [],
  };

  const manifest = loadGlobalManifest({
    host: "codex",
    homeDir,
  });
  if (!manifest) {
    report.issues.push({
      kind: "error",
      message: "Missing ~/.codex/.elf-global.json — run elf global install codex",
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

  verifyTree(
    homeDir,
    join(assetsDir, "skills"),
    getCodexGlobalSkillsDir(homeDir),
    strictContent,
    report
  );
  verifyTree(
    homeDir,
    join(assetsDir, "rules"),
    getCodexGlobalRulesDir(homeDir),
    strictContent,
    report
  );
  verifyTree(
    homeDir,
    join(assetsDir, "agents"),
    getCodexGlobalAgentsDir(homeDir),
    strictContent,
    report
  );
  verifySingleFile(
    homeDir,
    join(assetsDir, "hooks.json"),
    getCodexGlobalHooksPath(homeDir),
    strictContent,
    report
  );

  for (const managedPath of manifest.managedPaths) {
    let resolvedPath: string;
    try {
      resolvedPath = resolveValidatedCodexManagedPath(homeDir, managedPath);
    } catch (error) {
      report.issues.push({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    if (!existsSync(resolvedPath)) {
      report.missing.push(managedPath);
      report.issues.push({
        kind: "error",
        message: `Managed path missing from global install: ${managedPath}`,
      });
    }
  }

  report.ok = !report.issues.some((issue) => issue.kind === "error");
  return report;
}

export function uninstallCodexGlobalAdapter(options: { homeDir: string }): void {
  const manifest = loadGlobalManifest({
    host: "codex",
    homeDir: options.homeDir,
  });
  if (!manifest) {
    return;
  }

  for (const managedPath of manifest.managedPaths) {
    rmSync(resolveValidatedCodexManagedPath(options.homeDir, managedPath), {
      recursive: true,
      force: true,
    });
  }

  deleteGlobalManifest({
    host: "codex",
    homeDir: options.homeDir,
  });
}
