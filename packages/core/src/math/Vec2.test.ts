import { describe, expect, it } from "vitest";
import {
  vec2,
  vec2Add,
  vec2Dot,
  vec2Length,
  vec2LengthSq,
  vec2Normalize,
  vec2Scale,
  vec2Sub
} from "./Vec2";

describe("Vec2 math", () => {
  it("creates frozen snapshots", () => {
    const value = vec2(1, 2);

    expect(value).toEqual({ x: 1, y: 2 });
    expect(Object.isFrozen(value)).toBe(true);
  });

  it("supports basic operations", () => {
    expect(vec2Add([1, 2], [3, 4])).toEqual({ x: 4, y: 6 });
    expect(vec2Sub([5, 4], [2, 1])).toEqual({ x: 3, y: 3 });
    expect(vec2Scale([2, -3], 2)).toEqual({ x: 4, y: -6 });
    expect(vec2Dot([2, 3], [4, 5])).toBe(23);
    expect(vec2LengthSq([3, 4])).toBe(25);
    expect(vec2Length([3, 4])).toBe(5);
  });

  it("normalizes with an explicit zero fallback", () => {
    const normalized = vec2Normalize([3, 4]);

    expect(normalized.x).toBeCloseTo(0.6);
    expect(normalized.y).toBeCloseTo(0.8);
    expect(vec2Normalize([0, 0], [1, 0])).toEqual({ x: 1, y: 0 });
  });
});
