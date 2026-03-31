import { join } from "path";

/** Package root (contains package.json, assets/, dist/). Resolves from `dist/core`. */
export function getPackageRoot(): string {
  return join(__dirname, "..", "..");
}

export function getAssetsCursorDir(): string {
  return join(getPackageRoot(), "assets", "cursor");
}
