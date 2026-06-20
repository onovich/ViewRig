import { describe, expect, it } from "vitest";
import {
  VIEWRIG_TESTING_PACKAGE,
  describeTestingRuntime,
  testingPackageInfo
} from "./index";

describe("@viewrig/testing package skeleton", () => {
  it("exports testing metadata and resolves the core workspace package", () => {
    expect(VIEWRIG_TESTING_PACKAGE).toBe("@viewrig/testing");
    expect(testingPackageInfo).toEqual({
      name: "@viewrig/testing",
      role: "testing"
    });
    expect(describeTestingRuntime()).toBe("@viewrig/testing uses @viewrig/core");
  });
});
