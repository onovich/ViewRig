import { evaluateFixedPose, projectPointToNdc } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("target NDC trace", () => {
  it("projects target points into deterministic NDC samples", () => {
    const camera = evaluateFixedPose({
      position: [0, 0, 0],
      rotation: [0, 0, 0, 1],
      lens: { projection: "perspective", fov: 90 }
    });
    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: [0, 0, -2] as const },
        { dt: 0.1, input: [1, 0, -2] as const },
        { dt: 0.1, input: [0, 1, -2] as const }
      ],
      ({ input }) => projectPointToNdc(camera, input)
    );

    expect(trace.map((sample) => sample.output)).toEqual([
      [0, 0],
      [0.5000000000000001, 0],
      [0, 0.5000000000000001]
    ]);
  });
});
