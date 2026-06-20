import { describe, expect, it } from "vitest";
import { createFakeTargetTrace } from "./FakeTarget";

describe("createFakeTargetTrace", () => {
  it("snapshots target keyframes without reusing mutable input references", () => {
    const position = { x: 1, y: 2, z: 3 };
    const trace = createFakeTargetTrace([
      { time: 0, position, velocity: [0, 0, 1] }
    ]);

    position.x = 99;

    expect(trace[0]).toEqual({
      time: 0,
      position: { x: 1, y: 2, z: 3 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      velocity: { x: 0, y: 0, z: 1 },
      up: { x: 0, y: 1, z: 0 }
    });
    expect(Object.isFrozen(trace)).toBe(true);
    expect(Object.isFrozen(trace[0])).toBe(true);
  });
});
