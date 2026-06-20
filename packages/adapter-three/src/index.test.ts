import { evaluateFixedPose } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { applyThreeCameraState, type ThreeCameraLike } from "./index";

function createFakeCamera(): ThreeCameraLike & {
  positionValue: number[];
  quaternionValue: number[];
  projectionUpdates: number;
} {
  const camera = {
    positionValue: [0, 0, 0],
    quaternionValue: [0, 0, 0, 1],
    projectionUpdates: 0,
    position: {
      set: (x: number, y: number, z: number) => {
        camera.positionValue = [x, y, z];
      }
    },
    quaternion: {
      set: (x: number, y: number, z: number, w: number) => {
        camera.quaternionValue = [x, y, z, w];
      }
    },
    updateProjectionMatrix: () => {
      camera.projectionUpdates += 1;
    }
  };

  return camera;
}

describe("applyThreeCameraState", () => {
  it("writes CameraState into a Three-like camera", () => {
    const camera = createFakeCamera();
    const state = evaluateFixedPose({
      position: [1, 2, 3],
      rotation: [0, 0, 0, 1],
      lens: { projection: "perspective", fov: 70, near: 0.2, far: 500 }
    });

    applyThreeCameraState(camera, state);

    expect(camera.positionValue).toEqual([1, 2, 3]);
    expect(camera.quaternionValue).toEqual([0, 0, 0, 1]);
    expect(camera.fov).toBe(70);
    expect(camera.near).toBe(0.2);
    expect(camera.far).toBe(500);
    expect(camera.projectionUpdates).toBe(1);
  });
});
