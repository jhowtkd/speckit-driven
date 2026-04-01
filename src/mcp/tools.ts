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
      name: "elf_phase_start",
      description: "Start a real phase workflow in the ELF runtime.",
      inputSchema: {
        type: "object",
        properties: {
          title: { type: "string" },
        },
        required: ["title"],
      },
    },
    {
      name: "elf_phase_research",
      description: "Advance a phase workflow into the research step.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "elf_phase_plan",
      description: "Advance a phase workflow into the plan step.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "elf_phase_execute",
      description: "Advance a phase workflow into the execute step.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "elf_phase_verify",
      description: "Advance a phase workflow through verification.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "elf_phase_close",
      description: "Close a verified phase workflow.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
      },
    },
    {
      name: "elf_phase_status",
      description: "Report the current step of a phase workflow.",
      inputSchema: {
        type: "object",
        properties: {
          runId: { type: "string" },
        },
        required: ["runId"],
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
