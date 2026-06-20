import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { createVirtualCamera, evaluateVirtualCamera, isVirtualCameraEnabled } from "./VirtualCamera";

describe("VirtualCamera pipeline skeleton", () => {
  it("creates frozen virtual camera definitions", () => {
    const camera = createVirtualCamera({
      id: "fixed",
      priority: 10,
      evaluate: ({ time }) => evaluateFixedPose({ position: [0, 1, 2] }, { time })
    });

    expect(camera.id).toBe("fixed");
    expect(camera.priority).toBe(10);
    expect(Object.isFrozen(camera)).toBe(true);
  });

  it("evaluates enabled cameras with the frame context", () => {
    const camera = createVirtualCamera({
      id: "fixed",
      evaluate: ({ time }) => evaluateFixedPose({ position: [1, 2, 3] }, { time })
    });

    const state = evaluateVirtualCamera(camera, { dt: 0.016, time: 1 });

    expect(state?.position).toEqual({ x: 1, y: 2, z: 3 });
    expect(state?.time).toBe(1);
  });

  it("skips disabled cameras", () => {
    const camera = createVirtualCamera({
      id: "disabled",
      enabled: false,
      evaluate: () => evaluateFixedPose({ position: [1, 2, 3] })
    });

    expect(isVirtualCameraEnabled(camera)).toBe(false);
    expect(evaluateVirtualCamera(camera, { dt: 0.016, time: 0 })).toBeNull();
  });
});
