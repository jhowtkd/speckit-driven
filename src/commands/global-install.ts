import { homedir } from "os";
import { installCodexGlobalAdapter } from "../core/adapters/codex";
import { installCursorGlobalAdapter } from "../core/adapters/cursor";

export function runGlobalInstall(
  host: string,
  opts: { force: boolean }
): void {
  try {
    const homeDir = homedir();

    if (host === "codex") {
      const result = installCodexGlobalAdapter({
        homeDir,
        force: opts.force,
      });

      console.log("elf global install codex");
      console.log(`Kit version: ${result.kitVersion}`);
      console.log(`Target: ${homeDir}/.codex`);
      console.log("\n✅ Wrote global Codex adapter bundle");
      return;
    }

    if (host === "cursor") {
      const result = installCursorGlobalAdapter({
        homeDir,
        force: opts.force,
      });

      console.log("elf global install cursor");
      console.log(`Kit version: ${result.kitVersion}`);
      console.log(`Target: ${homeDir}/.cursor`);
      console.log("\n✅ Wrote global Cursor adapter bundle");
      return;
    }

    if (host === "all") {
      runGlobalInstall("codex", opts);
      console.log("");
      runGlobalInstall("cursor", opts);
      return;
    }

    console.error(`elf global install: unknown host "${host}"`);
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
