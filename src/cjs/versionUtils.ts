import { compare, intersects } from "semver";
import { isRangeVersion } from "../utils";

// https://github.com/sindresorhus/semver-regex/edit/main/index.js
const semverRegex = () => {
  return /(?<=^v?|\sv?)(?:(?:0|[1-9]\d{0,9}?)\.){2}(?:0|[1-9]\d{0,9})(?:-(?:--+)?(?:0|[1-9]\d*|\d*[a-z]+\d*)){0,100}(?=$| |\+|\.)(?:(?<=-\S+)(?:\.(?:--?|[\da-z-]*[a-z-]\d*|0|[1-9]\d*)){1,100}?)?(?!\.)(?:\+(?:[\da-z]\.?-?){1,100}?(?!\w))?(?!\+)/gi;
};

// https://github.com/ragingwind/semver-sort/blob/master/index.js
export function versionSort(versions: Array<string>) {
  return versions.sort((v1, v2) => {
    var sv1 = semverRegex().exec(v1)?.[0] || v1;
    var sv2 = semverRegex().exec(v2)?.[0] || v2;
    return compare(sv1, sv2);
  });
}

export const versionComparison = (
  local: string,
  remote: string,
  getLocalRv?: null | (() => string),
  strictCheck = true
) => {
  if (local === "latest") local = "";
  if (remote === "latest") remote = "";
  if (!strictCheck || isRangeVersion(remote)) {
    if (intersects(local, remote)) return true;
    if (typeof getLocalRv === "function") {
      local = getLocalRv();
      if (local) return intersects(local, remote);
    }
  } else {
    if (local === remote) return true;
    if (typeof getLocalRv === "function") {
      local = getLocalRv();
      return local === remote;
    }
  }
  return false;
};
