import {
  QUAT_IDENTITY,
  snapshotQuat,
  snapshotVec3,
  type QuatLike,
  type QuatSnapshot,
  type Vec3Like,
  type Vec3Snapshot
} from "@viewrig/core";

export interface FakeTargetKeyframe {
  readonly time: number;
  readonly position: Vec3Like;
  readonly rotation?: QuatLike;
  readonly velocity?: Vec3Like;
  readonly up?: Vec3Like;
}

export interface FakeTargetSample {
  readonly time: number;
  readonly position: Vec3Snapshot;
  readonly rotation: QuatSnapshot;
  readonly velocity?: Vec3Snapshot;
  readonly up: Vec3Snapshot;
}

function snapshotTargetKeyframe(keyframe: FakeTargetKeyframe): FakeTargetSample {
  const base = {
    time: keyframe.time,
    position: snapshotVec3(keyframe.position),
    rotation: keyframe.rotation === undefined ? QUAT_IDENTITY : snapshotQuat(keyframe.rotation),
    up: keyframe.up === undefined ? snapshotVec3([0, 1, 0]) : snapshotVec3(keyframe.up)
  };

  if (keyframe.velocity === undefined) {
    return Object.freeze(base);
  }

  return Object.freeze({
    ...base,
    velocity: snapshotVec3(keyframe.velocity)
  });
}

export function createFakeTargetTrace(keyframes: readonly FakeTargetKeyframe[]): readonly FakeTargetSample[] {
  return Object.freeze(keyframes.map(snapshotTargetKeyframe));
}
