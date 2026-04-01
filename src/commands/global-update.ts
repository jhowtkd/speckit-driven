import { homedir } from "os";
import { updateCodexGlobalAdapter } from "../core/adapters/codex";
import { updateCursorGlobalAdapter } from "../core/adapters/cursor";

export function runGlobalUpdate(
  host: string,
  opts: { force: boolean }
): void {
  try {
    const homeDir = homedir();

    if (host === "codex") {
      const result = updateCodexGlobalAdapter({
        homeDir,
        force: opts.force,
      });

      console.log("elf global update codex");
      console.log(`Kit version: ${result.kitVersion}`);
      console.log("\n✅ Refreshed global Codex adapter bundle");
      return;
    }

    if (host === "cursor") {
      const result = updateCursorGlobalAdapter({
        homeDir,
        force: opts.force,
      });

      console.log("elf global update cursor");
      console.log(`Kit version: ${result.kitVersion}`);
      console.log("\n✅ Refreshed global Cursor adapter bundle");
      return;
    }

    if (host === "all") {
      runGlobalUpdate("codex", opts);
      console.log("");
      runGlobalUpdate("cursor", opts);
      return;
    }

    console.error(`elf global update: unknown host "${host}"`);
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
