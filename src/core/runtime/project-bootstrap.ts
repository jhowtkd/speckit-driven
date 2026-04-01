import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { installBundleFiles } from "../install-files";
import { installAgentsMd } from "../install-agents";
import { getAgentsTemplatePath, getAssetsElfDir } from "../paths";
import { readKitVersion } from "../versioning";
import { writeRuntimeMeta } from "../update-assets";

export type RuntimeBootstrapReport = {
  runtimeDir: string;
  configPath: string;
  stateMetaPath: string;
  bundleReport: {
    created: string[];
    updated: string[];
    skipped: string[];
  };
  agentsAction: "created" | "updated" | "skipped";
};

export function bootstrapElfProject(options: {
  cwd: string;
  force: boolean;
  allowAnywhere: boolean;
  packageRoot: string;
}): RuntimeBootstrapReport {
  const { cwd, force, allowAnywhere, packageRoot } = options;
  if (!allowAnywhere) {
    const hasGit = existsSync(join(cwd, ".git"));
    const hasPkg = existsSync(join(cwd, "package.json"));
    if (!hasGit && !hasPkg) {
      throw new Error(
        'elf init: no .git or package.json in the current directory. Run from a project root, or pass --allow-anywhere.'
      );
    }
  }

  const runtimeDir = join(cwd, ".elf");
  mkdirSync(runtimeDir, { recursive: true });

  const bundleReport = installBundleFiles({
    sourceDir: getAssetsElfDir(),
    targetDir: runtimeDir,
    force,
  });

  const agentsResult = installAgentsMd({
    agentsTemplatePath: getAgentsTemplatePath(),
    cwd,
    force,
  });
  if ("error" in agentsResult) {
    throw new Error(`elf init: ${agentsResult.error}`);
  }

  const kitVersion = readKitVersion(packageRoot);
  writeRuntimeMeta(join(runtimeDir, "state"), kitVersion);

  return {
    runtimeDir,
    configPath: join(runtimeDir, "config.toml"),
    stateMetaPath: join(runtimeDir, "state", "metadata.json"),
    bundleReport,
    agentsAction: agentsResult.action,
  };
}
