import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "./FixedPoseSolver";

describe("evaluateFixedPose", () => {
  it("outputs a CameraState snapshot from fixed pose config", () => {
    const position = { x: 1, y: 2, z: 3 };
    const state = evaluateFixedPose(
      {
        position,
        rotation: [0, 0, 0, 1],
        debugId: "fixed"
      },
      {
        time: 2,
        tags: ["trace"]
      }
    );

    position.x = 99;

    expect(state.position).toEqual({ x: 1, y: 2, z: 3 });
    expect(state.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(state.time).toBe(2);
    expect(state.debug).toEqual({
      liveCameraId: "fixed",
      tags: ["trace"]
    });
  });

  it("uses default rotation, up, and lens values", () => {
    const state = evaluateFixedPose({ position: [0, 0, 5] });

    expect(state.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(state.up).toEqual({ x: 0, y: 1, z: 0 });
    expect(state.lens).toEqual({
      projection: "perspective",
      fov: 60,
      near: 0.1,
      far: 1000
    });
  });
});
