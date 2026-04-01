import { existsSync } from "fs";
import { join } from "path";
import { fileBuffersEqual, listFilesRecursive } from "../fs-utils";
import {
  getAssetsElfDir,
  getAssetsElfTemplatesDir,
  getAssetsElfWorkflowsDir,
} from "../paths";
import { readInstalledRuntimeMeta, type RuntimeMeta } from "../versioning";
import type { DoctorIssue } from "../doctor-check";

export type RuntimeDoctorReport = {
  ok: boolean;
  issues: DoctorIssue[];
  checkedFiles: number;
  missing: string[];
  mismatched: string[];
};

function pushMissing(
  issues: DoctorIssue[],
  missing: string[],
  message: string,
  pathLabel: string
): void {
  missing.push(pathLabel);
  issues.push({ kind: "error", message });
}

function pushMismatch(
  issues: DoctorIssue[],
  mismatched: string[],
  message: string,
  pathLabel: string,
  strictContent: boolean
): void {
  mismatched.push(pathLabel);
  issues.push({ kind: strictContent ? "error" : "warn", message });
}

export function runRuntimeDoctor(options: {
  cwd: string;
  strictContent: boolean;
}): RuntimeDoctorReport {
  const { cwd, strictContent } = options;
  const issues: DoctorIssue[] = [];
  const missing: string[] = [];
  const mismatched: string[] = [];
  const runtimeDir = join(cwd, ".elf");

  if (!existsSync(runtimeDir)) {
    issues.push({
      kind: "error",
      message: "Missing .elf/ — run elf init",
    });
    return { ok: false, issues, checkedFiles: 0, missing, mismatched };
  }

  let checkedFiles = 0;
  const bundleRoot = getAssetsElfDir();

  const configSrc = join(bundleRoot, "config.toml");
  const configDest = join(runtimeDir, "config.toml");
  checkedFiles += 1;
  if (!existsSync(configDest)) {
    pushMissing(
      issues,
      missing,
      "Missing .elf/config.toml — run elf init",
      ".elf/config.toml"
    );
  } else if (!fileBuffersEqual(configSrc, configDest)) {
    pushMismatch(
      issues,
      mismatched,
      "Content differs from bundled runtime config: .elf/config.toml",
      ".elf/config.toml",
      strictContent
    );
  }

  const bundledWorkflowFiles = listFilesRecursive(getAssetsElfWorkflowsDir());
  for (const rel of bundledWorkflowFiles) {
    checkedFiles += 1;
    const src = join(getAssetsElfWorkflowsDir(), rel);
    const dest = join(runtimeDir, "workflows", rel);
    if (!existsSync(dest)) {
      pushMissing(
        issues,
        missing,
        `Missing runtime workflow definition: .elf/workflows/${rel}`,
        `.elf/workflows/${rel}`
      );
    } else if (!fileBuffersEqual(src, dest)) {
      pushMismatch(
        issues,
        mismatched,
        `Content differs from bundled workflow definition: .elf/workflows/${rel}`,
        `.elf/workflows/${rel}`,
        strictContent
      );
    }
  }

  const bundledTemplateFiles = listFilesRecursive(getAssetsElfTemplatesDir());
  for (const rel of bundledTemplateFiles) {
    checkedFiles += 1;
    const src = join(getAssetsElfTemplatesDir(), rel);
    const dest = join(runtimeDir, "templates", rel);
    if (!existsSync(dest)) {
      pushMissing(
        issues,
        missing,
        `Missing runtime template: .elf/templates/${rel}`,
        `.elf/templates/${rel}`
      );
    } else if (!fileBuffersEqual(src, dest)) {
      pushMismatch(
        issues,
        mismatched,
        `Content differs from bundled runtime template: .elf/templates/${rel}`,
        `.elf/templates/${rel}`,
        strictContent
      );
    }
  }

  checkedFiles += 1;
  const runtimeMetaPath = join(runtimeDir, "state", "metadata.json");
  const runtimeMeta = readInstalledRuntimeMeta(join(runtimeDir, "state"));
  if (!existsSync(runtimeMetaPath) || !runtimeMeta) {
    pushMissing(
      issues,
      missing,
      "Missing or invalid .elf/state/metadata.json — run elf init",
      ".elf/state/metadata.json"
    );
  } else {
    const metaShape: RuntimeMeta = runtimeMeta;
    if (
      metaShape.schemaVersion !== 1 ||
      metaShape.runtime !== "elf" ||
      typeof metaShape.version !== "string"
    ) {
      issues.push({
        kind: "error",
        message: "Invalid runtime metadata in .elf/state/metadata.json",
      });
    }
  }

  const ok = !issues.some((issue) => issue.kind === "error");
  return { ok, issues, checkedFiles, missing, mismatched };
}
