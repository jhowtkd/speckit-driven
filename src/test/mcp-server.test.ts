import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "child_process";
import { join } from "path";
import { buildElfMcpTools } from "../mcp/tools";

test("buildElfMcpTools exposes the ELF bridge tool registry", () => {
  const tools = buildElfMcpTools();
  assert.deepStrictEqual(
    tools.map((tool) => tool.name),
    [
      "elf_run",
      "elf_resume",
      "elf_verify",
      "elf_review",
      "elf_status",
    ]
  );
});

test("elf mcp exposes a serve subcommand", () => {
  const root = join(__dirname, "..", "..");
  const elfBin = join(root, "bin", "elf.js");

  const result = spawnSync(process.execPath, [elfBin, "mcp", "--help"], {
    encoding: "utf8",
  });

  assert.strictEqual(result.status, 0, result.stderr ?? result.stdout);
  assert.match(result.stdout, /\bserve\b/);
});
