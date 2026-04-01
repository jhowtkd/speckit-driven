import { homedir } from "os";
import { uninstallCodexGlobalAdapter } from "../core/adapters/codex";
import { uninstallCursorGlobalAdapter } from "../core/adapters/cursor";

export function runGlobalUninstall(host: string): void {
  try {
    const homeDir = homedir();

    if (host === "codex") {
      uninstallCodexGlobalAdapter({ homeDir });
      console.log("elf global uninstall codex");
      console.log("\n✅ Removed global Codex adapter bundle");
      return;
    }

    if (host === "cursor") {
      uninstallCursorGlobalAdapter({ homeDir });
      console.log("elf global uninstall cursor");
      console.log("\n✅ Removed global Cursor adapter bundle");
      return;
    }

    if (host === "all") {
      runGlobalUninstall("codex");
      console.log("");
      runGlobalUninstall("cursor");
      return;
    }

    console.error(`elf global uninstall: unknown host "${host}"`);
    process.exit(1);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}
