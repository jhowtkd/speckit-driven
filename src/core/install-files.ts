import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join, relative } from "path";
import { listFilesRecursive } from "./fs-utils";

export type InstallReport = {
  created: string[];
  updated: string[];
  skipped: string[];
};

/**
 * Copies a bundled file tree into a target directory.
 * - Missing files → created
 * - Existing + force → updated
 * - Existing + !force → skipped
 */
export function installBundleFiles(options: {
  sourceDir: string;
  targetDir: string;
  force: boolean;
}): InstallReport {
  const { sourceDir, targetDir, force } = options;
  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  const relPaths = listFilesRecursive(sourceDir);
  for (const rel of relPaths) {
    const src = join(sourceDir, rel);
    const dest = join(targetDir, rel);
    const destRel = relative(targetDir, dest).split("\\").join("/");

    mkdirSync(join(dest, ".."), { recursive: true });

    if (existsSync(dest)) {
      if (force) {
        copyFileSync(src, dest);
        updated.push(destRel);
      } else {
        skipped.push(destRel);
      }
    } else {
      copyFileSync(src, dest);
      created.push(destRel);
    }
  }

  return { created, updated, skipped };
}

/**
 * Backwards-compatible wrapper for the Cursor bundle.
 */
export function installKitFiles(options: {
  assetsCursorDir: string;
  targetCursorDir: string;
  force: boolean;
}): InstallReport {
  return installBundleFiles({
    sourceDir: options.assetsCursorDir,
    targetDir: options.targetCursorDir,
    force: options.force,
  });
}
