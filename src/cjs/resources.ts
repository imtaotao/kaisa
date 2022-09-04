import type { File } from "fetch-npm-package";

export const ResourceManager = {
  packageContainer: Object.create(null) as Record<
    string,
    Record<string, Record<string, File>>
  >,

  has(name: string, version = "") {
    const packages = this.packageContainer[name];
    return packages ? Boolean(packages[version]) : false;
  },

  get(name: string, version = "") {
    const packages = this.packageContainer[name];
    return packages ? packages[version] : null;
  },

  remove(name: string, version = "") {
    const packages = this.packageContainer[name];
    if (packages) {
      packages[version] = null;
    }
  },

  set(
    name: string,
    version: string | Record<string, File>,
    value?: Record<string, File>
  ) {
    if (typeof version !== "string") {
      value = version;
      version = "";
    }
    let packages = this.packageContainer[name];
    if (!packages) {
      this.packageContainer[name] = packages = Object.create(null);
    }
    if (!packages[version]) {
      packages[version] = value;
    }
  },
};
