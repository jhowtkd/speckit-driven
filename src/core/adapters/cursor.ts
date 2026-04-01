import {
  existsSync,
  readFileSync,
  rmSync,
  unlinkSync,
} from "fs";
import { join, relative, resolve } from "path";
import { fileBuffersEqual, listFilesRecursive } from "../fs-utils";
import { installBundleFiles, type InstallReport } from "../install-files";
import { updateKitFiles, writeKitMeta, type UpdateReport } from "../update-assets";
import { getPackageRoot } from "../paths";
import { readInstalledKitMeta, readKitVersion } from "../versioning";
import type { DoctorIssue } from "../doctor-check";
import type { AdapterPlan, AdapterScope } from "./global-types";
import {
  getCursorGlobalDir,
  getCursorGlobalHooksPath,
  getCursorGlobalManifestPath,
  getCursorGlobalMcpPath,
  getCursorGlobalRulesDir,
} from "../paths";
import {
  deleteGlobalManifest,
  loadGlobalManifest,
  writeGlobalManifest,
  type GlobalInstallManifest,
} from "./global-manifest";
import {
  type CursorHookEntry,
  type CursorMcpServerEntry,
  mergeCursorGlobalHooksFile,
  mergeCursorGlobalMcpFile,
  removeCursorGlobalHooksFile,
  removeCursorGlobalMcpFile,
} from "./cursor-global-merge";

const LEGACY_CURSOR_ADAPTER_FILES = ["rules/00-using-spec-driven.mdc"];
const CURSOR_GLOBAL_MCP_SERVERS: Record<string, CursorMcpServerEntry> = {
  elf: {
    command: "elf",
    args: ["mcp", "serve"],
  },
};

const CURSOR_GLOBAL_HOOKS: Record<string, CursorHookEntry[]> = {
  beforeSubmitPrompt: [{ command: "elf doctor --strict" }],
  beforeMCPExecution: [{ command: "elf doctor --strict" }],
};

export type CursorAdapterDoctorReport = {
  ok: boolean;
  issues: DoctorIssue[];
  checkedFiles: number;
  missing: string[];
  mismatched: string[];
  unexpected: string[];
};

export type CursorAdapterInstallResult = {
  targetDir: string;
  report: InstallReport;
  kitVersion: string;
  removedLegacy: string[];
};

export type CursorAdapterUpdateResult = {
  targetDir: string;
  report: UpdateReport;
  kitVersion: string;
  removedLegacy: string[];
};

export function getCursorAdapterAssetsDir(): string {
  return join(getPackageRoot(), "assets", "adapters", "cursor");
}

export function getCursorAdapterTargetDir(cwd: string): string {
  return join(cwd, ".cursor");
}

function getCursorGlobalRulesAssetsDir(): string {
  return join(getCursorAdapterAssetsDir(), "rules");
}

export function describeCursorAdapter(options: {
  cwd: string;
  scope: AdapterScope;
  homeDir?: string;
}): AdapterPlan {
  if (options.scope === "project") {
    const targetDir = getCursorAdapterTargetDir(options.cwd);
    return {
      host: "cursor",
      scope: "project",
      installPaths: [targetDir],
      doctorPaths: [targetDir],
      uninstallPaths: [targetDir],
      manifestPath: null,
    };
  }

  const installPaths = [
    getCursorGlobalRulesDir(options.homeDir),
    getCursorGlobalMcpPath(options.homeDir),
    getCursorGlobalHooksPath(options.homeDir),
  ];
  const manifestPath = getCursorGlobalManifestPath(options.homeDir);

  return {
    host: "cursor",
    scope: "global",
    installPaths,
    doctorPaths: [...installPaths, manifestPath],
    uninstallPaths: [...installPaths, manifestPath],
    manifestPath,
  };
}

function removeLegacyCursorAdapterFiles(targetDir: string): string[] {
  const removed: string[] = [];
  for (const rel of LEGACY_CURSOR_ADAPTER_FILES) {
    const filePath = join(targetDir, rel);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      removed.push(rel);
    }
  }
  return removed;
}

function findLegacyCursorAdapterFiles(targetDir: string): string[] {
  return LEGACY_CURSOR_ADAPTER_FILES.filter((rel) =>
    existsSync(join(targetDir, rel))
  );
}

function hasCursorGlobalFootprint(homeDir: string): boolean {
  const plan = describeCursorAdapter({
    cwd: homeDir,
    scope: "global",
    homeDir,
  });
  return plan.doctorPaths.some((targetPath) => existsSync(targetPath));
}

function buildCursorGlobalManagedPaths(homeDir: string): string[] {
  return listFilesRecursive(getCursorGlobalRulesAssetsDir())
    .sort()
    .map((rel) => normalizeCursorRel(relative(homeDir, join(getCursorGlobalRulesDir(homeDir), rel))));
}

function normalizeCursorRel(value: string): string {
  return value.split("\\").join("/");
}

function buildCursorGlobalManifest(options: {
  homeDir: string;
  installedAt?: string;
  previousManifest?: GlobalInstallManifest | null;
}): GlobalInstallManifest {
  const now = new Date().toISOString();
  const managedPaths = Array.from(
    new Set([
      ...(options.previousManifest?.managedPaths ?? []),
      ...buildCursorGlobalManagedPaths(options.homeDir),
    ])
  ).sort();
  const currentManagedEntries = {
    mcpServers: Object.keys(CURSOR_GLOBAL_MCP_SERVERS).sort(),
    hooks: Object.entries(CURSOR_GLOBAL_HOOKS)
      .flatMap(([hookName, entries]) =>
        entries.map((entry) => `${hookName}:${entry.command}`)
      )
      .sort(),
  };
  return {
    schemaVersion: 1,
    host: "cursor",
    elfVersion: readKitVersion(getPackageRoot()),
    managedPaths,
    managedEntries: {
      mcpServers: Array.from(
        new Set([
          ...(options.previousManifest?.managedEntries?.mcpServers ?? []),
          ...currentManagedEntries.mcpServers,
        ])
      ).sort(),
      hooks: Array.from(
        new Set([
          ...(options.previousManifest?.managedEntries?.hooks ?? []),
          ...currentManagedEntries.hooks,
        ])
      ).sort(),
    },
    installedAt: options.installedAt ?? now,
    updatedAt: now,
  };
}

function resolveValidatedCursorManagedPath(homeDir: string, managedPath: string): string {
  const resolvedPath = resolve(homeDir, managedPath);
  const rel = normalizeCursorRel(relative(homeDir, resolvedPath));
  if (rel === ".." || rel.startsWith("../")) {
    throw new Error(`Invalid managed path outside homeDir: ${managedPath}`);
  }
  if (rel !== ".cursor" && !rel.startsWith(".cursor/")) {
    throw new Error(`Invalid managed path outside .cursor/: ${managedPath}`);
  }
  return resolvedPath;
}

function readCursorSharedConfig(filePath: string): Record<string, unknown> {
  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse Cursor shared config: ${filePath} (${message})`);
  }
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
}): CursorAdapterInstallResult {
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
  const removedLegacy = removeLegacyCursorAdapterFiles(targetDir);

  const kitVersion = readKitVersion(getPackageRoot());
  writeKitMeta(targetDir, kitVersion);

  return { targetDir, report, kitVersion, removedLegacy };
}

export function updateCursorAdapter(options: {
  cwd: string;
  force: boolean;
}): CursorAdapterUpdateResult {
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
  const removedLegacy = removeLegacyCursorAdapterFiles(targetDir);

  const kitVersion = readKitVersion(getPackageRoot());
  writeKitMeta(targetDir, kitVersion);

  return { targetDir, report, kitVersion, removedLegacy };
}

export function doctorCursorAdapter(options: {
  cwd: string;
  strictContent: boolean;
}): CursorAdapterDoctorReport {
  const { cwd, strictContent } = options;
  const issues: DoctorIssue[] = [];
  const missing: string[] = [];
  const mismatched: string[] = [];
  const unexpected: string[] = [];

  const targetDir = getCursorAdapterTargetDir(cwd);
  if (!existsSync(targetDir)) {
    issues.push({
      kind: "error",
      message: "Missing .cursor/ — run elf adapter install cursor",
    });
    return { ok: false, issues, checkedFiles: 0, missing, mismatched, unexpected };
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
    return { ok: false, issues, checkedFiles: 0, missing, mismatched, unexpected };
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

  for (const rel of findLegacyCursorAdapterFiles(targetDir)) {
    unexpected.push(rel);
    issues.push({
      kind: "error",
      message: `Legacy adapter file still present: .cursor/${rel}`,
    });
  }

  const ok = !issues.some((issue) => issue.kind === "error");
  return { ok, issues, checkedFiles, missing, mismatched, unexpected };
}

export function installCursorGlobalAdapter(options: {
  homeDir: string;
  force: boolean;
}): CursorAdapterInstallResult {
  const { homeDir, force } = options;
  const assetsDir = getCursorGlobalRulesAssetsDir();
  if (!existsSync(assetsDir)) {
    throw new Error(`elf global install cursor: bundled assets missing at ${assetsDir}`);
  }

  const targetDir = getCursorGlobalDir(homeDir);
  const report = installBundleFiles({
    sourceDir: assetsDir,
    targetDir: getCursorGlobalRulesDir(homeDir),
    force,
  });
  const removedLegacy = removeLegacyCursorAdapterFiles(targetDir);

  mergeCursorGlobalMcpFile({
    filePath: getCursorGlobalMcpPath(homeDir),
    mcpServers: CURSOR_GLOBAL_MCP_SERVERS,
  });
  mergeCursorGlobalHooksFile({
    filePath: getCursorGlobalHooksPath(homeDir),
    hooks: CURSOR_GLOBAL_HOOKS,
  });

  const manifest = buildCursorGlobalManifest({
    homeDir,
  });
  writeGlobalManifest({
    host: "cursor",
    homeDir,
    manifest,
  });

  return {
    targetDir,
    report,
    kitVersion: manifest.elfVersion,
    removedLegacy,
  };
}

export function updateCursorGlobalAdapter(options: {
  homeDir: string;
  force: boolean;
}): CursorAdapterUpdateResult {
  const { homeDir, force } = options;
  if (!hasCursorGlobalFootprint(homeDir)) {
    throw new Error(
      'elf global update cursor: no global Cursor adapter footprint found. Run "elf global install cursor" first.'
    );
  }

  const assetsDir = getCursorGlobalRulesAssetsDir();
  if (!existsSync(assetsDir)) {
    throw new Error(`elf global update cursor: bundled assets missing at ${assetsDir}`);
  }

  const targetDir = getCursorGlobalDir(homeDir);
  const report = updateKitFiles({
    assetsCursorDir: assetsDir,
    targetCursorDir: getCursorGlobalRulesDir(homeDir),
    force,
  });
  const removedLegacy = removeLegacyCursorAdapterFiles(targetDir);

  mergeCursorGlobalMcpFile({
    filePath: getCursorGlobalMcpPath(homeDir),
    mcpServers: CURSOR_GLOBAL_MCP_SERVERS,
  });
  mergeCursorGlobalHooksFile({
    filePath: getCursorGlobalHooksPath(homeDir),
    hooks: CURSOR_GLOBAL_HOOKS,
  });

  const existingManifest = loadGlobalManifest({
    host: "cursor",
    homeDir,
  });
  const manifest = buildCursorGlobalManifest({
    homeDir,
    installedAt: existingManifest?.installedAt,
    previousManifest: existingManifest,
  });
  writeGlobalManifest({
    host: "cursor",
    homeDir,
    manifest,
  });

  return {
    targetDir,
    report,
    kitVersion: manifest.elfVersion,
    removedLegacy,
  };
}

export function doctorCursorGlobalAdapter(options: {
  homeDir: string;
  strictContent: boolean;
}): CursorAdapterDoctorReport {
  const { homeDir, strictContent } = options;
  const issues: DoctorIssue[] = [];
  const missing: string[] = [];
  const mismatched: string[] = [];
  const unexpected: string[] = [];

  const manifest = loadGlobalManifest({
    host: "cursor",
    homeDir,
  });
  if (!manifest) {
    issues.push({
      kind: "error",
      message: "Missing ~/.cursor/.elf-global.json — run elf global install cursor",
    });
    return { ok: false, issues, checkedFiles: 0, missing, mismatched, unexpected };
  }

  const assetsDir = getCursorGlobalRulesAssetsDir();
  if (!existsSync(assetsDir)) {
    issues.push({
      kind: "error",
      message: `Missing adapter assets at ${assetsDir}`,
    });
    return { ok: false, issues, checkedFiles: 0, missing, mismatched, unexpected };
  }

  let checkedFiles = 0;
  for (const rel of listFilesRecursive(assetsDir).sort()) {
    checkedFiles += 1;
    const src = join(assetsDir, rel);
    const dest = join(getCursorGlobalRulesDir(homeDir), rel);
    const destRel = normalizeCursorRel(relative(homeDir, dest));
    if (!existsSync(dest)) {
      missing.push(destRel);
      issues.push({
        kind: "error",
        message: `Global adapter rule missing: ${destRel}`,
      });
      continue;
    }
    if (!fileBuffersEqual(src, dest)) {
      mismatched.push(destRel);
      issues.push({
        kind: strictContent ? "error" : "warn",
        message: `Content differs from global adapter bundle: ${destRel}`,
      });
    }
  }

  for (const rel of findLegacyCursorAdapterFiles(getCursorGlobalDir(homeDir))) {
    unexpected.push(rel);
    issues.push({
      kind: "error",
      message: `Legacy adapter file still present: .cursor/${rel}`,
    });
  }

  try {
    const mcpConfig = readCursorSharedConfig(getCursorGlobalMcpPath(homeDir)) as {
      mcpServers?: Record<string, { command?: string; args?: string[] }>;
    };
    checkedFiles += 1;
    const mcpServers = mcpConfig.mcpServers ?? {};
    for (const [serverName, expectedEntry] of Object.entries(CURSOR_GLOBAL_MCP_SERVERS)) {
      const installedEntry = mcpServers[serverName];
      if (!installedEntry) {
        missing.push(`.cursor/mcp.json#${serverName}`);
        issues.push({
          kind: "error",
          message: `Missing managed MCP server entry: ${serverName}`,
        });
        continue;
      }

      if (JSON.stringify(installedEntry) !== JSON.stringify(expectedEntry)) {
        mismatched.push(`.cursor/mcp.json#${serverName}`);
        issues.push({
          kind: strictContent ? "error" : "warn",
          message: `Managed MCP server entry drifted: ${serverName}`,
        });
      }
    }
  } catch (error) {
    issues.push({
      kind: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  try {
    const hooksConfig = readCursorSharedConfig(getCursorGlobalHooksPath(homeDir)) as {
      hooks?: Record<string, Array<{ command?: string }>>;
    };
    checkedFiles += 1;
    const hooks = hooksConfig.hooks ?? {};
    for (const [hookName, entries] of Object.entries(CURSOR_GLOBAL_HOOKS)) {
      const installedEntries = hooks[hookName] ?? [];
      for (const entry of entries) {
        if (!installedEntries.some((installed) => installed.command === entry.command)) {
          missing.push(`.cursor/hooks.json#${hookName}:${entry.command}`);
          issues.push({
            kind: "error",
            message: `Missing managed hook entry: ${hookName}:${entry.command}`,
          });
        }
      }
    }
  } catch (error) {
    issues.push({
      kind: "error",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  for (const managedPath of manifest.managedPaths) {
    let resolvedPath: string;
    try {
      resolvedPath = resolveValidatedCursorManagedPath(homeDir, managedPath);
    } catch (error) {
      issues.push({
        kind: "error",
        message: error instanceof Error ? error.message : String(error),
      });
      continue;
    }

    if (!existsSync(resolvedPath)) {
      missing.push(managedPath);
      issues.push({
        kind: "error",
        message: `Managed path missing from global install: ${managedPath}`,
      });
    }
  }

  const ok = !issues.some((issue) => issue.kind === "error");
  return { ok, issues, checkedFiles, missing, mismatched, unexpected };
}

export function uninstallCursorGlobalAdapter(options: { homeDir: string }): void {
  const manifest = loadGlobalManifest({
    host: "cursor",
    homeDir: options.homeDir,
  });
  if (manifest) {
    for (const managedPath of manifest.managedPaths) {
      rmSync(resolveValidatedCursorManagedPath(options.homeDir, managedPath), {
        recursive: true,
        force: true,
      });
    }
  }

  removeCursorGlobalMcpFile({
    filePath: getCursorGlobalMcpPath(options.homeDir),
    serverNames: Object.keys(CURSOR_GLOBAL_MCP_SERVERS),
  });
  removeCursorGlobalHooksFile({
    filePath: getCursorGlobalHooksPath(options.homeDir),
    hooks: CURSOR_GLOBAL_HOOKS,
  });
  deleteGlobalManifest({
    host: "cursor",
    homeDir: options.homeDir,
  });
}
