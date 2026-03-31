import { existsSync } from "fs";
import { join } from "path";
import { installKitFiles } from "../core/install-files";
import { writeKitMeta } from "../core/update-assets";
import { getAssetsCursorDir, getPackageRoot } from "../core/paths";
import { readKitVersion } from "../core/versioning";

export function runInit(
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

  const kitVersion = readKitVersion(packageRoot);
  writeKitMeta(targetCursorDir, kitVersion);

  console.log("spec-driven-kit init");
  console.log(`Kit version: ${kitVersion}`);
  console.log(`Target: ${targetCursorDir}`);
  if (report.created.length) {
    console.log("\nCreated:");
    for (const f of report.created) console.log(`  + ${f}`);
  }
  if (report.updated.length) {
    console.log("\nUpdated (--force):");
    for (const f of report.updated) console.log(`  ~ ${f}`);
  }
  if (report.skipped.length) {
    console.log("\nSkipped (already exists, use --force to overwrite):");
    for (const f of report.skipped) console.log(`  = ${f}`);
  }
  console.log("\n✅ Wrote .cursor/spec-driven-kit.json");
  console.log("\nNext steps:");
  console.log("  npx spec-driven-kit new feature <slug>");
  console.log("  npx spec-driven-kit doctor");
}
