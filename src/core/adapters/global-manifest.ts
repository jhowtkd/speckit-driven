import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { dirname } from "path";
import {
  getCodexGlobalManifestPath,
  getCursorGlobalManifestPath,
} from "../paths";

export type GlobalInstallHost = "codex" | "cursor";

export type GlobalInstallManifest = {
  schemaVersion: number;
  host: GlobalInstallHost;
  elfVersion: string;
  managedPaths: string[];
  managedEntries?: Record<string, string[]>;
  installedAt: string;
  updatedAt?: string;
};

function getManifestPath(host: GlobalInstallHost, homeDir?: string): string {
  return host === "codex"
    ? getCodexGlobalManifestPath(homeDir)
    : getCursorGlobalManifestPath(homeDir);
}

export function loadGlobalManifest(options: {
  host: GlobalInstallHost;
  homeDir?: string;
}): GlobalInstallManifest | null {
  const manifestPath = getManifestPath(options.host, options.homeDir);
  if (!existsSync(manifestPath)) {
    return null;
  }

  return JSON.parse(readFileSync(manifestPath, "utf8")) as GlobalInstallManifest;
}

export function writeGlobalManifest(options: {
  host: GlobalInstallHost;
  homeDir?: string;
  manifest: GlobalInstallManifest;
}): void {
  const manifestPath = getManifestPath(options.host, options.homeDir);
  mkdirSync(dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(options.manifest, null, 2) + "\n");
}

export function deleteGlobalManifest(options: {
  host: GlobalInstallHost;
  homeDir?: string;
}): void {
  const manifestPath = getManifestPath(options.host, options.homeDir);
  if (!existsSync(manifestPath)) {
    return;
  }
  rmSync(manifestPath, { force: true });
}
