import { doctorCursorAdapter } from "../core/adapters/cursor";
import { doctorCodexAdapter } from "../core/adapters/codex";

export function runAdapterDoctor(
  cwd: string,
  adapter: string,
  opts: { strict: boolean }
): void {
  if (adapter === "cursor") {
    const report = doctorCursorAdapter({
      cwd,
      strictContent: opts.strict,
    });

    console.log("elf adapter doctor cursor");
    console.log(
      `Checked ${report.checkedFiles} path(s) (.cursor/) against bundled Cursor adapter`
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
    if (report.unexpected.length) {
      console.log("\nUnexpected (legacy leftovers):");
      for (const path of report.unexpected) console.log(`  - ${path}`);
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

    console.log(report.ok ? "\nResult: OK" : "\nResult: FAILED");
    process.exit(report.ok ? 0 : 1);
  }

  if (adapter === "codex") {
    const report = doctorCodexAdapter({
      cwd,
      strictContent: opts.strict,
    });

    console.log("elf adapter doctor codex");
    console.log(
      `Checked ${report.checkedFiles} path(s) (.agents/, codex/, .codex/) against bundled Codex adapter`
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
    if (report.unexpected.length) {
      console.log("\nUnexpected:");
      for (const path of report.unexpected) console.log(`  - ${path}`);
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

    console.log(report.ok ? "\nResult: OK" : "\nResult: FAILED");
    process.exit(report.ok ? 0 : 1);
  }

  console.error(`elf adapter doctor: unknown adapter "${adapter}"`);
  process.exit(1);
}
