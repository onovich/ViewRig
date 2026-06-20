import { describe, expect, it } from "vitest";
import { createCameraState } from "./CameraState";

describe("CameraState contract", () => {
  it("creates a frozen public state snapshot", () => {
    const position = { x: 1, y: 2, z: 3 };
    const state = createCameraState({
      position,
      rotation: [0, 0, 0, 1],
      debug: {
        liveCameraId: "intro",
        tags: ["m0"],
        metadata: { phase: "contract" }
      }
    });

    position.x = 99;

    expect(state.position).toEqual({ x: 1, y: 2, z: 3 });
    expect(state.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(state.up).toEqual({ x: 0, y: 1, z: 0 });
    expect(state.lens).toEqual({
      projection: "perspective",
      fov: 60,
      near: 0.1,
      far: 1000
    });
    expect(state.time).toBe(0);
    expect(state.debug?.tags).toEqual(["m0"]);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.position)).toBe(true);
  });

  it("allows explicit orthographic lens and time snapshots", () => {
    const state = createCameraState({
      position: [0, 0, 5],
      rotation: [0, 0, 0, 1],
      lens: { projection: "orthographic", orthographicSize: 12 },
      time: 1.25
    });

    expect(state.lens).toEqual({ projection: "orthographic", orthographicSize: 12 });
    expect(state.time).toBe(1.25);
  });
});
