import builtins from "builtins";
import { parseModuleId } from "node-package-exports";
import type { ModuleIdData } from "node-package-exports";

export const parseId = (() => {
  const cache: Record<string, ModuleIdData> = Object.create(null);
  return (id: string) => {
    if (!cache[id]) {
      cache[id] = parseModuleId(id);
    }
    return cache[id];
  };
})();

export const makeMap = <T extends ReadonlyArray<string>>(list: T) => {
  const map = Object.create(null);
  for (let i = 0, l = list.length; i < l; i++) {
    map[list[i]] = true;
  }
  return (val: typeof list[number]) => Boolean(map[val]);
};

export const isNodeBuiltInModule = makeMap(builtins({ version: "*" }));

// git://
// npm://
// http://
// https://
export const isUnsupportedVersionFormat = (v: string) => {
  if (!v) return false;
  return v.includes(":");
};

export const isRangeVersion = (v: string) => {
  if (!v) return true;
  if (isUnsupportedVersionFormat(v)) return false;
  return (
    v === "*" ||
    v === "latest" ||
    v.includes("x") ||
    v.includes("||") ||
    v.startsWith("^") ||
    v.startsWith("~") ||
    v.startsWith(">") ||
    v.startsWith("<") ||
    v.startsWith(">=") ||
    v.startsWith("<=")
  );
};
