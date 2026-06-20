import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { projectPointToNdc } from "./Projection";

describe("projectPointToNdc", () => {
  it("projects points in front of a perspective camera", () => {
    const camera = evaluateFixedPose({
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      lens: { projection: "perspective", fov: 90 }
    });

    expect(projectPointToNdc(camera, [0, 0, -1])).toEqual([0, 0]);
    expect(projectPointToNdc(camera, [1, 1, -1])?.[0]).toBeCloseTo(1);
    expect(projectPointToNdc(camera, [1, 1, -1])?.[1]).toBeCloseTo(1);
    expect(projectPointToNdc(camera, [0, 0, 1])).toBeNull();
  });

  it("projects points for orthographic cameras", () => {
    const camera = evaluateFixedPose({
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      lens: { projection: "orthographic", orthographicSize: 4 }
    });

    expect(projectPointToNdc(camera, [1, 2, -1])).toEqual([0.5, 1]);
  });
});
