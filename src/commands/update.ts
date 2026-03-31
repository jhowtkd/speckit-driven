import { existsSync } from "fs";
import { join } from "path";
import { updateKitFiles, writeKitMeta } from "../core/update-assets";
import { getAssetsCursorDir, getPackageRoot } from "../core/paths";
import { readKitVersion } from "../core/versioning";

export function runUpdate(cwd: string, opts: { force: boolean }): void {
  const targetCursorDir = join(cwd, ".cursor");
  if (!existsSync(targetCursorDir)) {
    console.error('spec-driven-kit: .cursor/ not found. Run "spec-driven-kit init" first.');
    process.exit(1);
  }

  const assetsCursorDir = getAssetsCursorDir();
  const report = updateKitFiles({
    assetsCursorDir,
    targetCursorDir,
    force: opts.force,
  });

  const packageRoot = getPackageRoot();
  const kitVersion = readKitVersion(packageRoot);
  writeKitMeta(targetCursorDir, kitVersion);

  console.log("spec-driven-kit update");
  console.log(`Kit version: ${kitVersion}`);
  if (report.created.length) {
    console.log("\nCreated:");
    for (const f of report.created) console.log(`  + ${f}`);
  }
  if (report.updated.length) {
    console.log("\nUpdated:");
    for (const f of report.updated) console.log(`  ~ ${f}`);
  }
  if (report.identical.length) {
    console.log(`\nUnchanged (identical): ${report.identical.length} file(s)`);
  }
  if (report.divergedSkipped.length) {
    console.log("\nDiverged (skipped):");
    for (const f of report.divergedSkipped) console.log(`  ! ${f}`);
    console.log("\n💡 Use --force to overwrite diverged files.");
  }
  
  console.log("\n✅ Refreshed .cursor/spec-driven-kit.json");
  
  console.log("\nSummary:");
  console.log(`  Created: ${report.created.length}`);
  console.log(`  Updated: ${report.updated.length}`);
  console.log(`  Identical (ignored): ${report.identical.length}`);
  console.log(`  Diverged (skipped): ${report.divergedSkipped.length}`);
}
