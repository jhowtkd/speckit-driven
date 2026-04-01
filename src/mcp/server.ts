import { buildElfMcpTools } from "./tools";

type McpSdk = {
  Server?: new (...args: any[]) => any;
  StdioServerTransport?: new (...args: any[]) => any;
  ListToolsRequestSchema?: unknown;
  CallToolRequestSchema?: unknown;
  server?: {
    Server?: new (...args: any[]) => any;
    StdioServerTransport?: new (...args: any[]) => any;
    ListToolsRequestSchema?: unknown;
    CallToolRequestSchema?: unknown;
  };
  transport?: {
    StdioServerTransport?: new (...args: any[]) => any;
  };
  default?: McpSdk;
};

function loadMcpSdk(): McpSdk {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require("@modelcontextprotocol/sdk") as McpSdk;
  } catch {
    throw new Error(
      "Missing @modelcontextprotocol/sdk. Install it before running `elf mcp serve`."
    );
  }
}

function resolveSdkField<T>(
  sdk: McpSdk,
  pick: (source: McpSdk) => T | undefined
): T | undefined {
  return pick(sdk) ?? (sdk.default ? pick(sdk.default) : undefined);
}

export async function startElfMcpServer(): Promise<void> {
  const sdk = loadMcpSdk();
  const Server = resolveSdkField(sdk, (s) => s.Server ?? s.server?.Server);
  const Transport = resolveSdkField(
    sdk,
    (s) => s.StdioServerTransport ?? s.transport?.StdioServerTransport
  );
  const ListToolsRequestSchema = resolveSdkField(
    sdk,
    (s) => s.ListToolsRequestSchema ?? s.server?.ListToolsRequestSchema
  );
  const CallToolRequestSchema = resolveSdkField(
    sdk,
    (s) => s.CallToolRequestSchema ?? s.server?.CallToolRequestSchema
  );

  if (!Server || !Transport) {
    throw new Error("Unsupported MCP SDK shape: missing Server or StdioServerTransport.");
  }

  const server = new Server(
    { name: "elf", version: "1.0.0" },
    { capabilities: { tools: {} } }
  );

  const tools = buildElfMcpTools();

  if (ListToolsRequestSchema && typeof server.setRequestHandler === "function") {
    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
  }

  if (CallToolRequestSchema && typeof server.setRequestHandler === "function") {
    server.setRequestHandler(CallToolRequestSchema, async (request: any) => ({
      content: [
        {
          type: "text",
          text: `ELF MCP tool ${request?.params?.name ?? "unknown"} is not implemented yet.`,
        },
      ],
    }));
  }

  const transport = new Transport();
  await server.connect(transport);
}
