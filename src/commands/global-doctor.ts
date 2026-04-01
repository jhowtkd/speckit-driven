import { homedir } from "os";
import { existsSync } from "fs";
import { join } from "path";
import { doctorCodexGlobalAdapter } from "../core/adapters/codex";
import { doctorCursorGlobalAdapter } from "../core/adapters/cursor";

function hasLocalCursorAdapter(cwd: string): boolean {
  return existsSync(join(cwd, ".cursor", "rules", "00-using-elf.mdc"));
}

function hasLocalCodexAdapter(cwd: string): boolean {
  return (
    existsSync(join(cwd, ".agents", "skills", "elf-run", "SKILL.md")) ||
    existsSync(join(cwd, "codex", "rules", "default.rules")) ||
    existsSync(join(cwd, ".codex", "agents", "verifier.toml"))
  );
}

function printCursorGlobalDoctor(homeDir: string, strict: boolean): boolean {
  const report = doctorCursorGlobalAdapter({
    homeDir,
    strictContent: strict,
  });

  console.log("elf global doctor cursor");
  console.log(
    `Checked ${report.checkedFiles} path(s) (~/.cursor/) against the managed global Cursor adapter`
  );
  if (report.missing.length) {
    console.log("\nMissing:");
    for (const path of report.missing) console.log(`  - ${path}`);
  }
  if (report.mismatched.length) {
    console.log(
      strict
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

  if (hasLocalCursorAdapter(process.cwd())) {
    console.log(
      "\nNote: a project-local Cursor adapter is also present in the current working directory."
    );
  }

  console.log(report.ok ? "\nResult: OK" : "\nResult: FAILED");
  return report.ok;
}

function printCodexGlobalDoctor(homeDir: string, strict: boolean): boolean {
  const report = doctorCodexGlobalAdapter({
    homeDir,
    strictContent: strict,
  });

  console.log("elf global doctor codex");
  console.log(
    `Checked ${report.checkedFiles} path(s) (~/.codex/) against the managed global Codex adapter`
  );
  if (report.missing.length) {
    console.log("\nMissing:");
    for (const path of report.missing) console.log(`  - ${path}`);
  }
  if (report.mismatched.length) {
    console.log(
      strict
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

  if (hasLocalCodexAdapter(process.cwd())) {
    console.log(
      "\nNote: a project-local Codex adapter is also present in the current working directory."
    );
  }

  console.log(report.ok ? "\nResult: OK" : "\nResult: FAILED");
  return report.ok;
}

export function runGlobalDoctor(
  host: string,
  opts: { strict: boolean }
): void {
  const homeDir = homedir();

  if (host === "all") {
    const codexOk = printCodexGlobalDoctor(homeDir, opts.strict);
    console.log("");
    const cursorOk = printCursorGlobalDoctor(homeDir, opts.strict);
    process.exit(codexOk && cursorOk ? 0 : 1);
  }

  if (host === "cursor") {
    process.exit(printCursorGlobalDoctor(homeDir, opts.strict) ? 0 : 1);
  }

  if (host === "codex") {
    process.exit(printCodexGlobalDoctor(homeDir, opts.strict) ? 0 : 1);
  }

  console.error(`elf global doctor: unknown host "${host}"`);
  process.exit(1);
}
