import { snapshotVec3, type Vec3Like, type Vec3Snapshot } from "../state/SnapshotTypes";

export type Vec3 = Vec3Snapshot;

export function vec3(x = 0, y = 0, z = 0): Vec3 {
  return snapshotVec3([x, y, z]);
}

export function vec3Add(a: Vec3Like, b: Vec3Like): Vec3 {
  const av = snapshotVec3(a);
  const bv = snapshotVec3(b);
  return vec3(av.x + bv.x, av.y + bv.y, av.z + bv.z);
}

export function vec3Sub(a: Vec3Like, b: Vec3Like): Vec3 {
  const av = snapshotVec3(a);
  const bv = snapshotVec3(b);
  return vec3(av.x - bv.x, av.y - bv.y, av.z - bv.z);
}

export function vec3Scale(value: Vec3Like, scale: number): Vec3 {
  const v = snapshotVec3(value);
  return vec3(v.x * scale, v.y * scale, v.z * scale);
}

export function vec3Dot(a: Vec3Like, b: Vec3Like): number {
  const av = snapshotVec3(a);
  const bv = snapshotVec3(b);
  return av.x * bv.x + av.y * bv.y + av.z * bv.z;
}

export function vec3Cross(a: Vec3Like, b: Vec3Like): Vec3 {
  const av = snapshotVec3(a);
  const bv = snapshotVec3(b);
  return vec3(
    av.y * bv.z - av.z * bv.y,
    av.z * bv.x - av.x * bv.z,
    av.x * bv.y - av.y * bv.x
  );
}

export function vec3LengthSq(value: Vec3Like): number {
  return vec3Dot(value, value);
}

export function vec3Length(value: Vec3Like): number {
  return Math.sqrt(vec3LengthSq(value));
}

export function vec3Distance(a: Vec3Like, b: Vec3Like): number {
  return vec3Length(vec3Sub(a, b));
}

export function vec3Normalize(value: Vec3Like, fallback: Vec3Like = [0, 0, 0]): Vec3 {
  const length = vec3Length(value);
  if (length <= Number.EPSILON) {
    return snapshotVec3(fallback);
  }

  return vec3Scale(value, 1 / length);
}

export function vec3Lerp(a: Vec3Like, b: Vec3Like, t: number): Vec3 {
  const av = snapshotVec3(a);
  const bv = snapshotVec3(b);
  return vec3(
    av.x + (bv.x - av.x) * t,
    av.y + (bv.y - av.y) * t,
    av.z + (bv.z - av.z) * t
  );
}
