import type { File } from "fetch-npm-package";
import { parseId } from "../utils";
import { path as _path } from "./path";
import { ResourceManager } from "./resources";
import type { PackageJson } from "./findPkgPath";
import { findPkgPath, findPkgEntry } from "./findPkgPath";

export interface ContextOptions {
  loadPackageFiles: (
    name: string,
    version: string
  ) => Promise<Record<string, File>> | Record<string, File>;
}

export class Context {
  parent?: Context;
  modules = Object.create(null);

  private packageJson = new WeakMap<File, PackageJson>();
  private findFileCache: Record<string, File> = Object.create(null);

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
    const pkgJson = this.getPkgJson(files["package.json"]);
    const { dependencies, peerDependencies } = pkgJson;
    console.log(pkgJson);
  }

  private fetchDepsResource(pkgName: string, version: string) {}

  private getPkgJson(jsonFile: File) {
    if (!jsonFile) return {} as PackageJson;
    if (!this.packageJson.has(jsonFile)) {
      this.packageJson.set(jsonFile, JSON.parse(jsonFile.code));
    }
    return this.packageJson.get(jsonFile)!;
  }

  private getRealPath(
    json: PackageJson,
    spec: string,
    path?: string,
    isInternal?: boolean
  ) {
    let moduleDir: string;
    if (path) {
      const legalPath = path.startsWith("./") ? path : `./${path}`;
      moduleDir = findPkgPath(legalPath, json, isInternal) as string;
      if (!moduleDir) {
        console.log(json);
        throw new Error(`"${spec}" not exported "${path}"`);
      }
    } else {
      moduleDir = findPkgEntry(json) as string;
      if (!moduleDir) {
        console.log(json);
        throw new Error(`Unable to find entry for package "${spec}"`);
      }
    }
    return moduleDir.startsWith("./")
      ? moduleDir.slice(2) // 删掉 './'
      : moduleDir;
  }

  private requireResolve(
    pkgName: string,
    version: string,
    path?: string,
    isInternal?: boolean
  ) {
    const spec = `${pkgName}@${version}`;
    const cacheFlag = `${spec}${path}:${Boolean(isInternal)}`;
    if (this.findFileCache[cacheFlag]) {
      return this.findFileCache[cacheFlag];
    }
    const files = ResourceManager.get(pkgName, version);
    if (!files) {
      throw new Error(`"${spec}" package does not exist`);
    }
    const pkgJson = this.getPkgJson(files["package.json"]);

    const core = (path?: string) => {
      // path 为绝对路径
      const modulePath = this.getRealPath(pkgJson, spec, path, isInternal);
      let file = files[modulePath];
      if (!file) {
        file = files[`${modulePath}.js`];
        if (!file) {
          file = files[`${modulePath}/index.js`];
          if (!file) {
            const jsonFile = files[`${modulePath}/package.json`];
            if (jsonFile) {
              const json = this.getPkgJson(jsonFile);
              const entry = findPkgEntry(json);
              if (entry && entry !== "index.js") {
                file = core(_path.resolve(modulePath, entry));
              }
            }
          }
        }
      }
      return file;
    };

    const file = core(path);
    if (!file) {
      console.error(
        `Unable to find "${path || "entry"}" for package "${spec}"`
      );
    } else {
      this.findFileCache[cacheFlag] = file;
    }
    return file;
  }
}
