import {
  CameraBrain,
  createVirtualCamera,
  createYawPitchChannel,
  evaluateFirstPersonRig,
  evaluateThirdPersonRig,
  quatRotateVec3
} from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("FPS/TPS switch trace", () => {
  it("keeps yaw/pitch continuous when switching rigs through a shared channel", () => {
    const look = createYawPitchChannel("look", {
      yaw: 45,
      pitch: -10
    });
    const brain = new CameraBrain();

    brain.add(createVirtualCamera({
      id: "third",
      evaluate: ({ time }) => evaluateThirdPersonRig({
        target: [0, 0, 0],
        look,
        distance: 4
      }, {
        time
      })
    }));
    brain.add(createVirtualCamera({
      id: "first",
      evaluate: ({ time }) => evaluateFirstPersonRig({
        target: [0, 0, 0],
        look,
        eyeOffset: [0, 1.65, 0]
      }, {
        time
      })
    }));

    const trace = runGoldenTrace(
      [
        { dt: 0.016, input: "third" },
        { dt: 0.016, input: "first" }
      ],
      ({ input, dt, time }) => {
        brain.activate(input, {
          transition: input === "first" ? "matchThenBlend" : "cut",
          blend: { duration: 0 }
        });
        return brain.update({ dt, time });
      }
    );

    const thirdForward = quatRotateVec3(trace[0]?.output?.rotation ?? [0, 0, 0, 1], [0, 0, -1]);
    const firstForward = quatRotateVec3(trace[1]?.output?.rotation ?? [0, 0, 0, 1], [0, 0, -1]);

    expect(trace[0]?.output?.position.z).toBeGreaterThan(0);
    expect(trace[1]?.output?.position).toEqual({ x: 0, y: 1.65, z: 0 });
    expect(firstForward.x).toBeCloseTo(thirdForward.x);
    expect(firstForward.y).toBeCloseTo(thirdForward.y);
    expect(firstForward.z).toBeCloseTo(thirdForward.z);
  });
});
