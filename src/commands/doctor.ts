import { runDoctor } from "../core/doctor-check";
import { getAgentsTemplatePath, getAssetsCursorDir } from "../core/paths";

export function runDoctorCmd(cwd: string, opts: { strict: boolean }): void {
  const assetsCursorDir = getAssetsCursorDir();
  const report = runDoctor({
    cwd,
    assetsCursorDir,
    agentsTemplatePath: getAgentsTemplatePath(),
    strictContent: opts.strict,
  });

  console.log("spec-driven-kit doctor");
  console.log(
    `Checked ${report.checkedFiles} path(s) (.cursor/ + AGENTS.md) against bundled kit`
  );
  if (report.missing.length) {
    console.log("\nMissing:");
    for (const m of report.missing) console.log(`  - ${m}`);
  }
  if (report.mismatched.length) {
    console.log(
      opts.strict
        ? "\nDrift (strict — treated as failure):"
        : "\nDrift (warnings only; use --strict to fail on mismatch):"
    );
    for (const m of report.mismatched) console.log(`  ~ ${m}`);
  }
  if (report.issues.length) {
    console.log("\nIssues:");
    for (const i of report.issues) {
      const tag = i.kind === "error" ? "ERROR" : "WARN ";
      console.log(`  [${tag}] ${i.message}`);
    }
  } else {
    console.log("\n✅ No issues reported.");
  }

  if (report.missing.length > 0) {
    console.log("\n💡 Action required: Run 'npx spec-driven-kit update' to restore missing files.");
  }

  console.log(report.ok ? "\nResult: OK" : "\nResult: FAILED");
  process.exit(report.ok ? 0 : 1);
}
