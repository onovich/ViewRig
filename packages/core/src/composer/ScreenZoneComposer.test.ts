import { describe, expect, it } from "vitest";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { rectCenter } from "./RectNdc";
import { evaluateScreenZoneComposer } from "./ScreenZoneComposer";

const camera = evaluateFixedPose({
  position: [0, 0, 0],
  rotation: [0, 0, 0, 1],
  lens: { projection: "perspective", fov: 90 }
});

const config = {
  mode: "aim" as const,
  dead: rectCenter(0.2, 0.2),
  soft: rectCenter(0.8, 0.8),
  hard: rectCenter(1.6, 1.6)
};

describe("ScreenZoneComposer", () => {
  it("leaves targets inside the dead zone alone", () => {
    expect(evaluateScreenZoneComposer(camera, [0, 0, -2], config)).toEqual({
      kind: "dead",
      targetNdc: [0, 0],
      correctionTargetNdc: [0, 0]
    });
  });

  it("classifies soft and hard corrections", () => {
    expect(evaluateScreenZoneComposer(camera, [0.5, 0, -2], config)).toEqual({
      kind: "soft",
      targetNdc: [0.25000000000000006, 0],
      correctionTargetNdc: [0.1, 0]
    });
    expect(evaluateScreenZoneComposer(camera, [1.2, 0, -2], config)).toEqual({
      kind: "hard",
      targetNdc: [0.6000000000000001, 0],
      correctionTargetNdc: [0.4, 0]
    });
  });

  it("classifies targets outside hard bounds and behind the camera", () => {
    expect(evaluateScreenZoneComposer(camera, [2, 0, -1], config).kind).toBe("outside");
    expect(evaluateScreenZoneComposer(camera, [0, 0, 1], config)).toEqual({
      kind: "behind",
      targetNdc: null,
      correctionTargetNdc: null
    });
  });
});
