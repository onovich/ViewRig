import { describe, expect, it } from "vitest";
import { clampPointToRect, rectCenter, rectContainsPoint } from "./RectNdc";

describe("RectNdc", () => {
  it("creates centered screen rects and checks containment", () => {
    const rect = rectCenter(1, 0.5);

    expect(rectContainsPoint(rect, [0.5, 0.25])).toBe(true);
    expect(rectContainsPoint(rect, [0.6, 0])).toBe(false);
  });

  it("clamps points to rect bounds", () => {
    expect(clampPointToRect(rectCenter(1, 1), [2, -2])).toEqual([0.5, -0.5]);
  });
});
