import { snapshotVec2, snapshotVec3, type Vec2Like, type Vec3Like } from "../state/SnapshotTypes.js";
import { vec2, type Vec2 } from "./Vec2.js";
import { vec3, type Vec3 } from "./Vec3.js";

export function halfLifeAlpha(halfLife: number, dt: number): number {
  if (halfLife <= 0) {
    return 1;
  }

  if (dt <= 0) {
    return 0;
  }

  return 1 - Math.pow(0.5, dt / halfLife);
}

export function dampNumber(current: number, target: number, halfLife: number, dt: number): number {
  const alpha = halfLifeAlpha(halfLife, dt);
  return current + (target - current) * alpha;
}

export function dampVec2(current: Vec2Like, target: Vec2Like, halfLife: number, dt: number): Vec2 {
  const alpha = halfLifeAlpha(halfLife, dt);
  const c = snapshotVec2(current);
  const t = snapshotVec2(target);
  return vec2(
    c.x + (t.x - c.x) * alpha,
    c.y + (t.y - c.y) * alpha
  );
}

export function dampVec3(current: Vec3Like, target: Vec3Like, halfLife: number, dt: number): Vec3 {
  const alpha = halfLifeAlpha(halfLife, dt);
  const c = snapshotVec3(current);
  const t = snapshotVec3(target);

  return vec3(
    c.x + (t.x - c.x) * alpha,
    c.y + (t.y - c.y) * alpha,
    c.z + (t.z - c.z) * alpha
  );
}
