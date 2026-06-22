import type { ControlChannel } from "../channels/ControlChannel.js";
import type { YawPitchValue } from "../channels/YawPitchChannel.js";
import { quatFromAxisAngle, quatMul, degreesToRadians } from "../math/Quat.js";
import { vec3Add, vec3Scale } from "../math/Vec3.js";
import { createCameraState, type CameraDebugState, type CameraState } from "../state/CameraState.js";
import type { LensState } from "../state/LensState.js";
import type { Vec3Like } from "../state/SnapshotTypes.js";

export interface ThirdPersonRigConfig {
  readonly target: Vec3Like;
  readonly look: YawPitchValue | ControlChannel<YawPitchValue>;
  readonly distance: number;
  readonly pivotOffset?: Vec3Like;
  readonly shoulder?: number | ControlChannel<number>;
  readonly shoulderOffset?: Vec3Like;
  readonly lens?: LensState;
  readonly debugId?: string;
}

export interface ThirdPersonRigEvaluationContext {
  readonly time?: number;
}

function resolveLook(look: YawPitchValue | ControlChannel<YawPitchValue>): YawPitchValue {
  return "snapshot" in look ? look.snapshot() : look;
}

function resolveShoulder(shoulder: number | ControlChannel<number> | undefined): number {
  if (shoulder === undefined) {
    return 0;
  }

  return typeof shoulder === "number" ? shoulder : shoulder.snapshot();
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
  const shoulder = resolveShoulder(config.shoulder);
  const shoulderOffset = vec3Scale(config.shoulderOffset ?? [0, 0, 0], shoulder);
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
    position: vec3Add(vec3Add(pivot, cameraOffset), shoulderOffset),
    rotation,
    ...(config.lens === undefined ? {} : { lens: config.lens }),
    ...(context.time === undefined ? {} : { time: context.time }),
    ...(debug === undefined ? {} : { debug })
  });
}
