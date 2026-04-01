#!/usr/bin/env node
/**
 * Static checks for Project Rules under assets/cursor/rules.
 * Run: node scripts/validate-rules.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rulesDir = path.resolve(__dirname, "..", "assets", "cursor", "rules");

const REQUIRED_PREFIXES = ["00", "10", "20", "30", "40", "50", "60"];

function frontmatterBlock(text) {
  if (!text.startsWith("---\n")) return null;
  const end = text.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return text.slice(4, end);
}

function main() {
  if (!fs.existsSync(rulesDir)) {
    console.error(`Missing rules directory: ${rulesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(rulesDir).filter((f) => f.endsWith(".mdc"));
  const byPrefix = new Map();
  for (const f of files) {
    const m = /^(\d{2})-/.exec(f);
    if (!m) {
      console.error(`Invalid rule filename (expected NN-*.mdc): ${f}`);
      process.exit(1);
    }
    const p = m[1];
    if (byPrefix.has(p)) {
      console.error(`Duplicate prefix ${p}: ${byPrefix.get(p)} and ${f}`);
      process.exit(1);
    }
    byPrefix.set(p, f);
  }

  for (const p of REQUIRED_PREFIXES) {
    if (!byPrefix.has(p)) {
      console.error(`Missing rule file with prefix ${p}-`);
      process.exit(1);
    }
  }

  const extra = [...byPrefix.keys()].filter((k) => !REQUIRED_PREFIXES.includes(k));
  if (extra.length) {
    console.error(`Unexpected rule prefix(es): ${extra.join(", ")}`);
    process.exit(1);
  }

  const zeroFile = path.join(rulesDir, byPrefix.get("00"));
  const body = fs.readFileSync(zeroFile, "utf8");
  const fm = frontmatterBlock(body);
  if (!fm) {
    console.error(`${byPrefix.get("00")}: missing YAML frontmatter`);
    process.exit(1);
  }
  if (!/alwaysApply:\s*true\b/m.test(fm)) {
    console.error(`${byPrefix.get("00")}: frontmatter must set alwaysApply: true`);
    process.exit(1);
  }

  for (const p of REQUIRED_PREFIXES) {
    const name = byPrefix.get(p);
    const fp = path.join(rulesDir, name);
    if (!frontmatterBlock(fs.readFileSync(fp, "utf8"))) {
      console.error(`${name}: missing YAML frontmatter`);
      process.exit(1);
    }
  }

  console.log(`OK: ${REQUIRED_PREFIXES.length} rule files validated in ${rulesDir}`);
}

main();
