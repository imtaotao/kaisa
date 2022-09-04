const strStaticify = (s: string) => {
  const obj: any = {};
  obj[s] = true;
  return Object.keys(obj)[0];
};

export const execCode = (
  code: string,
  params: Record<string, any>,
  context: any,
  useStrict = false
) => {
  const nativeGlobal = (0, eval)("globalThis;");
  const keys = Object.keys(params);
  const randomValKey = "__exec_temporary__";
  const contextKey = "__exec_temporary_context__";
  const values = keys.map((k) => `globalThis.${randomValKey}.${k}`);

  try {
    nativeGlobal[contextKey] = context;
    nativeGlobal[randomValKey] = params;
    const cs = [
      `;(function(${keys.join(",")}){${useStrict ? '"use strict";' : ""}`,
      `\n}).call(globalThis.${contextKey},${values.join(",")});`,
    ];
    const staticStr = strStaticify(cs[0] + code + cs[1]);
    (0, eval)(staticStr);
  } catch (e) {
    throw e;
  } finally {
    delete nativeGlobal[contextKey];
    delete nativeGlobal[randomValKey];
  }
};
