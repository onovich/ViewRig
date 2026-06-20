import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { applyConfiner3D } from "./Confiner3D";

describe("Confiner3D", () => {
  it("clamps camera position inside a 3D AABB", () => {
    const state = evaluateFixedPose({ position: [5, -5, 2] });
    const confined = applyConfiner3D(state, {
      aabb: {
        min: [0, 0, 0],
        max: [3, 4, 1]
      }
    });

    expect(confined.position).toEqual({ x: 3, y: 0, z: 1 });
  });
});
