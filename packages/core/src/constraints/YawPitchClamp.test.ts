import { describe, expect, it } from "vitest";
import { clampYawPitch } from "./YawPitchClamp";

describe("YawPitchClamp", () => {
  it("clamps yaw and pitch ranges", () => {
    expect(clampYawPitch({ yaw: 200, pitch: -100 }, {
      minYaw: -90,
      maxYaw: 90,
      minPitch: -45,
      maxPitch: 60
    })).toEqual({
      yaw: 90,
      pitch: -45
    });
  });
});
