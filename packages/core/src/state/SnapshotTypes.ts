export interface Vec2Snapshot {
  readonly x: number;
  readonly y: number;
}

export interface Vec3Snapshot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface QuatSnapshot {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

export type Vec2Tuple = readonly [x: number, y: number];
export type Vec3Tuple = readonly [x: number, y: number, z: number];
export type QuatTuple = readonly [x: number, y: number, z: number, w: number];

export type Vec2Like = Vec2Snapshot | Vec2Tuple;
export type Vec3Like = Vec3Snapshot | Vec3Tuple;
export type QuatLike = QuatSnapshot | QuatTuple;

function isVec2Tuple(value: Vec2Like): value is Vec2Tuple {
  return Array.isArray(value);
}

function isVec3Tuple(value: Vec3Like): value is Vec3Tuple {
  return Array.isArray(value);
}

function isQuatTuple(value: QuatLike): value is QuatTuple {
  return Array.isArray(value);
}

export function snapshotVec2(value: Vec2Like): Vec2Snapshot {
  if (isVec2Tuple(value)) {
    return Object.freeze({ x: value[0], y: value[1] });
  }

  return Object.freeze({ x: value.x, y: value.y });
}

export function snapshotVec3(value: Vec3Like): Vec3Snapshot {
  if (isVec3Tuple(value)) {
    return Object.freeze({ x: value[0], y: value[1], z: value[2] });
  }

  return Object.freeze({ x: value.x, y: value.y, z: value.z });
}

export function snapshotQuat(value: QuatLike): QuatSnapshot {
  if (isQuatTuple(value)) {
    return Object.freeze({ x: value[0], y: value[1], z: value[2], w: value[3] });
  }

  return Object.freeze({ x: value.x, y: value.y, z: value.z, w: value.w });
}
