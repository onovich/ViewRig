import {
  snapshotQuat,
  snapshotVec3,
  type QuatLike,
  type QuatSnapshot,
  type Vec3Like
} from "../state/SnapshotTypes";
import { vec3, vec3Normalize, type Vec3 } from "./Vec3";

export type Quat = QuatSnapshot;

export function quat(x = 0, y = 0, z = 0, w = 1): Quat {
  return snapshotQuat([x, y, z, w]);
}

export const QUAT_IDENTITY: Quat = quat(0, 0, 0, 1);

export function quatLengthSq(value: QuatLike): number {
  const q = snapshotQuat(value);
  return q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
}

export function quatNormalize(value: QuatLike): Quat {
  const q = snapshotQuat(value);
  const length = Math.sqrt(quatLengthSq(q));
  if (length <= Number.EPSILON) {
    return QUAT_IDENTITY;
  }

  return quat(q.x / length, q.y / length, q.z / length, q.w / length);
}

export function quatConjugate(value: QuatLike): Quat {
  const q = snapshotQuat(value);
  return quat(-q.x, -q.y, -q.z, q.w);
}

export function quatMul(a: QuatLike, b: QuatLike): Quat {
  const av = snapshotQuat(a);
  const bv = snapshotQuat(b);

  return quat(
    av.w * bv.x + av.x * bv.w + av.y * bv.z - av.z * bv.y,
    av.w * bv.y - av.x * bv.z + av.y * bv.w + av.z * bv.x,
    av.w * bv.z + av.x * bv.y - av.y * bv.x + av.z * bv.w,
    av.w * bv.w - av.x * bv.x - av.y * bv.y - av.z * bv.z
  );
}

export function quatFromAxisAngle(axis: Vec3Like, radians: number): Quat {
  const normalized = vec3Normalize(axis, [0, 1, 0]);
  const halfAngle = radians * 0.5;
  const s = Math.sin(halfAngle);

  return quatNormalize([
    normalized.x * s,
    normalized.y * s,
    normalized.z * s,
    Math.cos(halfAngle)
  ]);
}

export function quatRotateVec3(rotation: QuatLike, value: Vec3Like): Vec3 {
  const q = quatNormalize(rotation);
  const source = snapshotVec3(value);
  const v = snapshotQuat([source.x, source.y, source.z, 0]);
  const rotated = quatMul(quatMul(q, v), quatConjugate(q));

  return vec3(rotated.x, rotated.y, rotated.z);
}

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}
