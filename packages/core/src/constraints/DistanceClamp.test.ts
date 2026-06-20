import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { applyDistanceClamp } from "./DistanceClamp";

describe("DistanceClamp", () => {
  it("pulls camera inside max distance", () => {
    const state = evaluateFixedPose({ position: [0, 0, 10] });
    const clamped = applyDistanceClamp(state, {
      target: [0, 0, 0],
      maxDistance: 4
    });

    expect(clamped.position).toEqual({ x: 0, y: 0, z: 4 });
  });

  it("pushes camera outside min distance", () => {
    const state = evaluateFixedPose({ position: [0, 0, 1] });
    const clamped = applyDistanceClamp(state, {
      target: [0, 0, 0],
      minDistance: 2
    });

    expect(clamped.position).toEqual({ x: 0, y: 0, z: 2 });
  });
});
