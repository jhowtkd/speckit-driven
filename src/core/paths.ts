import { join } from "path";

/** Package root (contains package.json, assets/, dist/). Resolves from `dist/core`. */
export function getPackageRoot(): string {
  return join(__dirname, "..", "..");
}

export function getAssetsCursorDir(): string {
  return join(getPackageRoot(), "assets", "cursor");
}

export function getAssetsElfDir(): string {
  return join(getPackageRoot(), "assets", "elf");
}

export function getAssetsElfWorkflowsDir(): string {
  return join(getAssetsElfDir(), "workflows");
}

export function getAssetsElfTemplatesDir(): string {
  return join(getAssetsElfDir(), "templates");
}

/** Canonical AGENTS.md template shipped with the package. */
export function getAgentsTemplatePath(): string {
  return join(getPackageRoot(), "agents", "AGENTS.md");
}
