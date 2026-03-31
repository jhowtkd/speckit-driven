import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join, relative } from "path";
import { listFilesRecursive, readUtf8 } from "./fs-utils";

export type UpdateReport = {
  created: string[];
  updated: string[];
  identical: string[];
  divergedSkipped: string[];
};

function buffersEqual(aPath: string, bPath: string): boolean {
  return readFileSync(aPath).equals(readFileSync(bPath));
}

/**
 * Update: install missing files; if file exists and matches bundle, skip;
 * if exists and differs, skip unless force (then overwrite).
 */
export function updateKitFiles(options: {
  assetsCursorDir: string;
  targetCursorDir: string;
  force: boolean;
}): UpdateReport {
  const { assetsCursorDir, targetCursorDir, force } = options;
  const created: string[] = [];
  const updated: string[] = [];
  const identical: string[] = [];
  const divergedSkipped: string[] = [];

  const relPaths = listFilesRecursive(assetsCursorDir);
  for (const rel of relPaths) {
    const src = join(assetsCursorDir, rel);
    const dest = join(targetCursorDir, rel);
    const destRel = relative(targetCursorDir, dest).split("\\").join("/");

    mkdirSync(join(dest, ".."), { recursive: true });

    if (!existsSync(dest)) {
      copyFileSync(src, dest);
      created.push(destRel);
      continue;
    }

    if (buffersEqual(src, dest)) {
      identical.push(destRel);
      continue;
    }

    if (force) {
      copyFileSync(src, dest);
      updated.push(destRel);
    } else {
      divergedSkipped.push(destRel);
    }
  }

  return { created, updated, identical, divergedSkipped };
}

/** Writes or refreshes kit metadata under `.cursor/`. */
export function writeKitMeta(cursorDir: string, kitVersion: string): void {
  const p = join(cursorDir, "spec-driven-kit.json");
  let installedAt = new Date().toISOString();
  if (existsSync(p)) {
    try {
      const prev = JSON.parse(readUtf8(p)) as { installedAt?: string };
      if (prev.installedAt) installedAt = prev.installedAt;
    } catch {
      /* keep new */
    }
  }
  const body = {
    schemaVersion: 1,
    kitVersion,
    installMode: process.env.npm_execpath ? "npm/npx" : "local",
    installedAt,
    lastKitUpdate: new Date().toISOString(),
  };
  mkdirSync(cursorDir, { recursive: true });
  writeFileSync(p, JSON.stringify(body, null, 2) + "\n", "utf8");
}
