import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import type { WorldProbe } from "../world/WorldProbe";
import { applyOcclusionConstraint } from "./OcclusionConstraint";

describe("OcclusionConstraint", () => {
  it("pulls camera forward on raycast hit", () => {
    const probe: WorldProbe = {
      raycast: () => ({ point: [0, 0, 3], normal: [0, 0, -1], distance: 3 })
    };
    const state = evaluateFixedPose({ position: [0, 0, 5] });
    const resolved = applyOcclusionConstraint(state, {
      target: [0, 0, 0],
      probe,
      minDistance: 1
    });

    expect(resolved.position).toEqual({ x: 0, y: 0, z: 3 });
  });

  it("falls back to unchanged state without probe hit", () => {
    const state = evaluateFixedPose({ position: [0, 0, 5] });

    expect(applyOcclusionConstraint(state, { target: [0, 0, 0] })).toBe(state);
  });
});
