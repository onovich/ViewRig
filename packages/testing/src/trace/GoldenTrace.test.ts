import { describe, expect, it } from "vitest";
import { runGoldenTrace } from "./GoldenTrace";

describe("runGoldenTrace", () => {
  it("evaluates deterministic frame samples with accumulated time", () => {
    const trace = runGoldenTrace(
      [
        { dt: 0.1, input: 2, label: "start" },
        { dt: 0.2, input: 3 }
      ],
      ({ input, time }) => input * time
    );

    expect(trace).toEqual([
      { frame: 0, time: 0.1, dt: 0.1, output: 0.2, label: "start" },
      { frame: 1, time: 0.30000000000000004, dt: 0.2, output: 0.9000000000000001 }
    ]);
    expect(Object.isFrozen(trace[0])).toBe(true);
  });
});
