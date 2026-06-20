import { describe, expect, it } from "vitest";
import {
  vec3,
  vec3Add,
  vec3Cross,
  vec3Distance,
  vec3Dot,
  vec3Length,
  vec3LengthSq,
  vec3Lerp,
  vec3Normalize,
  vec3Scale,
  vec3Sub
} from "./Vec3";

describe("Vec3 math", () => {
  it("creates frozen snapshots", () => {
    const value = vec3(1, 2, 3);

    expect(value).toEqual({ x: 1, y: 2, z: 3 });
    expect(Object.isFrozen(value)).toBe(true);
  });

  it("supports scalar and vector operations", () => {
    expect(vec3Add([1, 2, 3], [4, 5, 6])).toEqual({ x: 5, y: 7, z: 9 });
    expect(vec3Sub([4, 5, 6], [1, 2, 3])).toEqual({ x: 3, y: 3, z: 3 });
    expect(vec3Scale([1, -2, 3], 3)).toEqual({ x: 3, y: -6, z: 9 });
    expect(vec3Dot([1, 2, 3], [4, 5, 6])).toBe(32);
    expect(vec3LengthSq([2, 3, 6])).toBe(49);
    expect(vec3Length([2, 3, 6])).toBe(7);
    expect(vec3Distance([1, 1, 1], [1, 4, 5])).toBe(5);
  });

  it("uses the right-handed cross product convention", () => {
    expect(vec3Cross([1, 0, 0], [0, 1, 0])).toEqual({ x: 0, y: 0, z: 1 });
  });

  it("normalizes and interpolates", () => {
    const normalized = vec3Normalize([0, 3, 4]);

    expect(normalized.x).toBeCloseTo(0);
    expect(normalized.y).toBeCloseTo(0.6);
    expect(normalized.z).toBeCloseTo(0.8);
    expect(vec3Normalize([0, 0, 0], [0, 1, 0])).toEqual({ x: 0, y: 1, z: 0 });
    expect(vec3Lerp([0, 0, 0], [10, 20, 30], 0.25)).toEqual({ x: 2.5, y: 5, z: 7.5 });
  });
});
