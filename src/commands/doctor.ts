import { runRuntimeDoctor } from "../core/runtime/doctor";

export function runDoctorCmd(cwd: string, opts: { strict: boolean }): void {
  const report = runRuntimeDoctor({
    cwd,
    strictContent: opts.strict,
  });

  console.log("elf doctor");
  console.log(
    `Checked ${report.checkedFiles} path(s) (.elf/) against bundled runtime`
  );
  if (report.missing.length) {
    console.log("\nMissing:");
    for (const path of report.missing) console.log(`  - ${path}`);
  }
  if (report.mismatched.length) {
    console.log(
      opts.strict
        ? "\nDrift (strict — treated as failure):"
        : "\nDrift (warnings only; use --strict to fail on mismatch):"
    );
    for (const path of report.mismatched) console.log(`  ~ ${path}`);
  }
  if (report.issues.length) {
    console.log("\nIssues:");
    for (const issue of report.issues) {
      const tag = issue.kind === "error" ? "ERROR" : "WARN ";
      console.log(`  [${tag}] ${issue.message}`);
    }
  } else {
    console.log("\n✅ No issues reported.");
  }

  if (report.missing.length > 0) {
    console.log("\n💡 Action required: Run 'elf init' to restore missing runtime files.");
  }

  console.log(report.ok ? "\nResult: OK" : "\nResult: FAILED");
  process.exit(report.ok ? 0 : 1);
}
