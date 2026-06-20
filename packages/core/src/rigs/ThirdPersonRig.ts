import type { ControlChannel } from "../channels/ControlChannel";
import type { YawPitchValue } from "../channels/YawPitchChannel";
import { quatFromAxisAngle, quatMul, degreesToRadians } from "../math/Quat";
import { vec3Add } from "../math/Vec3";
import { createCameraState, type CameraDebugState, type CameraState } from "../state/CameraState";
import type { LensState } from "../state/LensState";
import type { Vec3Like } from "../state/SnapshotTypes";

export interface ThirdPersonRigConfig {
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly distance: number;
  readonly pivotOffset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface ThirdPersonRigEvaluationContext {
  readonly time?: number;
}

function resolveLook(look: YawPitchValue | ControlChannel<YawPitchValue>): YawPitchValue {
  return "snapshot" in look ? look.snapshot() : look;
}

function createDebugState(config: ThirdPersonRigConfig): CameraDebugState | undefined {
  if (config.debugId === undefined) {
    return undefined;
  }

  return { liveCameraId: config.debugId };
}

export function evaluateThirdPersonRig(
  config: ThirdPersonRigConfig,
  context: ThirdPersonRigEvaluationContext = {}
): CameraState {
  const look = resolveLook(config.look);
  const yaw = degreesToRadians(look.yaw);
  const pitch = degreesToRadians(look.pitch);
  const cosPitch = Math.cos(pitch);
  const pivot = vec3Add(config.target, config.pivotOffset ?? [0, 1.5, 0]);
  const cameraOffset = {
    x: Math.sin(yaw) * cosPitch * config.distance,
    y: Math.sin(pitch) * config.distance,
    z: Math.cos(yaw) * cosPitch * config.distance
  };
  const rotation = quatMul(
    quatFromAxisAngle([0, 1, 0], yaw),
    quatFromAxisAngle([1, 0, 0], pitch)
  );
  const debug = createDebugState(config);

  return createCameraState({
    position: vec3Add(pivot, cameraOffset),
    rotation,
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    ...(context.time === undefined ? {} : { time: context.time }),
    ...(debug === undefined ? {} : { debug })
  });
}
