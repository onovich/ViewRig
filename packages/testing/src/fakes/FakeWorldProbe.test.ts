import { describe, expect, it } from "vitest";
import { createFakeWorldProbe } from "./FakeWorldProbe";

describe("createFakeWorldProbe", () => {
  it("returns deterministic ray, sphere, and volume query results", () => {
    const probe = createFakeWorldProbe({
      rayHits: [
        { point: [0, 1, 0], normal: [0, 1, 0], distance: 2, colliderId: "wall" }
      ],
      sphereHits: [
        { point: [0, 2, 0], normal: [0, 1, 0], distance: 3, colliderId: "ceiling" }
      ],
      volumes: {
        room: { contains: true, closestPoint: [1, 0, 0] }
      }
    });

    expect(probe.raycast?.({ origin: [0, 0, 0], direction: [0, 1, 0] }, 2)).toEqual({
      point: [0, 1, 0],
      normal: [0, 1, 0],
      distance: 2,
      colliderId: "wall"
    });
    expect(probe.spherecast?.({ origin: [0, 0, 0], direction: [0, 1, 0] }, 0.5, 2)).toBeNull();
    expect(probe.spherecast?.({ origin: [0, 0, 0], direction: [0, 1, 0] }, 0.5, 3)).toEqual({
      point: [0, 2, 0],
      normal: [0, 1, 0],
      distance: 3,
      colliderId: "ceiling"
    });
    expect(probe.containsPoint?.("room", [0, 0, 0])).toBe(true);
    expect(probe.closestPoint?.("room", [5, 5, 5])).toEqual({ x: 1, y: 0, z: 0 });
  });
});
