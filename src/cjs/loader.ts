import { fetchFiles } from "fetch-npm-package";
import { isRangeVersion } from "../utils";
import { versionSort, versionComparison } from "./versionUtils";

export function defaultLoader(registry?: string) {
  registry = registry || "https://registry.npmjs.org";
  if (!registry.endsWith("/")) registry += "/";
  const loadings = Object.create(null);
  // prettier-ignore
  const versionInfos: Record<string, Record<string, Record<string, any>>> = Object.create(null);

  // 从大往小找
  const pinkTargetVersion = (
    versions: Record<string, Record<string, any>>,
    pinkVersion: string
  ) => {
    if (versions) {
      const versionkeys = versionSort(Object.keys(versions));
      let l = versionkeys.length;
      while (~--l) {
        if (versionComparison(versionkeys[l], pinkVersion, null, false)) {
          return versions[versionkeys[l]];
        }
      }
      // 如果都没有，则取最后一个兜底
      return versions[versionkeys[versionkeys.length - 1]];
    }
    return null;
  };

  const getPkgTarball = async (name: string, version: string) => {
    const spec = `${registry}:${name}@${version}`;
    if (!versionInfos[name]) {
      const { versions } = await fetch(`${registry}${name}`).then((res) => {
        if (res.status === 404) {
          throw new Error(`Can't find package "${spec}" (status: 404)`);
        }
        return res.json();
      });
      versionInfos[name] = versions || Object.create(null);
    }
    const targetVersion = pinkTargetVersion(versionInfos[name], version);
    if (targetVersion) {
      return targetVersion.dist.tarball;
    }
    throw new Error(`"${spec}" does not match an available version`);
  };

  return async (name: string, version = '') => {
    const spec = `${registry}:${name}@${version}`;
    if (!loadings[spec]) {
      if (!version || isRangeVersion(version)) {
        loadings[spec] = getPkgTarball(name, version).then((tarball) => {
          return fetchFiles.tarball(tarball);
        });
      } else {
        loadings[spec] = fetchFiles(name, { registry, version });
      }
    }
    return loadings[spec];
  };
}
