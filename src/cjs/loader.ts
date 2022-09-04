import { fetchFiles } from "fetch-npm-package";

export function defaultLoader(registry?: string) {
  if (!registry.endsWith("/")) registry += "/";
  const loadings = Object.create(null);
  return (pkgName: string, version: string) => {
    const spec = `${registry}:${pkgName}@${version}`;
    if (!loadings[spec]) {
      loadings[spec] = fetchFiles(pkgName, { registry, version });
    }
    return loadings[spec];
  };
}
