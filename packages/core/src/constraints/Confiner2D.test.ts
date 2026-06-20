import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { applyConfiner2D } from "./Confiner2D";

describe("Confiner2D", () => {
  it("clamps camera position on the xy plane", () => {
    const state = evaluateFixedPose({ position: [5, -5, 2] });
    const confined = applyConfiner2D(state, {
      plane: "xy",
      aabb: { min: [0, 0], max: [3, 4] }
    });

    expect(confined.position).toEqual({ x: 3, y: 0, z: 2 });
  });

  it("clamps camera position on the xz plane", () => {
    const state = evaluateFixedPose({ position: [5, 2, -5] });
    const confined = applyConfiner2D(state, {
      plane: "xz",
      aabb: { min: [0, 0], max: [3, 4] }
    });

    expect(confined.position).toEqual({ x: 3, y: 2, z: 0 });
  });
});
