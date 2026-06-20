import { safeClosestPoint, safeContainsPoint, safeRaycast } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { createFakeWorldProbe } from "./FakeWorldProbe";

describe("fake WorldProbe fallback integration", () => {
  it("can be passed through safe WorldProbe helpers", () => {
    const probe = createFakeWorldProbe({
      rayHits: [
        { point: [0, 0, -1], normal: [0, 1, 0], distance: 1 }
      ],
      volumes: {
        room: { contains: false, closestPoint: [1, 0, 0] }
      }
    });

    expect(safeRaycast(probe, { origin: [0, 0, 0], direction: [0, 0, -1] }, 2)?.distance).toBe(1);
    expect(safeContainsPoint(probe, "room", [5, 0, 0])).toBe(false);
    expect(safeClosestPoint(probe, "room", [5, 0, 0])).toEqual({ x: 1, y: 0, z: 0 });
  });
});
