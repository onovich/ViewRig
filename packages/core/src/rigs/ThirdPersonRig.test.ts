import { describe, expect, it } from "vitest";
import { createYawPitchChannel } from "../channels/YawPitchChannel";
import { evaluateThirdPersonRig } from "./ThirdPersonRig";

describe("evaluateThirdPersonRig", () => {
  it("uses target pivot offset and distance", () => {
    const state = evaluateThirdPersonRig({
      target: [1, 0, 2],
      look: { yaw: 0, pitch: 0 },
      distance: 4,
      pivotOffset: [0, 1.5, 0]
    });

    expect(state.position).toEqual({ x: 1, y: 1.5, z: 6 });
  });

  it("responds to yaw and pitch channel values", () => {
    const look = createYawPitchChannel("look", { yaw: 90, pitch: 30 });
    const state = evaluateThirdPersonRig({
      target: [0, 0, 0],
      look,
      distance: 4,
      debugId: "third-person"
    });

    expect(state.position.x).toBeCloseTo(3.4641016);
    expect(state.position.y).toBeCloseTo(3.5);
    expect(state.position.z).toBeCloseTo(0);
    expect(state.debug).toEqual({ liveCameraId: "third-person" });
  });
});
