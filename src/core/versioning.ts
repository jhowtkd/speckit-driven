import { readFileSync, existsSync } from "fs";
import { join } from "path";

export function readKitVersion(packageRoot: string): string {
  const pkgPath = join(packageRoot, "package.json");
  if (!existsSync(pkgPath)) return "0.0.0";
  const raw = readFileSync(pkgPath, "utf8");
  try {
    const j = JSON.parse(raw) as { version?: string };
    return j.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

export type KitMeta = {
  kitVersion: string;
  installedAt: string;
  lastKitUpdate?: string;
};

export function readInstalledKitMeta(cursorDir: string): KitMeta | null {
  const p = join(cursorDir, "spec-driven-kit.json");
  if (!existsSync(p)) return null;
  try {
    const j = JSON.parse(readFileSync(p, "utf8")) as KitMeta;
    if (typeof j.kitVersion === "string" && typeof j.installedAt === "string") {
      return j;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export type RuntimeMeta = {
  schemaVersion: number;
  runtime: string;
  version: string;
  installedAt: string;
  lastUpdatedAt?: string;
};

export function readInstalledRuntimeMeta(stateDir: string): RuntimeMeta | null {
  const p = join(stateDir, "metadata.json");
  if (!existsSync(p)) return null;
  try {
    const j = JSON.parse(readFileSync(p, "utf8")) as RuntimeMeta;
    if (
      typeof j.schemaVersion === "number" &&
      typeof j.runtime === "string" &&
      typeof j.version === "string" &&
      typeof j.installedAt === "string"
    ) {
      return j;
    }
  } catch {
    /* ignore */
  }
  return null;
}
