import test from "node:test";
import assert from "node:assert/strict";
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
