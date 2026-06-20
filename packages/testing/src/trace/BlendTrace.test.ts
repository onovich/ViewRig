import { blendCameraState, evaluateFixedPose } from "@viewrig/core";
import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("blend golden trace", () => {
  it("produces monotonic position samples for a simple CameraState blend", () => {
    const from = evaluateFixedPose({ position: [0, 0, 0] });
    const to = evaluateFixedPose({ position: [10, 0, 0] });
    const trace = runGoldenTrace(
      [
        { dt: 0.25, input: 0.25 },
        { dt: 0.25, input: 0.5 },
        { dt: 0.25, input: 0.75 },
        { dt: 0.25, input: 1 }
      ],
      ({ input }) => blendCameraState(from, to, input)
    );

    expect(trace.map((sample) => sample.output.position.x)).toEqual([2.5, 5, 7.5, 10]);
    expect(trace.map((sample) => sample.time)).toEqual([0.25, 0.5, 0.75, 1]);
  });
});
