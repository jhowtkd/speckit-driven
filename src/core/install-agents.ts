import { copyFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";

export type InstallAgentsReport = {
  destRel: string;
  action: "created" | "updated" | "skipped";
};

/**
 * Copies bundled agents/AGENTS.md to the target repo root as ./AGENTS.md.
 * Same semantics as kit file install: skip if exists and !force.
 */
export function installAgentsMd(options: {
  agentsTemplatePath: string;
  cwd: string;
  force: boolean;
}): InstallAgentsReport | { error: string } {
  const { agentsTemplatePath, cwd, force } = options;
  if (!existsSync(agentsTemplatePath)) {
    return { error: `Missing agents template at ${agentsTemplatePath}` };
  }
  const dest = join(cwd, "AGENTS.md");
  const destRel = "AGENTS.md";

  if (existsSync(dest)) {
    if (force) {
      copyFileSync(agentsTemplatePath, dest);
      return { destRel, action: "updated" };
    }
    return { destRel, action: "skipped" };
  }
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(agentsTemplatePath, dest);
  return { destRel, action: "created" };
}

function agentsBuffersEqual(a: string, b: string): boolean {
  return readFileSync(a).equals(readFileSync(b));
}

/** Same semantics as updateKitFiles for the single AGENTS.md at repo root. */
export function updateAgentsMd(options: {
  agentsTemplatePath: string;
  cwd: string;
  force: boolean;
}): {
  created: boolean;
  updated: boolean;
  identical: boolean;
  divergedSkipped: boolean;
} {
  const { agentsTemplatePath, cwd, force } = options;
  const dest = join(cwd, "AGENTS.md");
  if (!existsSync(dest)) {
    const r = installAgentsMd({ agentsTemplatePath, cwd, force: true });
    if ("error" in r) {
      return {
        created: false,
        updated: false,
        identical: false,
        divergedSkipped: false,
      };
    }
    return {
      created: r.action === "created" || r.action === "updated",
      updated: false,
      identical: false,
      divergedSkipped: false,
    };
  }
  if (agentsBuffersEqual(agentsTemplatePath, dest)) {
    return {
      created: false,
      updated: false,
      identical: true,
      divergedSkipped: false,
    };
  }
  if (force) {
    copyFileSync(agentsTemplatePath, dest);
    return {
      created: false,
      updated: true,
      identical: false,
      divergedSkipped: false,
    };
  }
  return {
    created: false,
    updated: false,
    identical: false,
    divergedSkipped: true,
  };
}
