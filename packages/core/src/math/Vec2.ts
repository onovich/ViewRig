import { snapshotVec2, type Vec2Like, type Vec2Snapshot } from "../state/SnapshotTypes.js";

export type Vec2 = Vec2Snapshot;

export function vec2(x = 0, y = 0): Vec2 {
  return snapshotVec2([x, y]);
}

export function vec2Add(a: Vec2Like, b: Vec2Like): Vec2 {
  const av = snapshotVec2(a);
  const bv = snapshotVec2(b);
  return vec2(av.x + bv.x, av.y + bv.y);
}

export function vec2Sub(a: Vec2Like, b: Vec2Like): Vec2 {
  const av = snapshotVec2(a);
  const bv = snapshotVec2(b);
  return vec2(av.x - bv.x, av.y - bv.y);
}

export function vec2Scale(value: Vec2Like, scale: number): Vec2 {
  const v = snapshotVec2(value);
  return vec2(v.x * scale, v.y * scale);
}

export function vec2Dot(a: Vec2Like, b: Vec2Like): number {
  const av = snapshotVec2(a);
  const bv = snapshotVec2(b);
  return av.x * bv.x + av.y * bv.y;
}

export function vec2LengthSq(value: Vec2Like): number {
  return vec2Dot(value, value);
}

export function vec2Length(value: Vec2Like): number {
  return Math.sqrt(vec2LengthSq(value));
}

export function vec2Normalize(value: Vec2Like, fallback: Vec2Like = [0, 0]): Vec2 {
  const length = vec2Length(value);
  if (length <= Number.EPSILON) {
    return snapshotVec2(fallback);
  }

  return vec2Scale(value, 1 / length);
}
