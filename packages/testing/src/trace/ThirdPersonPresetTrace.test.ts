import { createShoulderChannel, createThirdPersonGameplayPreset, createYawPitchChannel } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("third-person gameplay preset golden trace", () => {
  it("outputs deterministic yaw/pitch/shoulder samples through the preset layer", () => {
    const look = createYawPitchChannel("look");
    const shoulder = createShoulderChannel("shoulder");
    const preset = createThirdPersonGameplayPreset({
      id: "player-camera",
      target: [0, 0, 0],
      look,
      shoulder,
      distance: 4
    });

    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: { yaw: 0, pitch: 0, shoulder: 1 }, label: "behind-right" },
        { dt: 0.1, input: { yaw: 90, pitch: 0, shoulder: 1 }, label: "side-right" },
        { dt: 0.1, input: { yaw: 90, pitch: 30, shoulder: -1 }, label: "side-left-high" }
      ],
      ({ input, time }) => {
        look.set({
          yaw: input.yaw,
          pitch: input.pitch
        });
        shoulder.set(input.shoulder);

        return preset.evaluate({ time });
      }
    );

    expect(trace[0]?.label).toBe("behind-right");
    expect(trace[0]?.output.state.position).toEqual({ x: 0.45, y: 1.55, z: 4 });
    expect(trace[1]?.output.state.position.x).toBeCloseTo(4.45);
    expect(trace[1]?.output.state.position.y).toBeCloseTo(1.55);
    expect(trace[1]?.output.state.position.z).toBeCloseTo(0);
    expect(trace[2]?.output.state.position.x).toBeCloseTo(3.0141016);
    expect(trace[2]?.output.state.position.y).toBeCloseTo(3.45);
    expect(trace[2]?.output.state.position.z).toBeCloseTo(0);
    expect(trace[2]?.output.debug.metadata.shoulder).toBe(-1);
    expect(trace[2]?.output.debug.tuning.map((control) => control.id)).toEqual(["distance", "shoulder"]);
  });
});
