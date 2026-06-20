import type { ControlChannel } from "../channels/ControlChannel";
import type { YawPitchValue } from "../channels/YawPitchChannel";
import { quatFromAxisAngle, quatMul, degreesToRadians } from "../math/Quat";
import { vec3Add } from "../math/Vec3";
import { createCameraState, type CameraDebugState, type CameraState } from "../state/CameraState";
import type { LensState } from "../state/LensState";
import type { Vec3Like } from "../state/SnapshotTypes";

export interface FirstPersonRigConfig {
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly eyeOffset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface FirstPersonRigEvaluationContext {
  readonly time?: number;
}

function resolveLook(look: YawPitchValue | ControlChannel<YawPitchValue>): YawPitchValue {
  return "snapshot" in look ? look.snapshot() : look;
}

function createDebugState(config: FirstPersonRigConfig): CameraDebugState | undefined {
  if (config.debugId === undefined) {
    return undefined;
  }

  return { liveCameraId: config.debugId };
}

export function evaluateFirstPersonRig(
  config: FirstPersonRigConfig,
  context: FirstPersonRigEvaluationContext = {}
): CameraState {
  const look = resolveLook(config.look);
  const yawRotation = quatFromAxisAngle([0, 1, 0], degreesToRadians(look.yaw));
  const pitchRotation = quatFromAxisAngle([1, 0, 0], degreesToRadians(look.pitch));
  const debug = createDebugState(config);

  return createCameraState({
    position: vec3Add(config.target, config.eyeOffset ?? [0, 1.65, 0]),
    rotation: quatMul(yawRotation, pitchRotation),
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    ...(context.time === undefined ? {} : { time: context.time }),
    ...(debug === undefined ? {} : { debug })
  });
}
