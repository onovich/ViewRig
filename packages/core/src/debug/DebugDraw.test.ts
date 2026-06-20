import { describe, expect, it } from "vitest";
import { rectCenter } from "../composer/RectNdc";
import { evaluateFixedPose } from "../rigs/FixedPoseSolver";
import { createCameraDebugFrame } from "./DebugDraw";

describe("debug draw model", () => {
  it("creates renderer-agnostic debug frames", () => {
    const state = evaluateFixedPose({
      position: [0, 0, 0],
      debugId: "debug-camera"
    });
    const frame = createCameraDebugFrame(state, [
      { type: "point3", position: [0, 1, 0], color: "#fff", label: "target" },
      { type: "rectNdc", rect: rectCenter(0.5, 0.5), color: "#0f0" }
    ]);

    expect(frame.metadata).toEqual({ liveCameraId: "debug-camera" });
    expect(frame.draw).toHaveLength(2);
    expect(Object.isFrozen(frame)).toBe(true);
    expect(Object.isFrozen(frame.draw)).toBe(true);
  });
});
