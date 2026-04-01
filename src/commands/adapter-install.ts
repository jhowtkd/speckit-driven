import { installCursorAdapter } from "../core/adapters/cursor";
import { installCodexAdapter } from "../core/adapters/codex";

export function runAdapterInstall(
  cwd: string,
  adapter: string,
  opts: { force: boolean; allowAnywhere: boolean }
): void {
  try {
    if (adapter === "cursor") {
      const result = installCursorAdapter({
        cwd,
        force: opts.force,
        allowAnywhere: opts.allowAnywhere,
      });

      console.log("elf adapter install cursor");
      console.log(`Kit version: ${result.kitVersion}`);
      console.log(`Target: ${result.targetDir}`);
      if (result.report.created.length) {
        console.log("\nCreated (.cursor):");
        for (const f of result.report.created) console.log(`  + ${f}`);
      }
      if (result.report.updated.length) {
        console.log("\nUpdated (.cursor, --force):");
        for (const f of result.report.updated) console.log(`  ~ ${f}`);
      }
      if (result.report.skipped.length) {
        console.log("\nSkipped (.cursor, already exists; use --force to overwrite):");
        for (const f of result.report.skipped) console.log(`  = ${f}`);
      }
      if (result.removedLegacy.length) {
        console.log("\nRemoved legacy (.cursor, migration cleanup):");
        for (const f of result.removedLegacy) console.log(`  - ${f}`);
      }

      console.log("\n✅ Wrote .cursor/spec-driven-kit.json");
      console.log("\nNext steps:");
      console.log("  Run `elf init` if the runtime is not bootstrapped yet.");
      console.log("  Use `elf run` to start a workflow run after init.");
      console.log("  Start the MCP bridge with `elf mcp serve` for Cursor integration.");
      return;
    }

    if (adapter === "codex") {
      const result = installCodexAdapter({
        cwd,
        force: opts.force,
        allowAnywhere: opts.allowAnywhere,
      });

      console.log("elf adapter install codex");
      console.log(`Kit version: ${result.kitVersion}`);
      console.log("Targets: .agents/skills, codex/rules, .codex/agents, .codex/hooks.json");
      if (result.report.created.length) {
        console.log("\nCreated:");
        for (const f of result.report.created) console.log(`  + ${f}`);
      }
      if (result.report.updated.length) {
        console.log("\nUpdated:");
        for (const f of result.report.updated) console.log(`  ~ ${f}`);
      }
      if (result.report.skipped.length) {
        console.log("\nSkipped (already exists; use --force to overwrite):");
        for (const f of result.report.skipped) console.log(`  = ${f}`);
      }
      console.log("\n✅ Wrote Codex adapter bundle");
      console.log("\nNext steps:");
      console.log("  Run `elf init` if the runtime is not bootstrapped yet.");
      console.log("  Use `elf run` or `elf review` to drive Codex through ELF.");
      console.log("  Start the MCP bridge with `elf mcp serve` for local runtime access.");
      return;
    }

    console.error(`elf adapter install: unknown adapter "${adapter}"`);
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
