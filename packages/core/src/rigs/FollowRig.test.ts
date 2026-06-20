import { describe, expect, it } from "vitest";
import { evaluateFollowRig } from "./FollowRig";

describe("evaluateFollowRig", () => {
  it("places the camera at target position plus world offset", () => {
    const state = evaluateFollowRig({
      target: {
        position: [1, 2, 3],
        rotation: [0, 0, 0, 1]
      },
      offset: [0, 1, -4],
      debugId: "follow"
    }, {
      time: 1
    });

    expect(state.position).toEqual({ x: 1, y: 3, z: -1 });
    expect(state.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(state.time).toBe(1);
    expect(state.debug).toEqual({ liveCameraId: "follow" });
  });

  it("uses identity rotation and default lens when target rotation is absent", () => {
    const state = evaluateFollowRig({
      target: {
        position: [0, 0, 0]
      }
    });

    expect(state.rotation).toEqual({ x: 0, y: 0, z: 0, w: 1 });
    expect(state.lens).toEqual({
      projection: "perspective",
      fov: 60,
      near: 0.1,
      far: 1000
    });
  });
});
