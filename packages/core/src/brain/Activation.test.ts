import { describe, expect, it } from "vitest";
import { normalizeActivationOptions } from "./Activation";

describe("activation policy", () => {
  it("defaults to cut without force", () => {
    expect(normalizeActivationOptions()).toEqual({
      transition: "cut",
      force: false
    });
  });

  it("preserves explicit cut options", () => {
    expect(normalizeActivationOptions({ transition: "cut", force: true })).toEqual({
      transition: "cut",
      force: true
    });
  });

  it("accepts blend and matchThenBlend transitions", () => {
    expect(normalizeActivationOptions({ transition: "blend" }).transition).toBe("blend");
    expect(normalizeActivationOptions({ transition: "matchThenBlend" }).transition).toBe("matchThenBlend");
  });
});
