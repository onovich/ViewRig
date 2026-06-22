import { QUAT_IDENTITY } from "../math/Quat.js";
import { vec3Add } from "../math/Vec3.js";
import { createCameraState, type CameraDebugState, type CameraState } from "../state/CameraState.js";
import type { LensState } from "../state/LensState.js";
import type { QuatLike, Vec3Like } from "../state/SnapshotTypes.js";

export interface FollowTargetSample {
  readonly position: Vec3Like;
  readonly rotation?: QuatLike;
  readonly up?: Vec3Like;
}

export interface FollowRigConfig {
  readonly target: FollowTargetSample;
  readonly offset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface FollowRigEvaluationContext {
  readonly time?: number;
}

function createDebugState(config: FollowRigConfig): CameraDebugState | undefined {
  if (config.debugId === undefined) {
    return undefined;
  }

  return { liveCameraId: config.debugId };
}

export function evaluateFollowRig(
  config: FollowRigConfig,
  context: FollowRigEvaluationContext = {}
): CameraState {
  const position = vec3Add(config.target.position, config.offset ?? [0, 0, 0]);
  const debug = createDebugState(config);

  return createCameraState({
    position,
    rotation: config.target.rotation ?? QUAT_IDENTITY,
    ...(config.target.up === undefined ? {} : { up: config.target.up }),
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    ...(context.time === undefined ? {} : { time: context.time }),
    ...(debug === undefined ? {} : { debug })
  });
}
