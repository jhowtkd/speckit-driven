import {
  readdirSync,
  statSync,
  mkdirSync,
  copyFileSync,
  existsSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join, relative } from "path";

export function listFilesRecursive(rootDir: string, baseDir = rootDir): string[] {
  const out: string[] = [];
  if (!existsSync(rootDir)) return out;
  for (const ent of readdirSync(rootDir, { withFileTypes: true })) {
    const full = join(rootDir, ent.name);
    if (ent.isDirectory()) {
      out.push(...listFilesRecursive(full, baseDir));
    } else {
      out.push(relative(baseDir, full).split("\\").join("/"));
    }
  }
  return out.sort();
}

export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

export function readUtf8(path: string): string {
  return readFileSync(path, "utf8");
}

export function writeUtf8(path: string, content: string): void {
  ensureDir(join(path, ".."));
  writeFileSync(path, content, "utf8");
}

export function fileBuffersEqual(aPath: string, bPath: string): boolean {
  return readFileSync(aPath).equals(readFileSync(bPath));
}
