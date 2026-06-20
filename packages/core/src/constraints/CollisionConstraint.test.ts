import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import type { WorldProbe } from "../world/WorldProbe";
import { applyCollisionConstraint } from "./CollisionConstraint";

describe("CollisionConstraint", () => {
  it("pulls camera forward on spherecast hit", () => {
    const probe: WorldProbe = {
      spherecast: () => ({ point: [0, 0, 2], normal: [0, 0, -1], distance: 2 })
    };
    const state = evaluateFixedPose({ position: [0, 0, 5] });
    const resolved = applyCollisionConstraint(state, {
      target: [0, 0, 0],
      probe,
      radius: 0.5,
      minDistance: 1
    });

    expect(resolved.position).toEqual({ x: 0, y: 0, z: 2 });
  });

  it("falls back to unchanged state without probe hit", () => {
    const state = evaluateFixedPose({ position: [0, 0, 5] });

    expect(applyCollisionConstraint(state, { target: [0, 0, 0], radius: 0.5 })).toBe(state);
  });
});
