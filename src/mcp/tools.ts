export type ElfMcpTool = {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
};

export function buildElfMcpTools(): ElfMcpTool[] {
  return [
    {
      name: "elf_run",
      description: "Start a new ELF workflow run.",
      inputSchema: {
        type: "object",
        properties: {
          workflow: { type: "string" },
          title: { type: "string" },
        },
        required: ["workflow", "title"],
      },
    },
    {
      name: "elf_resume",
      description: "Resume an existing ELF run by id.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "elf_verify",
      description: "Verify a run and store the verifier result.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "elf_review",
      description: "Generate a review scaffold for a path or run id.",
      inputSchema: {
        type: "object",
        properties: {
          target: { type: "string" },
        },
        required: ["target"],
      },
    },
    {
      name: "elf_status",
      description: "Report the current ELF runtime status.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ];
}
