import { describe, expect, it } from "vitest";
import { VIEWRIG_CORE_PACKAGE, corePackageInfo } from "./index";

describe("@viewrig/core package skeleton", () => {
  it("exports stable package metadata", () => {
    expect(VIEWRIG_CORE_PACKAGE).toBe("@viewrig/core");
    expect(corePackageInfo).toEqual({
      name: "@viewrig/core",
      role: "core"
    });
  });
});
