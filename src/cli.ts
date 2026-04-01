#!/usr/bin/env node
import { Command } from "commander";
import { getPackageRoot } from "./core/paths";
import { readKitVersion } from "./core/versioning";
import { runInit } from "./commands/init";
import { runElfWorkflow } from "./commands/run";
import { resumeElfRun } from "./commands/resume";
import { reviewElfTarget } from "./commands/review";
import { runVerify } from "./commands/verify";
import { runInstall } from "./commands/install";
import { runDoctorCmd } from "./commands/doctor";
import { runUpdate } from "./commands/update";
import { runMcpServe } from "./commands/mcp-serve";
import { runAdapterInstall } from "./commands/adapter-install";
import { runAdapterUpdate } from "./commands/adapter-update";
import { runAdapterDoctor } from "./commands/adapter-doctor";

const packageRoot = getPackageRoot();
const version = readKitVersion(packageRoot);

const program = new Command();
program
  .name("elf")
  .description(
    "ELF orchestrator runtime — install runtime assets, manage workflows, and keep host adapters thin"
  )
  .version(version, "-V, --version", "print ELF runtime version");

const installOpts = (cmd: Command) =>
  cmd
    .option("--force", "overwrite existing kit files")
    .option(
      "--allow-anywhere",
      "skip check for .git or package.json (use with care)"
    );

installOpts(
  program
    .command("init")
    .description("Bootstrap .elf/ runtime state and AGENTS.md")
    .action((opts: { force?: boolean; allowAnywhere?: boolean }) => {
      runInit(process.cwd(), {
        force: Boolean(opts.force),
        allowAnywhere: Boolean(opts.allowAnywhere),
      });
    })
);

program
  .command("run")
  .description("Create and start an ELF runtime run")
  .option("--workflow <id>", "workflow id to run", "phase")
  .requiredOption("--title <title>", "run title / phase title")
  .action((opts: { workflow?: string; title?: string }) => {
    try {
      runElfWorkflow(process.cwd(), {
        workflowId: String(opts.workflow ?? "phase"),
        title: String(opts.title ?? ""),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });

program
  .command("resume <runId>")
  .description("Reload an existing ELF run state")
  .action((runId: string) => {
    try {
      resumeElfRun(process.cwd(), runId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });

program
  .command("review <target>")
  .description("Print a review scaffold for a path or run id")
  .action((target: string) => {
    try {
      reviewElfTarget(process.cwd(), target);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });

program
  .command("verify <runId>")
  .description("Verify a run and persist the verifier result")
  .action((runId: string) => {
    try {
      runVerify(process.cwd(), runId);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(message);
      process.exit(1);
    }
  });

const mcp = program.command("mcp").description("Local MCP bridge commands");
mcp
  .command("serve")
  .description("Start the local ELF MCP server")
  .action(() => {
    void runMcpServe();
  });

installOpts(
  program
    .command("install")
    .description("Install kit files into ./.cursor/ and ./AGENTS.md")
    .action((opts: { force?: boolean; allowAnywhere?: boolean }) => {
      runInstall(process.cwd(), {
        force: Boolean(opts.force),
        allowAnywhere: Boolean(opts.allowAnywhere),
      });
    })
);

program
  .command("doctor")
  .description("Validate .elf/ against the bundled ELF runtime")
  .option(
    "--strict",
    "fail when file contents differ from the runtime bundle (default: warn on drift)"
  )
  .action((opts: { strict?: boolean }) => {
    runDoctorCmd(process.cwd(), { strict: Boolean(opts.strict) });
  });

program
  .command("update")
  .description("Sync kit files; skips diverged files unless --force")
  .option("--force", "overwrite files that differ from the bundled kit")
  .action((opts: { force?: boolean }) => {
    runUpdate(process.cwd(), { force: Boolean(opts.force) });
  });

const adapter = program.command("adapter").description("Manage host adapters");
adapter
  .command("install <adapter>")
  .description("Install an adapter bundle (cursor)")
  .option("--force", "overwrite existing adapter files")
  .option(
    "--allow-anywhere",
    "skip check for .git or package.json (use with care)"
  )
  .action((adapterName: string, opts: { force?: boolean; allowAnywhere?: boolean }) => {
    runAdapterInstall(process.cwd(), adapterName, {
      force: Boolean(opts.force),
      allowAnywhere: Boolean(opts.allowAnywhere),
    });
  });

adapter
  .command("update <adapter>")
  .description("Update an adapter bundle (cursor)")
  .option("--force", "overwrite diverged adapter files")
  .action((adapterName: string, opts: { force?: boolean }) => {
    runAdapterUpdate(process.cwd(), adapterName, {
      force: Boolean(opts.force),
    });
  });

adapter
  .command("doctor <adapter>")
  .description("Validate an adapter bundle (cursor)")
  .option(
    "--strict",
    "fail when file contents differ from the adapter bundle (default: warn on drift)"
  )
  .action((adapterName: string, opts: { strict?: boolean }) => {
    runAdapterDoctor(process.cwd(), adapterName, {
      strict: Boolean(opts.strict),
    });
  });

program.addHelpText(
  "after",
  "\nRecommended entrypoint: elf init\n"
);

program.parse();
