import type { ControlChannel } from "../channels/ControlChannel.js";
import { QUAT_IDENTITY } from "../math/Quat.js";
import {
  clampPathT,
  isProjectableCameraPath,
  type CameraPath,
  type PathSample
} from "../path/CameraPath.js";
import {
  createCameraState,
  type CameraDebugState,
  type CameraState
} from "../state/CameraState.js";
import type { LensState } from "../state/LensState.js";
import type { QuatLike, Vec3Like } from "../state/SnapshotTypes.js";

export type RailRigDriver =
  | {
      readonly type: "fixed";
      readonly t: number;
    }
  | {
      readonly type: "time";
      readonly duration: number;
      readonly offsetT?: number;
      readonly loop?: boolean;
    }
  | {
      readonly type: "input";
      readonly channel: number | ControlChannel<number>;
    }
  | {
      readonly type: "targetProjection";
      readonly target: Vec3Like;
    };

export interface RailRigConfig {
  readonly path: CameraPath;
  readonly driver: RailRigDriver;
  readonly rotation?: QuatLike;
  readonly up?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface RailRigEvaluationContext {
  readonly time?: number;
}

function wrapPathT(t: number): number {
  if (!Number.isFinite(t)) {
    return 0;
  }

  return ((t % 1) + 1) % 1;
}

function resolveInputDriver(channel: number | ControlChannel<number>): number {
  return typeof channel === "number" ? channel : channel.snapshot();
}

export function resolveRailRigDriverT(
  driver: RailRigDriver,
  context: RailRigEvaluationContext = {}
): number {
  if (driver.type === "fixed") {
    return clampPathT(driver.t);
  }

  if (driver.type === "input") {
    return clampPathT(resolveInputDriver(driver.channel));
  }

  if (driver.type === "targetProjection") {
    return 0;
  }

  const duration = driver.duration;
  if (!Number.isFinite(duration) || duration <= Number.EPSILON) {
    return clampPathT(driver.offsetT ?? 0);
  }

  const t = (driver.offsetT ?? 0) + (context.time ?? 0) / duration;
  return driver.loop === true ? wrapPathT(t) : clampPathT(t);
}

function createDebugState(config: RailRigConfig, sample: PathSample): CameraDebugState | undefined {
  if (config.debugId === undefined) {
    return undefined;
  }

  return {
    liveCameraId: config.debugId,
    metadata: {
      railT: sample.t,
      railDistance: sample.distance,
      driver: config.driver.type
    }
  };
}

function resolveRailRigSample(config: RailRigConfig, context: RailRigEvaluationContext): PathSample {
  if (config.driver.type === "targetProjection") {
    if (!isProjectableCameraPath(config.path)) {
      throw new Error("RailRig targetProjection driver requires a projectable camera path.");
    }

    return config.path.projectPoint(config.driver.target);
  }

  return config.path.sampleAtT(resolveRailRigDriverT(config.driver, context));
}

export function evaluateRailRig(
  config: RailRigConfig,
  context: RailRigEvaluationContext = {}
): CameraState {
  const sample = resolveRailRigSample(config, context);
  const debug = createDebugState(config, sample);

  return createCameraState({
    position: sample.position,
    rotation: config.rotation ?? QUAT_IDENTITY,
    up: config.up ?? sample.up,
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    ...(context.time === undefined ? {} : { time: context.time }),
    ...(debug === undefined ? {} : { debug })
  });
}
