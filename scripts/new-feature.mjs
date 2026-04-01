#!/usr/bin/env node
/**
 * Optional scaffold: creates .cursor/features/NNN-slug/ with templates.
 * Not part of the spec-driven-kit CLI binary.
 *
 * Usage (from your project root, after install):
 *   node node_modules/spec-driven-kit/scripts/new-feature.mjs my-feature-name
 *
 * From a clone of this repo (dev):
 *   node scripts/new-feature.mjs my-feature-name
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findAssetsCursor() {
  const fromNode = path.join(
    process.cwd(),
    "node_modules",
    "spec-driven-kit",
    "assets",
    "cursor"
  );
  if (fs.existsSync(fromNode)) return fromNode;
  const fromRepo = path.resolve(__dirname, "..", "assets", "cursor");
  if (fs.existsSync(fromRepo)) return fromRepo;
  throw new Error(
    "Could not find spec-driven-kit assets/cursor (install the package or run from repo root)."
  );
}

function toKebabCase(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function padFeatureIndex(n) {
  return String(n).padStart(3, "0");
}

function nextFeatureIndex(featuresDir) {
  if (!fs.existsSync(featuresDir)) return 1;
  let max = 0;
  for (const ent of fs.readdirSync(featuresDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const m = /^(\d{3})-/.exec(ent.name);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

function templatePaths(projectCursorDir, assetsCursorDir) {
  const t = (name) => path.join(projectCursorDir, "templates", name);
  const fallback = (name) => path.join(assetsCursorDir, "templates", name);
  return {
    spec: fs.existsSync(t("spec-template.md"))
      ? t("spec-template.md")
      : fallback("spec-template.md"),
    plan: fs.existsSync(t("plan-template.md"))
      ? t("plan-template.md")
      : fallback("plan-template.md"),
    tasks: fs.existsSync(t("tasks-template.md"))
      ? t("tasks-template.md")
      : fallback("tasks-template.md"),
    state: fs.existsSync(t("state-template.json"))
      ? t("state-template.json")
      : fallback("state-template.json"),
  };
}

function applyVars(content, vars) {
  return content
    .split("{{FEATURE_ID}}").join(vars.featureId)
    .split("{{FEATURE_NAME}}").join(vars.featureName)
    .split("{{FEATURE_SLUG}}").join(vars.featureSlug)
    .split("{{CREATED_AT}}").join(vars.createdAt);
}

const rawName = process.argv[2];
if (!rawName) {
  console.error("Usage: new-feature.mjs <feature-slug-or-name>");
  process.exit(1);
}

const cwd = process.cwd();
const projectCursor = path.join(cwd, ".cursor");
if (!fs.existsSync(projectCursor)) {
  console.error('Missing .cursor/. Run "npx spec-driven-kit install" first.');
  process.exit(1);
}

const slug = toKebabCase(rawName);
if (!slug) {
  console.error("Feature name must contain at least one letter or digit.");
  process.exit(1);
}

const assetsCursorDir = findAssetsCursor();
const featuresDir = path.join(projectCursor, "features");
const idx = nextFeatureIndex(featuresDir);
if (idx > 999) {
  console.error("Maximum feature index 999 reached.");
  process.exit(1);
}

const featureId = `${padFeatureIndex(idx)}-${slug}`;
const featureDir = path.join(featuresDir, featureId);
if (fs.existsSync(featureDir)) {
  console.error(`Feature folder already exists: ${featureDir}`);
  process.exit(1);
}

fs.mkdirSync(featureDir, { recursive: true });
const tp = templatePaths(projectCursor, assetsCursorDir);
const createdAt = new Date().toISOString();
const vars = { featureId, featureName: rawName, featureSlug: slug, createdAt };

const pairs = [
  { src: tp.spec, dest: path.join(featureDir, "spec.md") },
  { src: tp.plan, dest: path.join(featureDir, "plan.md") },
  { src: tp.tasks, dest: path.join(featureDir, "tasks.md") },
  { src: tp.state, dest: path.join(featureDir, "state.json") },
];

for (const { src, dest } of pairs) {
  if (!fs.existsSync(src)) {
    console.error(`Template missing: ${src}`);
    process.exit(1);
  }
  const body = applyVars(fs.readFileSync(src, "utf8"));
  fs.writeFileSync(dest, body, "utf8");
}

console.log(`Feature ID: ${featureId}`);
console.log(`Created: ${featureDir}`);
