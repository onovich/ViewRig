import { describe, expect, it } from "vitest";
import type { WorldProbe } from "./WorldProbe";

describe("WorldProbe contract", () => {
  it("keeps world queries behind optional probe methods", () => {
    const probe: WorldProbe = {
      raycast: (ray, maxDistance, mask) => ({
        point: ray.origin,
        normal: [0, 1, 0],
        distance: Math.min(2, maxDistance),
        colliderId: String(mask ?? "default")
      }),
      containsPoint: (_volumeId, point) => point[1] >= 0
    };

    expect(probe.raycast?.({ origin: [0, 3, 0], direction: [0, -1, 0] }, 10, "level")).toEqual({
      point: [0, 3, 0],
      normal: [0, 1, 0],
      distance: 2,
      colliderId: "level"
    });
    expect(probe.containsPoint?.("ground", [0, -1, 0])).toBe(false);
  });
});
