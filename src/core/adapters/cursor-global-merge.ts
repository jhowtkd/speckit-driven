import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

export type CursorMcpServerEntry = {
  command?: string;
  args?: string[];
  url?: string;
  headers?: Record<string, string>;
};

export type CursorHookEntry = {
  command: string;
};

type CursorMcpConfig = {
  mcpServers?: Record<string, CursorMcpServerEntry>;
};

type CursorHooksConfig = {
  version?: number;
  hooks?: Record<string, CursorHookEntry[]>;
} & Record<string, unknown>;

function readJsonConfig<T>(filePath: string, fallback: T): T {
  if (!existsSync(filePath)) {
    return fallback;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to parse Cursor shared config: ${filePath} (${message})`);
  }
}

function writeJsonConfig(filePath: string, value: unknown): void {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

export function mergeCursorGlobalMcpFile(options: {
  filePath: string;
  mcpServers: Record<string, CursorMcpServerEntry>;
}): { managedServerNames: string[] } {
  const config = readJsonConfig<CursorMcpConfig>(options.filePath, {
    mcpServers: {},
  });
  const nextServers = {
    ...(config.mcpServers ?? {}),
  };

  for (const [serverName, serverConfig] of Object.entries(options.mcpServers)) {
    nextServers[serverName] = serverConfig;
  }

  writeJsonConfig(options.filePath, {
    ...config,
    mcpServers: nextServers,
  });

  return {
    managedServerNames: Object.keys(options.mcpServers).sort(),
  };
}

export function removeCursorGlobalMcpFile(options: {
  filePath: string;
  serverNames: string[];
}): void {
  if (!existsSync(options.filePath)) {
    return;
  }

  const config = readJsonConfig<CursorMcpConfig>(options.filePath, {
    mcpServers: {},
  });
  const nextServers = {
    ...(config.mcpServers ?? {}),
  };

  for (const serverName of options.serverNames) {
    delete nextServers[serverName];
  }

  writeJsonConfig(options.filePath, {
    ...config,
    mcpServers: nextServers,
  });
}

export function mergeCursorGlobalHooksFile(options: {
  filePath: string;
  hooks: Record<string, CursorHookEntry[]>;
}): { managedHookRefs: string[] } {
  const config = readJsonConfig<CursorHooksConfig>(options.filePath, {
    version: 1,
    hooks: {},
  });
  const nextHooks = {
    ...(config.hooks ?? {}),
  };

  for (const [hookName, desiredEntries] of Object.entries(options.hooks)) {
    const existingEntries = nextHooks[hookName] ?? [];
    const managedCommands = new Set(desiredEntries.map((entry) => entry.command));
    const preservedEntries = existingEntries.filter(
      (entry) => !managedCommands.has(entry.command)
    );
    nextHooks[hookName] = [...preservedEntries, ...desiredEntries];
  }

  writeJsonConfig(options.filePath, {
    ...config,
    version: config.version ?? 1,
    hooks: nextHooks,
  });

  return {
    managedHookRefs: Object.entries(options.hooks)
      .flatMap(([hookName, entries]) =>
        entries.map((entry) => `${hookName}:${entry.command}`)
      )
      .sort(),
  };
}

export function removeCursorGlobalHooksFile(options: {
  filePath: string;
  hooks: Record<string, CursorHookEntry[]>;
}): void {
  if (!existsSync(options.filePath)) {
    return;
  }

  const config = readJsonConfig<CursorHooksConfig>(options.filePath, {
    version: 1,
    hooks: {},
  });
  const nextHooks = {
    ...(config.hooks ?? {}),
  };

  for (const [hookName, managedEntries] of Object.entries(options.hooks)) {
    const managedCommands = new Set(managedEntries.map((entry) => entry.command));
    const existingEntries = nextHooks[hookName] ?? [];
    const preservedEntries = existingEntries.filter(
      (entry) => !managedCommands.has(entry.command)
    );

    if (preservedEntries.length === 0) {
      delete nextHooks[hookName];
      continue;
    }

    nextHooks[hookName] = preservedEntries;
  }

  writeJsonConfig(options.filePath, {
    ...config,
    version: config.version ?? 1,
    hooks: nextHooks,
  });
}
