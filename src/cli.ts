#!/usr/bin/env node
import { Command } from "commander";
import { getPackageRoot } from "./core/paths";
import { readKitVersion } from "./core/versioning";
import { runInit } from "./commands/init";
import { runNewFeature } from "./commands/new-feature";
import { runDoctorCmd } from "./commands/doctor";
import { runUpdate } from "./commands/update";

const packageRoot = getPackageRoot();
const version = readKitVersion(packageRoot);

const program = new Command();
program
  .name("spec-driven-kit")
  .description(
    "Spec-Driven Coding MVP — install constitutions, templates, and prompts into .cursor/"
  )
  .version(version, "-V, --version", "print CLI and kit package version");

program
  .command("init")
  .description("Install kit files into ./.cursor/")
  .option("--force", "overwrite existing kit files")
  .option(
    "--allow-anywhere",
    "skip check for .git or package.json (use with care)"
  )
  .action((opts: { force?: boolean; allowAnywhere?: boolean }) => {
    runInit(process.cwd(), {
      force: Boolean(opts.force),
      allowAnywhere: Boolean(opts.allowAnywhere),
    });
  });

const cmdNew = new Command("new").description("Create scaffold artifacts");
cmdNew
  .command("feature")
  .argument("<name>", "feature slug, e.g. login-flow")
  .description("Create .cursor/features/NNN-<slug>/ with spec, plan, tasks, state")
  .action((name: string) => {
    runNewFeature(process.cwd(), name);
  });
program.addCommand(cmdNew);

program
  .command("doctor")
  .description("Validate .cursor/ against the bundled kit")
  .option(
    "--strict",
    "compare file contents to the package (warn on drift)"
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
