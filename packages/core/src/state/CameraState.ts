import { snapshotLensState, type LensState } from "./LensState";
import {
  snapshotQuat,
  snapshotVec3,
  type QuatLike,
  type QuatSnapshot,
  type Vec3Like,
  type Vec3Snapshot
} from "./SnapshotTypes";

export interface CameraDebugState {
  readonly liveCameraId?: string;
  readonly tags?: readonly string[];
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface CameraState {
  readonly position: Vec3Snapshot;
  readonly rotation: QuatSnapshot;
  readonly up: Vec3Snapshot;
  readonly lens: LensState;
  readonly time: number;
  readonly debug?: CameraDebugState;
}

export interface CameraStateInput {
  readonly position: Vec3Like;
  readonly rotation: QuatLike;
  readonly up?: Vec3Like;
  readonly lens?: LensState;
  readonly time?: number;
  readonly debug?: CameraDebugState;
}

const DEFAULT_UP: Vec3Snapshot = Object.freeze({ x: 0, y: 1, z: 0 });

function snapshotDebugState(debug: CameraDebugState): CameraDebugState {
  const snapshot: {
    liveCameraId?: string;
    tags?: readonly string[];
    metadata?: Readonly<Record<string, unknown>>;
  } = {};

  if (debug.liveCameraId !== undefined) {
    snapshot.liveCameraId = debug.liveCameraId;
  }

  if (debug.tags !== undefined) {
    snapshot.tags = Object.freeze([...debug.tags]);
  }

  if (debug.metadata !== undefined) {
    snapshot.metadata = Object.freeze({ ...debug.metadata });
  }

  return Object.freeze(snapshot);
}

export function createCameraState(input: CameraStateInput): CameraState {
  const base = {
    position: snapshotVec3(input.position),
    rotation: snapshotQuat(input.rotation),
    up: input.up === undefined ? DEFAULT_UP : snapshotVec3(input.up),
    lens: snapshotLensState(input.lens),
    time: input.time ?? 0
  };

  if (input.debug === undefined) {
    return Object.freeze(base);
  }

  return Object.freeze({
    ...base,
    debug: snapshotDebugState(input.debug)
  });
}
