import { getPackageRoot } from "../core/paths";
import {
  bootstrapElfProject,
  type RuntimeBootstrapReport,
} from "../core/runtime/project-bootstrap";

export function runInit(cwd: string, opts: { force: boolean; allowAnywhere: boolean }): void {
  let report: RuntimeBootstrapReport;
  try {
    report = bootstrapElfProject({
      cwd,
      force: opts.force,
      allowAnywhere: opts.allowAnywhere,
      packageRoot: getPackageRoot(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }

  console.log("elf init");
  console.log(`Target: ${report.runtimeDir}, ${report.stateMetaPath}`);
  if (report.bundleReport.created.length) {
    console.log("\nCreated (.elf):");
    for (const f of report.bundleReport.created) console.log(`  + ${f}`);
  }
  if (report.bundleReport.updated.length) {
    console.log("\nUpdated (.elf, --force):");
    for (const f of report.bundleReport.updated) console.log(`  ~ ${f}`);
  }
  if (report.bundleReport.skipped.length) {
    console.log("\nSkipped (.elf, already exists; use --force to overwrite):");
    for (const f of report.bundleReport.skipped) console.log(`  = ${f}`);
  }
  console.log("\nAGENTS.md (root):");
  console.log(`  ${report.agentsAction === "created" ? "+" : report.agentsAction === "updated" ? "~" : "="} ${report.agentsAction}`);
  console.log("\n✅ Wrote .elf/config.toml");
  console.log("\nNext steps:");
  console.log("  Use elf run / elf resume / elf verify for runtime operations");
}
