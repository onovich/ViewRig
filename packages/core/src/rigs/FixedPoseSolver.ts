import { QUAT_IDENTITY } from "../math/Quat";
import {
  createCameraState,
  type CameraDebugState,
  type CameraState
} from "../state/CameraState";
import type { LensState } from "../state/LensState";
import type { QuatLike, Vec3Like } from "../state/SnapshotTypes";

export interface FixedPoseSolverConfig {
  readonly position: Vec3Like;
  readonly rotation?: QuatLike;
  readonly up?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface FixedPoseEvaluationContext {
  readonly time?: number;
  readonly tags?: readonly string[];
}

function createDebugState(
  config: FixedPoseSolverConfig,
  context: FixedPoseEvaluationContext
): CameraDebugState | undefined {
  if (config.debugId === undefined && context.tags === undefined) {
    return undefined;
  }

  const debug: {
    liveCameraId?: string;
    tags?: readonly string[];
  } = {};

  if (config.debugId !== undefined) {
    debug.liveCameraId = config.debugId;
  }

  if (context.tags !== undefined) {
    debug.tags = [...context.tags];
  }

  return debug;
}

export function evaluateFixedPose(
  config: FixedPoseSolverConfig,
  context: FixedPoseEvaluationContext = {}
): CameraState {
  const debug = createDebugState(config, context);

  return createCameraState({
    position: config.position,
    rotation: config.rotation ?? QUAT_IDENTITY,
    ...(config.up === undefined ? {} : { up: config.up }),
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    ...(context.time === undefined ? {} : { time: context.time }),
    ...(debug === undefined ? {} : { debug })
  });
}
