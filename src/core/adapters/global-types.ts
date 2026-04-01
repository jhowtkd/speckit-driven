export type AdapterHost = "cursor" | "codex";

export type AdapterScope = "project" | "global";

export type AdapterPlan = {
  host: AdapterHost;
  scope: AdapterScope;
  installPaths: string[];
  doctorPaths: string[];
  uninstallPaths: string[];
  manifestPath: string | null;
};
