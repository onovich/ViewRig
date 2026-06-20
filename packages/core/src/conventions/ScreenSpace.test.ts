import { describe, expect, it } from "vitest";
import { NDC_RANGE, clampNdcPoint, isNdcPoint } from "./ScreenSpace";

describe("screen space contract", () => {
  it("fixes NDC to the -1..1 range", () => {
    expect(NDC_RANGE).toEqual({ min: -1, max: 1 });
    expect(isNdcPoint([-1, 1])).toBe(true);
    expect(isNdcPoint([1.01, 0])).toBe(false);
  });

  it("clamps screen points without mutating the input tuple", () => {
    const input = [2, -2] as const;

    expect(clampNdcPoint(input)).toEqual([1, -1]);
    expect(input).toEqual([2, -2]);
  });
});
