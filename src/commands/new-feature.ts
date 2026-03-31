import { scaffoldFeature } from "../core/feature-scaffold";
import { getAssetsCursorDir } from "../core/paths";

export function runNewFeature(cwd: string, rawName: string): void {
  const assetsCursorDir = getAssetsCursorDir();
  try {
    const { featureId, featureDir, files } = scaffoldFeature({
      cwd,
      rawName,
      assetsCursorDir,
    });
    console.log("spec-driven-kit new feature");
    console.log(`Feature ID: ${featureId}`);
    console.log(`Folder: ${featureDir}`);
    console.log("\nFiles:");
    for (const f of files) console.log(`  ${f}`);
    console.log("\nNext steps:");
    console.log("  1. Fill spec.md -> plan.md -> tasks.md");
    console.log("  2. Execute tasks following prompts in .cursor/prompts/");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`spec-driven-kit: ${msg}`);
    process.exit(1);
  }
}
