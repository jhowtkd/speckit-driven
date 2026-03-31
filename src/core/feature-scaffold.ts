import { existsSync, mkdirSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { padFeatureIndex, toKebabCase } from "./naming";
import { writeUtf8 } from "./fs-utils";

export function nextFeatureIndex(featuresDir: string): number {
  if (!existsSync(featuresDir)) return 1;
  let max = 0;
  for (const ent of readdirSync(featuresDir, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const m = /^(\d{3})-/.exec(ent.name);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

function templatePaths(projectCursorDir: string, assetsCursorDir: string): {
  spec: string;
  plan: string;
  tasks: string;
  state: string;
} {
  const t = (name: string) => join(projectCursorDir, "templates", name);
  const spec = t("spec-template.md");
  const plan = t("plan-template.md");
  const tasks = t("tasks-template.md");
  const state = t("state-template.json");
  const fallback = (name: string) => join(assetsCursorDir, "templates", name);
  return {
    spec: existsSync(spec) ? spec : fallback("spec-template.md"),
    plan: existsSync(plan) ? plan : fallback("plan-template.md"),
    tasks: existsSync(tasks) ? tasks : fallback("tasks-template.md"),
    state: existsSync(state) ? state : fallback("state-template.json"),
  };
}

function applyTemplateVars(
  content: string,
  vars: {
    featureId: string;
    featureName: string;
    featureSlug: string;
    createdAt: string;
  }
): string {
  let s = content;
  s = s.split("{{FEATURE_ID}}").join(vars.featureId);
  s = s.split("{{FEATURE_NAME}}").join(vars.featureName);
  s = s.split("{{FEATURE_SLUG}}").join(vars.featureSlug);
  s = s.split("{{CREATED_AT}}").join(vars.createdAt);
  return s;
}

export type ScaffoldResult = {
  featureId: string;
  featureDir: string;
  files: string[];
};

/**
 * Creates `.cursor/features/NNN-slug/` with spec, plan, tasks, state from templates.
 */
export function scaffoldFeature(options: {
  cwd: string;
  rawName: string;
  assetsCursorDir: string;
}): ScaffoldResult {
  const { cwd, rawName, assetsCursorDir } = options;
  const projectCursor = join(cwd, ".cursor");
  if (!existsSync(projectCursor)) {
    throw new Error(
      'Missing .cursor/. Run "spec-driven-kit init" in this repository first.'
    );
  }

  const slug = toKebabCase(rawName);
  if (!slug) {
    throw new Error("Feature name must contain at least one letter or digit.");
  }

  const idx = nextFeatureIndex(join(projectCursor, "features"));
  if (idx > 999) {
    throw new Error("Maximum feature index 999 reached; archive or renumber manually.");
  }

  const featureId = `${padFeatureIndex(idx)}-${slug}`;
  const featureDir = join(projectCursor, "features", featureId);
  if (existsSync(featureDir)) {
    throw new Error(`Feature folder already exists: ${featureDir}`);
  }

  mkdirSync(featureDir, { recursive: true });

  const tp = templatePaths(projectCursor, assetsCursorDir);
  const files: string[] = [];

  const createdAt = new Date().toISOString();
  const vars = {
    featureId,
    featureName: rawName,
    featureSlug: slug,
    createdAt,
  };

  const pairs: { src: string; dest: string }[] = [
    { src: tp.spec, dest: join(featureDir, "spec.md") },
    { src: tp.plan, dest: join(featureDir, "plan.md") },
    { src: tp.tasks, dest: join(featureDir, "tasks.md") },
    { src: tp.state, dest: join(featureDir, "state.json") },
  ];

  for (const { src, dest } of pairs) {
    if (!existsSync(src)) {
      throw new Error(`Template missing: ${src}`);
    }
    const raw = readFileSync(src, "utf8");
    writeUtf8(dest, applyTemplateVars(raw, vars));
    files.push(dest);
  }

  return { featureId, featureDir, files };
}
