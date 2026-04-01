import { homedir } from "os";
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

function resolveHomeDir(homeDir?: string): string {
  return homeDir ?? homedir();
}

export function getCodexGlobalDir(homeDir?: string): string {
  return join(resolveHomeDir(homeDir), ".codex");
}

export function getCodexGlobalManifestPath(homeDir?: string): string {
  return join(getCodexGlobalDir(homeDir), ".elf-global.json");
}

export function getCodexGlobalRulesDir(homeDir?: string): string {
  return join(getCodexGlobalDir(homeDir), "rules");
}

export function getCodexGlobalSkillsDir(homeDir?: string): string {
  return join(getCodexGlobalDir(homeDir), "skills");
}

export function getCodexGlobalAgentsDir(homeDir?: string): string {
  return join(getCodexGlobalDir(homeDir), "agents");
}

export function getCursorGlobalDir(homeDir?: string): string {
  return join(resolveHomeDir(homeDir), ".cursor");
}

export function getCursorGlobalManifestPath(homeDir?: string): string {
  return join(getCursorGlobalDir(homeDir), ".elf-global.json");
}

export function getCursorGlobalRulesDir(homeDir?: string): string {
  return join(getCursorGlobalDir(homeDir), "rules");
}

export function getCursorGlobalMcpPath(homeDir?: string): string {
  return join(getCursorGlobalDir(homeDir), "mcp.json");
}

export function getCursorGlobalHooksPath(homeDir?: string): string {
  return join(getCursorGlobalDir(homeDir), "hooks.json");
}
