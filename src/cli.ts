#!/usr/bin/env node
import { Command } from "commander";
import { getPackageRoot } from "./core/paths";
import { readKitVersion } from "./core/versioning";
import { runInit } from "./commands/init";
import { runInstall } from "./commands/install";
import { runDoctorCmd } from "./commands/doctor";
import { runUpdate } from "./commands/update";

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
  .description("Validate .cursor/ and AGENTS.md against the bundled kit")
  .option(
    "--strict",
    "fail when file contents differ from the package (default: warn on drift)"
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

program.addHelpText(
  "after",
  "\nRecommended entrypoint: elf init\n"
);

program.parse();
