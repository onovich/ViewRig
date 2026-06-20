import { createPolylinePath } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("polyline path golden trace", () => {
  it("outputs deterministic path samples", () => {
    const path = createPolylinePath({
      points: [
        [0, 0, 0],
        [0, 0, -4],
        [4, 0, -4]
      ]
    });
    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: 0 },
        { dt: 0.1, input: 0.5 },
        { dt: 0.1, input: 1 }
      ],
      ({ input }) => path.sampleAtT(input)
    );

    expect(trace.map((sample) => sample.output.position)).toEqual([
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: -4 },
      { x: 4, y: 0, z: -4 }
    ]);
    expect(trace[1]?.output.distance).toBe(4);
  });
});
