import { createYawPitchChannel, evaluateOrbitRig } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("orbit rig golden trace", () => {
  it("outputs deterministic target/yaw/pitch/distance samples", () => {
    const look = createYawPitchChannel("look");
    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: { yaw: 0, pitch: 0 } },
        { dt: 0.1, input: { yaw: 90, pitch: 0 } },
        { dt: 0.1, input: { yaw: 90, pitch: 30 } }
      ],
      ({ input, time }) => {
        look.set(input);
        return evaluateOrbitRig({
          target: [0, 0, 0],
          look,
          distance: 4
        }, {
          time
        });
      }
    );

    expect(trace[0]?.output.position).toEqual({ x: 0, y: 0, z: 4 });
    expect(trace[1]?.output.position.x).toBeCloseTo(4);
    expect(trace[1]?.output.position.z).toBeCloseTo(0);
    expect(trace[2]?.output.position.x).toBeCloseTo(3.4641016);
    expect(trace[2]?.output.position.y).toBeCloseTo(2);
    expect(trace[2]?.output.position.z).toBeCloseTo(0);
  });
});
