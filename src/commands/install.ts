import { existsSync } from "fs";
import { join } from "path";
import { installKitFiles } from "../core/install-files";
import { installAgentsMd } from "../core/install-agents";
import { writeKitMeta } from "../core/update-assets";
import {
  getAgentsTemplatePath,
  getAssetsCursorDir,
  getPackageRoot,
} from "../core/paths";
import { readKitVersion } from "../core/versioning";

export function runInstall(
  cwd: string,
  opts: { force: boolean; allowAnywhere: boolean }
): void {
  if (!opts.allowAnywhere) {
    const hasGit = existsSync(join(cwd, ".git"));
    const hasPkg = existsSync(join(cwd, "package.json"));
    if (!hasGit && !hasPkg) {
      console.error(
        "spec-driven-kit: no .git or package.json in the current directory."
      );
      console.error("Run from a project root, or pass --allow-anywhere.");
      process.exit(1);
    }
  }

  const packageRoot = getPackageRoot();
  const assetsCursorDir = getAssetsCursorDir();
  if (!existsSync(assetsCursorDir)) {
    console.error(`spec-driven-kit: bundled assets missing at ${assetsCursorDir}`);
    process.exit(1);
  }

  const targetCursorDir = join(cwd, ".cursor");
  const report = installKitFiles({
    assetsCursorDir,
    targetCursorDir,
    force: opts.force,
  });

  const agentsTemplatePath = getAgentsTemplatePath();
  const agentsResult = installAgentsMd({
    agentsTemplatePath,
    cwd,
    force: opts.force,
  });
  if ("error" in agentsResult) {
    console.error(`spec-driven-kit: ${agentsResult.error}`);
    process.exit(1);
  }

  const kitVersion = readKitVersion(packageRoot);
  writeKitMeta(targetCursorDir, kitVersion);

  console.log("spec-driven-kit install");
  console.log(`Kit version: ${kitVersion}`);
  console.log(`Target: ${targetCursorDir}, ${join(cwd, "AGENTS.md")}`);
  if (report.created.length) {
    console.log("\nCreated (.cursor):");
    for (const f of report.created) console.log(`  + ${f}`);
  }
  if (report.updated.length) {
    console.log("\nUpdated (.cursor, --force):");
    for (const f of report.updated) console.log(`  ~ ${f}`);
  }
  if (report.skipped.length) {
    console.log("\nSkipped (.cursor, already exists; use --force to overwrite):");
    for (const f of report.skipped) console.log(`  = ${f}`);
  }

  const ar = agentsResult;
  if (ar.action === "created") {
    console.log("\nCreated (root):");
    console.log(`  + ${ar.destRel}`);
  } else if (ar.action === "updated") {
    console.log("\nUpdated (root, --force):");
    console.log(`  ~ ${ar.destRel}`);
  } else {
    console.log("\nSkipped (root, AGENTS.md exists; use --force to overwrite):");
    console.log(`  = ${ar.destRel}`);
  }

  console.log("\n✅ Wrote .cursor/spec-driven-kit.json");
  console.log("\nNext steps:");
  console.log("  Use .cursor/rules and AGENTS.md; optional: .cursor/commands (beta)");
  console.log("  npx spec-driven-kit doctor");
}
