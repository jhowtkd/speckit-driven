import { existsSync } from "fs";
import { join } from "path";
import { readElfRuntimeConfig, type ElfRuntimeConfig } from "./config";
import {
  getCurrentRunPath,
  getRuntimeDir,
  getStateDir,
} from "./artifact-store";
import { readInstalledRuntimeMeta, type RuntimeMeta } from "../versioning";

export type RuntimeContext = {
  cwd: string;
  runtimeDir: string;
  stateDir: string;
  config: ElfRuntimeConfig | null;
  runtimeMeta: RuntimeMeta | null;
  hasCurrentRun: boolean;
};

export function buildRuntimeContext(cwd: string): RuntimeContext {
  const runtimeDir = getRuntimeDir(cwd);
  const stateDir = getStateDir(cwd);
  const configPath = join(runtimeDir, "config.toml");
  return {
    cwd,
    runtimeDir,
    stateDir,
    config: existsSync(configPath) ? readElfRuntimeConfig(runtimeDir) : null,
    runtimeMeta: readInstalledRuntimeMeta(stateDir),
    hasCurrentRun: existsSync(getCurrentRunPath(cwd)),
  };
}
