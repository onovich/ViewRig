import { quatFromAxisAngle, quatMul, degreesToRadians } from "../math/Quat.js";
import { vec3Add } from "../math/Vec3.js";
import { createCameraState, type CameraDebugState, type CameraState } from "../state/CameraState.js";
import type { LensState } from "../state/LensState.js";
import type { Vec3Like } from "../state/SnapshotTypes.js";
import type { ControlChannel } from "../channels/ControlChannel.js";
import type { YawPitchValue } from "../channels/YawPitchChannel.js";

export interface OrbitRigConfig {
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly distance: number;
  readonly pivotOffset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface OrbitRigEvaluationContext {
  readonly time?: number;
}

function resolveLook(look: YawPitchValue | ControlChannel<YawPitchValue>): YawPitchValue {
  return "snapshot" in look ? look.snapshot() : look;
}

function createDebugState(config: OrbitRigConfig): CameraDebugState | undefined {
  if (config.debugId === undefined) {
    return undefined;
  }

  return { liveCameraId: config.debugId };
}

export function evaluateOrbitRig(
  config: OrbitRigConfig,
  context: OrbitRigEvaluationContext = {}
): CameraState {
  const look = resolveLook(config.look);
  const yaw = degreesToRadians(look.yaw);
  const pitch = degreesToRadians(look.pitch);
  const cosPitch = Math.cos(pitch);
  const pivot = vec3Add(config.target, config.pivotOffset ?? [0, 0, 0]);
  const offset = {
    x: Math.sin(yaw) * cosPitch * config.distance,
    y: Math.sin(pitch) * config.distance,
    z: Math.cos(yaw) * cosPitch * config.distance
  };
  const yawRotation = quatFromAxisAngle([0, 1, 0], yaw);
  const pitchRotation = quatFromAxisAngle([1, 0, 0], pitch);
  const debug = createDebugState(config);

  return createCameraState({
    position: vec3Add(pivot, offset),
    rotation: quatMul(yawRotation, pitchRotation),
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    ...(context.time === undefined ? {} : { time: context.time }),
    ...(debug === undefined ? {} : { debug })
  });
}
