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
