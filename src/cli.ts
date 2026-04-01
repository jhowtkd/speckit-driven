#!/usr/bin/env node
import { Command } from "commander";
import { getPackageRoot } from "./core/paths";
import { readKitVersion } from "./core/versioning";
import { runInstall } from "./commands/install";
import { runDoctorCmd } from "./commands/doctor";
import { runUpdate } from "./commands/update";

const packageRoot = getPackageRoot();
const version = readKitVersion(packageRoot);

const program = new Command();
program
  .name("spec-driven-kit")
  .description(
    "Spec-driven kit for Cursor — install .cursor/rules, templates, and AGENTS.md"
  )
  .version(version, "-V, --version", "print CLI and kit package version");

const installOpts = (cmd: Command) =>
  cmd
    .option("--force", "overwrite existing kit files")
    .option(
      "--allow-anywhere",
      "skip check for .git or package.json (use with care)"
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

installOpts(
  program
    .command("init")
    .description("[Deprecated] Alias for install")
    .action((opts: { force?: boolean; allowAnywhere?: boolean }) => {
      console.warn(
        "warning: `init` is deprecated; use `spec-driven-kit install`.\n"
      );
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

program.parse();
