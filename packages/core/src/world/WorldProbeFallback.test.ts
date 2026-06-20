import { describe, expect, it } from "vitest";
import {
  safeClosestPoint,
  safeContainsPoint,
  safeRaycast,
  safeSpherecast
} from "./WorldProbeFallback";
import type { WorldProbe } from "./WorldProbe";

describe("WorldProbe no-probe fallbacks", () => {
  it("returns safe no-op results when no probe is present", () => {
    const ray = { origin: [0, 0, 0] as const, direction: [0, 0, -1] as const };

    expect(safeRaycast(undefined, ray, 10)).toBeNull();
    expect(safeSpherecast(undefined, ray, 0.5, 10)).toBeNull();
    expect(safeContainsPoint(undefined, "room", [5, 0, 0])).toBe(true);
    expect(safeClosestPoint(undefined, "room", [5, 0, 0])).toEqual({ x: 5, y: 0, z: 0 });
  });

  it("delegates to present probe capabilities", () => {
    const probe: WorldProbe = {
      containsPoint: () => false,
      closestPoint: () => [1, 2, 3]
    };

    expect(safeContainsPoint(probe, "room", [5, 0, 0])).toBe(false);
    expect(safeClosestPoint(probe, "room", [5, 0, 0])).toEqual({ x: 1, y: 2, z: 3 });
  });
});
