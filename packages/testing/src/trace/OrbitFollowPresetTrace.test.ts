import {
  createFollowShowcasePreset,
  createOrbitShowcasePreset,
  createYawPitchChannel,
  createZoomChannel
} from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("orbit/follow showcase preset traces", () => {
  it("outputs deterministic orbit samples from normalized look and distance channels", () => {
    const look = createYawPitchChannel("look");
    const distance = createZoomChannel("distance", {
      value: 5,
      min: 2,
      max: 10
    });
    const preset = createOrbitShowcasePreset({
      target: [0, 0, 0],
      look,
      distance
    });

    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: { yaw: 0, pitch: 0, distance: 5 } },
        { dt: 0.1, input: { yaw: 90, pitch: 0, distance: 6 } },
        { dt: 0.1, input: { yaw: 90, pitch: 30, distance: 4 } }
      ],
      ({ input, time }) => {
        look.set({
          yaw: input.yaw,
          pitch: input.pitch
        });
        distance.set(input.distance);

        return preset.evaluate({ time });
      }
    );

    expect(trace[0]?.output.state.position).toEqual({ x: 0, y: 1, z: 5 });
    expect(trace[1]?.output.state.position.x).toBeCloseTo(6);
    expect(trace[1]?.output.debug.metadata.distance).toBe(6);
    expect(trace[2]?.output.state.position.x).toBeCloseTo(3.4641016);
    expect(trace[2]?.output.state.position.y).toBeCloseTo(3);
    expect(trace[2]?.output.state.position.z).toBeCloseTo(0);
  });

  it("outputs deterministic follow samples from resolved target snapshots", () => {
    const target = {
      position: [0, 0, 0] as [number, number, number]
    };
    const preset = createFollowShowcasePreset({
      target,
      offset: [0, 2, -6]
    });

    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: [0, 0, 0] as [number, number, number] },
        { dt: 0.1, input: [1, 0, 0] as [number, number, number] },
        { dt: 0.1, input: [1, 0, 2] as [number, number, number] }
      ],
      ({ input, time }) => {
        target.position = input;
        return preset.evaluate({ time });
      }
    );

    expect(trace[0]?.output.state.position).toEqual({ x: 0, y: 2, z: -6 });
    expect(trace[1]?.output.state.position).toEqual({ x: 1, y: 2, z: -6 });
    expect(trace[2]?.output.state.position).toEqual({ x: 1, y: 2, z: -4 });
    expect(trace[2]?.output.debug.tags).toEqual(["preset", "follow", "showcase"]);
  });
});
