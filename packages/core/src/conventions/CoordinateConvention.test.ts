import { describe, expect, it } from "vitest";
import {
  DEFAULT_COORDINATE_CONVENTION,
  signedAxisBase,
  signedAxisSign
} from "./CoordinateConvention";

describe("coordinate convention contract", () => {
  it("fixes the M0 default world convention", () => {
    expect(DEFAULT_COORDINATE_CONVENTION).toEqual({
      handedness: "right-handed",
      upAxis: "+y",
      forwardAxis: "-z",
      rightAxis: "+x",
      fovUnit: "degree",
      ndcRange: "-1..1",
      yawPitchRollOrder: "yaw-pitch-roll"
    });
  });

  it("keeps signed axis parsing explicit for adapters", () => {
    expect(signedAxisBase("-z")).toBe("z");
    expect(signedAxisSign("-z")).toBe(-1);
    expect(signedAxisBase("+y")).toBe("y");
    expect(signedAxisSign("+y")).toBe(1);
  });
});
