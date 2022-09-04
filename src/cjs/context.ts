import { parseId } from "../utils";
import { ResourceManager } from "./resources";
import type { File } from "fetch-npm-package";

export interface ContextOptions {
  loadPackageFiles: (
    name: string,
    version: string
  ) => Promise<Record<string, File>> | Record<string, File>;
}

export class Context {
  parent?: Context;
  modules = Object.create(null);

  constructor(public options: ContextOptions) {
    if (typeof options.loadPackageFiles !== "function") {
      throw new Error('Miss "loadPackageFiles" function');
    }
  }

  require(id: string) {
    const idData = parseId(id);
  }

  async requireAsync(id: string) {
    const idData = parseId(id);
    let files = ResourceManager.get(idData.name, idData.version);
    if (!files) {
      files = await this.options.loadPackageFiles(idData.name, idData.version);
      ResourceManager.set(idData.name, idData.version, files);
    }

    console.log(files);
  }
}
