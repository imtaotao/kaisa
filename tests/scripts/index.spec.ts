import { Context } from "kaisa";

describe("Index", () => {
  it("test", () => {
    const ctx = new Context({
      loadPackageFiles() {
        return {};
      },
    });
    expect(typeof ctx.requireAsync).toBe("function");
  });
});
