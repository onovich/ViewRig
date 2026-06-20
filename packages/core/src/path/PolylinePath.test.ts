import { describe, expect, it } from "vitest";
import { createPolylinePath } from "./PolylinePath";

describe("PolylinePath", () => {
  it("samples along segment distance", () => {
    const path = createPolylinePath({
      points: [
        [0, 0, 0],
        [3, 0, 0],
        [3, 4, 0]
      ]
    });

    expect(path.length).toBe(7);
    expect(path.segmentLengths).toEqual([3, 4]);
    expect(path.cumulativeDistances).toEqual([0, 3, 7]);

    const sample = path.sampleAtDistance(5);
    expect(sample.position).toEqual({ x: 3, y: 2, z: 0 });
    expect(sample.tangent).toEqual({ x: 0, y: 1, z: 0 });
    expect(sample.t).toBeCloseTo(5 / 7);
    expect(sample.distance).toBe(5);
  });

  it("samples by normalized t and clamps outside values", () => {
    const path = createPolylinePath({
      points: [
        [0, 0, 0],
        [0, 0, -10]
      ],
      up: [0, 1, 0]
    });

    expect(path.sampleAtT(0.25).position).toEqual({ x: 0, y: 0, z: -2.5 });
    expect(path.sampleAtT(2).position).toEqual({ x: 0, y: 0, z: -10 });
    expect(path.sampleAtDistance(-5).position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("handles a single-point path with stable defaults", () => {
    const path = createPolylinePath({ points: [[1, 2, 3]] });
    const sample = path.sampleAtT(0.5);

    expect(path.length).toBe(0);
    expect(sample).toEqual({
      position: { x: 1, y: 2, z: 3 },
      tangent: { x: 0, y: 0, z: -1 },
      up: { x: 0, y: 1, z: 0 },
      t: 0,
      distance: 0
    });
  });

  it("rejects empty paths", () => {
    expect(() => createPolylinePath({ points: [] })).toThrow("at least one point");
  });
});
