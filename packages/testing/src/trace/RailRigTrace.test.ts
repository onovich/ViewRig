import { createPolylinePath, evaluateRailRig } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("rail rig golden trace", () => {
  it("outputs deterministic rail rig samples across driver modes", () => {
    const path = createPolylinePath({
      points: [
        [0, 0, 0],
        [0, 0, -4],
        [4, 0, -4]
      ]
    });
    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: { driver: { type: "fixed" as const, t: 0 } } },
        { dt: 0.1, input: { driver: { type: "time" as const, duration: 0.4 } } },
        {
          dt: 0.1,
          input: {
            driver: {
              type: "targetProjection" as const,
              target: [2, 0, -10] as const
            }
          }
        }
      ],
      ({ input, time }) =>
        evaluateRailRig({
          path,
          driver: input.driver,
          debugId: "rail-trace"
        }, {
          time
        })
    );

    expect(trace.map((sample) => sample.output.position)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -4 },
      { x: 2, y: 0, z: -4 }
    ]);
    expect(trace[2]?.output.debug?.metadata).toEqual({
      railT: 0.75,
      railDistance: 6,
      driver: "targetProjection"
    });
  });
});
