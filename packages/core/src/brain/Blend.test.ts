import { describe, expect, it } from "vitest";
import { quatFromAxisAngle } from "../math/Quat";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { applyBlendCurve, blendCameraState, blendProgress } from "./Blend";

describe("CameraState blend", () => {
  it("computes linear and smoothstep progress", () => {
    expect(blendProgress(0.5, { duration: 1 })).toBe(0.5);
    expect(blendProgress(2, { duration: 1 })).toBe(1);
    expect(blendProgress(0, { duration: 0 })).toBe(1);
    expect(applyBlendCurve(0.5, "smoothstep")).toBe(0.5);
  });

  it("interpolates position, rotation, lens, up, and time", () => {
    const from = evaluateFixedPose({
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      lens: { projection: "perspective", fov: 60, near: 0.1, far: 100 }
    }, {
      time: 0
    });
    const to = evaluateFixedPose({
      position: [10, 0, 0],
      rotation: quatFromAxisAngle([0, 1, 0], Math.PI),
      lens: { projection: "perspective", fov: 90, near: 0.2, far: 200 }
    }, {
      time: 2
    });

    const middle = blendCameraState(from, to, 0.5);

    expect(middle.position).toEqual({ x: 5, y: 0, z: 0 });
    expect(middle.rotation.y).toBeCloseTo(0.707106);
    expect(middle.rotation.w).toBeCloseTo(0.707106);
    expect(middle.lens).toEqual({
      projection: "perspective",
      fov: 75,
      near: 0.15000000000000002,
      far: 150
    });
    expect(middle.time).toBe(1);
  });

  it("keeps source lens until projection switches complete", () => {
    const from = evaluateFixedPose({
      position: [0, 0, 0],
      lens: { projection: "perspective", fov: 60 }
    });
    const to = evaluateFixedPose({
      position: [0, 0, 0],
      lens: { projection: "orthographic", orthographicSize: 10 }
    });

    expect(blendCameraState(from, to, 0.5).lens).toEqual({ projection: "perspective", fov: 60 });
    expect(blendCameraState(from, to, 1).lens).toEqual({ projection: "orthographic", orthographicSize: 10 });
  });
});
