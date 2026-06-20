import { describe, expect, it } from "vitest";
import { evaluateOrbitRig } from "../rigs/OrbitRig";
import { toRuntimeCameraPose } from "./RuntimeCameraPoseMapper";

describe("RuntimeCameraPose-compatible mapper", () => {
  it("maps perspective CameraState to a plain runtime pose shape", () => {
    const state = evaluateOrbitRig({
      target: [0, 0, 0],
      look: { yaw: 0, pitch: 0 },
      distance: 4,
      lens: { projection: "perspective", fov: 70, near: 0.2, far: 500 },
      debugId: "orbit"
    }, {
      time: 1
    });

    expect(toRuntimeCameraPose(state)).toEqual({
      position: { x: 0, y: 0, z: 4 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      up: { x: 0, y: 1, z: 0 },
      projection: "perspective",
      fov: 70,
      near: 0.2,
      far: 500,
      time: 1,
      debug: { liveCameraId: "orbit" }
    });
  });
});
