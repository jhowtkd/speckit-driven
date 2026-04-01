import { updateCursorAdapter } from "../core/adapters/cursor";

export function runAdapterUpdate(
  cwd: string,
  adapter: string,
  opts: { force: boolean }
): void {
  if (adapter !== "cursor") {
    console.error(`elf adapter update: unknown adapter "${adapter}"`);
    process.exit(1);
  }

  try {
    const result = updateCursorAdapter({ cwd, force: opts.force });

    console.log("elf adapter update cursor");
    console.log(`Kit version: ${result.kitVersion}`);
    if (result.report.created.length) {
      console.log("\nCreated:");
      for (const f of result.report.created) console.log(`  + ${f}`);
    }
    if (result.report.updated.length) {
      console.log("\nUpdated:");
      for (const f of result.report.updated) console.log(`  ~ ${f}`);
    }
    if (result.report.identical.length) {
      console.log(`\nUnchanged (identical): ${result.report.identical.length} file(s)`);
    }
    if (result.report.divergedSkipped.length) {
      console.log("\nDiverged (skipped):");
      for (const f of result.report.divergedSkipped) console.log(`  ! ${f}`);
      console.log("\n💡 Use --force to overwrite diverged files.");
    }

    console.log("\n✅ Refreshed .cursor/spec-driven-kit.json");

    console.log("\nSummary (.cursor):");
    console.log(`  Created: ${result.report.created.length}`);
    console.log(`  Updated: ${result.report.updated.length}`);
    console.log(`  Identical (ignored): ${result.report.identical.length}`);
    console.log(`  Diverged (skipped): ${result.report.divergedSkipped.length}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
