import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join, relative } from "path";
import { listFilesRecursive } from "./fs-utils";

export type InstallReport = {
  created: string[];
  updated: string[];
  skipped: string[];
};

/**
 * Copies bundled assets into target `.cursor/`.
 * - Missing files → created
 * - Existing + force → updated
 * - Existing + !force → skipped
 */
export function installKitFiles(options: {
  assetsCursorDir: string;
  targetCursorDir: string;
  force: boolean;
}): InstallReport {
  const { assetsCursorDir, targetCursorDir, force } = options;
  const created: string[] = [];
  const updated: string[] = [];
  const skipped: string[] = [];

  const relPaths = listFilesRecursive(assetsCursorDir);
  for (const rel of relPaths) {
    const src = join(assetsCursorDir, rel);
    const dest = join(targetCursorDir, rel);
    const destRel = relative(targetCursorDir, dest).split("\\").join("/");

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
