import { describe, expect, it } from "vitest";
import { createYawPitchChannel } from "../channels/YawPitchChannel";
import { quatRotateVec3 } from "../math/Quat";
import { evaluateFirstPersonRig } from "./FirstPersonRig";

describe("evaluateFirstPersonRig", () => {
  it("places the camera at target plus eye offset", () => {
    const state = evaluateFirstPersonRig({
      target: [1, 0, 2],
      look: { yaw: 0, pitch: 0 },
      eyeOffset: [0, 1.7, 0],
      debugId: "fps"
    }, {
      time: 1
    });

    expect(state.position).toEqual({ x: 1, y: 1.7, z: 2 });
    expect(state.time).toBe(1);
    expect(state.debug).toEqual({ liveCameraId: "fps" });
  });

  it("uses yaw/pitch channel values for camera rotation", () => {
    const look = createYawPitchChannel("look", { yaw: 90, pitch: 0 });
    const state = evaluateFirstPersonRig({
      target: [0, 0, 0],
      look
    });
    const forward = quatRotateVec3(state.rotation, [0, 0, -1]);

    expect(forward.x).toBeCloseTo(-1);
    expect(forward.y).toBeCloseTo(0);
    expect(forward.z).toBeCloseTo(0);
  });
});
