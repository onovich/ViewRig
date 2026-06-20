import { describe, expect, it } from "vitest";
import { dampNumber, dampVec2, dampVec3, halfLifeAlpha } from "./Damping";

describe("half-life damping", () => {
  it("converts half-life and dt into frame-rate independent alpha", () => {
    expect(halfLifeAlpha(0.5, 0.5)).toBeCloseTo(0.5);
    expect(halfLifeAlpha(0.5, 1)).toBeCloseTo(0.75);
    expect(halfLifeAlpha(0, 1)).toBe(1);
    expect(halfLifeAlpha(0.5, 0)).toBe(0);
  });

  it("damps scalar values with equivalent split-step and single-step results", () => {
    const split = dampNumber(dampNumber(0, 1, 0.5, 0.5), 1, 0.5, 0.5);
    const single = dampNumber(0, 1, 0.5, 1);

    expect(split).toBeCloseTo(0.75);
    expect(single).toBeCloseTo(split);
  });

  it("damps Vec2 and Vec3 values component-wise", () => {
    expect(dampVec2([0, 0], [2, 4], 0.5, 0.5)).toEqual({ x: 1, y: 2 });
    expect(dampVec3([0, 0, 0], [2, 4, 6], 0.5, 0.5)).toEqual({ x: 1, y: 2, z: 3 });
  });

  it("supports object snapshots as vector inputs", () => {
    const current = { x: 0, y: 0, z: 0 };
    const target = { x: 4, y: 8, z: 12 };

    expect(dampVec3(current, target, 0.5, 0.5)).toEqual({ x: 2, y: 4, z: 6 });
  });
});
