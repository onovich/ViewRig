import { describe, expect, it } from "vitest";
import { createYawPitchChannel } from "../channels/YawPitchChannel";
import { evaluateOrbitRig } from "./OrbitRig";

describe("evaluateOrbitRig", () => {
  it("places the camera behind the target at yaw/pitch zero", () => {
    const state = evaluateOrbitRig({
      target: [0, 0, 0],
      look: { yaw: 0, pitch: 0 },
      distance: 5
    });

    expect(state.position).toEqual({ x: 0, y: 0, z: 5 });
  });

  it("uses yaw/pitch degrees and pivot offset", () => {
    const state = evaluateOrbitRig({
      target: [1, 0, 0],
      pivotOffset: [0, 1, 0],
      look: { yaw: 90, pitch: 30 },
      distance: 4
    });

    expect(state.position.x).toBeCloseTo(1 + 3.4641016);
    expect(state.position.y).toBeCloseTo(3);
    expect(state.position.z).toBeCloseTo(0);
  });

  it("can read look values from a YawPitchChannel", () => {
    const look = createYawPitchChannel("look", { yaw: 90, pitch: 0 });
    const state = evaluateOrbitRig({
      target: [0, 0, 0],
      look,
      distance: 2,
      debugId: "orbit"
    });

    expect(state.position.x).toBeCloseTo(2);
    expect(state.position.z).toBeCloseTo(0);
    expect(state.debug).toEqual({ liveCameraId: "orbit" });
  });
});
