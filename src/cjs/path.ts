// https://github.com/jinder/path/blob/master/path.js
const splitPathRe =
  /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;

const posixSplitPath = (filename: string) =>
  splitPathRe.exec(filename)!.slice(1);

export const path = {
  normalizeArray(parts: Array<string>, allowAboveRoot: boolean) {
    const res = [];
    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      // ignore empty parts
      if (!p || p === ".") continue;
      if (p === "..") {
        if (res.length && res[res.length - 1] !== "..") {
          res.pop();
        } else if (allowAboveRoot) {
          res.push("..");
        }
      } else {
        res.push(p);
      }
    }
    return res;
  },

  resolve(...args: Array<string>) {
    let resolvedPath = "";
    let resolvedAbsolute = false;

    for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      const path = args[i];
      if (!path) continue;
      resolvedPath = path + "/" + resolvedPath;
      resolvedAbsolute = path[0] === "/";
    }
    resolvedPath = this.normalizeArray(
      resolvedPath.split("/"),
      !resolvedAbsolute
    ).join("/");

    return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
  },

  dirname(path: string) {
    const result = posixSplitPath(path);
    const root = result[0];
    let dir = result[1];
    // No dirname whatsoever
    if (!root && !dir) return ".";
    // It has a dirname, strip trailing slash
    if (dir) dir = dir.substr(0, dir.length - 1);
    return root + dir;
  },
};
