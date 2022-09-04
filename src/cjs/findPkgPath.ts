import {
  findPathInExports,
  findPathInImports,
  findEntryInExports,
} from "node-package-exports";
import type { Exports, Imports } from "node-package-exports";

export interface PackageJson {
  name: string;
  version: string;
  wowpack?: boolean;
  private?: boolean;
  description?: string;
  main?: string;
  unpkg?: string;
  module?: string;
  types?: string;
  typings?: string;
  exports?: Exports;
  imports?: Imports;
  browser?: string | Record<string, any>;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  bundleDependencies?: Record<string, string>;
  engines?: Record<string, any>;
  author?: string | Array<string>;
  keywords?: string | Array<string>;
  license?: string;
  publishConfig?: {
    registry?: string;
    types?: string;
    access?: string;
  };
  repository?:
    | string
    | {
        type?: string;
        url?: string;
      };
  bugs?:
    | string
    | {
        url?: string;
      };
  [key: string]: any;
}

const pathCache: Record<string, null | string> = Object.create(null);
const entryCache: Record<string, null | string> = Object.create(null);

// 寻找真正的 path
export const findPkgPath = (
  path: string,
  pkgJson: PackageJson,
  isInternal?: boolean
) => {
  const hash = `${pkgJson.name}@${pkgJson.version}${path}`;
  if (hash in pathCache) {
    // empty
  } else if (isInternal || path.startsWith("#")) {
    pathCache[hash] =
      "imports" in pkgJson ? findPathInImports(path, pkgJson.imports!) : path;
  } else {
    pathCache[hash] =
      "exports" in pkgJson ? findPathInExports(path, pkgJson.exports) : path;
  }
  return pathCache[hash];
};

// 寻找包的入口
export const findPkgEntry = (pkgJson: PackageJson) => {
  const hash = `${pkgJson.name}@${pkgJson.version}_cjs`;
  if (hash in entryCache) {
    // empty
  } else if (typeof pkgJson.browser === "string") {
    entryCache[hash] = pkgJson.browser; // TODO: browser 也可能是一个 object
  } else if ("exports" in pkgJson) {
    entryCache[hash] = findEntryInExports(pkgJson.exports, ["require"]);
  } else if ("main" in pkgJson) {
    entryCache[hash] = pkgJson.main!;
  } else {
    entryCache[hash] = "index.js";
  }
  return entryCache[hash];
};

export const findPkgEsmEntry = (pkgJson: PackageJson) => {
  const hash = `${pkgJson.name}@${pkgJson.version}_esm`;
  if (hash in entryCache) {
    // empty
  } else if ("exports" in pkgJson) {
    entryCache[hash] = findEntryInExports(pkgJson.exports, ["import"]);
  } else if ("module" in pkgJson) {
    entryCache[hash] = pkgJson.module!;
  }
  return entryCache[hash];
};
