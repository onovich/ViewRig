import { evaluateFixedPose } from "@viewrig/core";
import { OrthographicCamera, PerspectiveCamera } from "three";
import { describe, expect, it, vi } from "vitest";
import { applyThreeCameraState } from "./index";

describe("applyThreeCameraState Three integration", () => {
  it("writes a CameraState into a real PerspectiveCamera", () => {
    const camera = new PerspectiveCamera(50, 16 / 9, 0.1, 1000);
    const updateProjectionMatrix = vi.spyOn(camera, "updateProjectionMatrix");
    const state = evaluateFixedPose({
      position: [1, 2, 3],
      rotation: [0, 0.3826834323650898, 0, 0.9238795325112867],
      lens: { projection: "perspective", fov: 70, near: 0.2, far: 500 }
    });

    applyThreeCameraState(camera, state);

    expect(camera.position.toArray()).toEqual([1, 2, 3]);
    expect(camera.quaternion.toArray()).toEqual([0, 0.3826834323650898, 0, 0.9238795325112867]);
    expect(camera.fov).toBe(70);
    expect(camera.near).toBe(0.2);
    expect(camera.far).toBe(500);
    expect(updateProjectionMatrix).toHaveBeenCalledTimes(1);
  });

  it("writes an orthographic CameraState into a real OrthographicCamera", () => {
    const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    const updateProjectionMatrix = vi.spyOn(camera, "updateProjectionMatrix");
    const state = evaluateFixedPose({
      position: [-1, 4, 8],
      rotation: [0, 0, 0, 1],
      lens: { projection: "orthographic", orthographicSize: 4, near: 0.5, far: 80 }
    });

    applyThreeCameraState(camera, state);

    expect(camera.position.toArray()).toEqual([-1, 4, 8]);
    expect(camera.quaternion.toArray()).toEqual([0, 0, 0, 1]);
    expect(camera.zoom).toBe(0.25);
    expect(camera.near).toBe(0.5);
    expect(camera.far).toBe(80);
    expect(updateProjectionMatrix).toHaveBeenCalledTimes(1);
  });
});
