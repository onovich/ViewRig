import {
  createFirstPersonGameplayPreset,
  createPolylinePath,
  createRailShotPreset,
  createYawPitchChannel,
  quatRotateVec3
} from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("first-person and rail-shot preset traces", () => {
  it("keeps first-person look samples deterministic", () => {
    const look = createYawPitchChannel("look");
    const preset = createFirstPersonGameplayPreset({
      target: [0, 0, 0],
      look
    });

    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: { yaw: 0, pitch: 0 } },
        { dt: 0.1, input: { yaw: 90, pitch: 0 } },
        { dt: 0.1, input: { yaw: 90, pitch: 30 } }
      ],
      ({ input, time }) => {
        look.set(input);
        return preset.evaluate({ time });
      }
    );

    const forward = quatRotateVec3(trace[2]?.output.state.rotation ?? [0, 0, 0, 1], [0, 0, -1]);

    expect(trace.map((sample) => sample.output.state.position)).toEqual([
      { x: 0, y: 1.65, z: 0 },
      { x: 0, y: 1.65, z: 0 },
      { x: 0, y: 1.65, z: 0 }
    ]);
    expect(forward.x).toBeCloseTo(-0.8660254);
    expect(forward.y).toBeCloseTo(0.5);
    expect(forward.z).toBeCloseTo(0);
  });

  it("keeps rail-shot time samples deterministic for CameraShot preview", () => {
    const path = createPolylinePath({
      points: [
        [0, 0, 0],
        [0, 0, -4],
        [4, 0, -4]
      ]
    });
    const preset = createRailShotPreset({
      path,
      driver: {
        type: "time",
        duration: 0.4
      }
    });

    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: null },
        { dt: 0.1, input: null },
        { dt: 0.1, input: null }
      ],
      ({ time }) => preset.evaluate({ time })
    );

    expect(trace[0]?.output.state.position).toEqual({ x: 0, y: 0, z: -2 });
    expect(trace[1]?.output.state.position).toEqual({ x: 0, y: 0, z: -4 });
    expect(trace[2]?.output.state.position.x).toBeCloseTo(2);
    expect(trace[2]?.output.state.position.y).toBe(0);
    expect(trace[2]?.output.state.position.z).toBe(-4);
    expect(trace[2]?.output.debug.metadata.driver).toBe("time");
    expect(trace[2]?.output.debug.tuning.map((control) => control.id)).toEqual(["driver", "railT", "duration"]);
  });
});
