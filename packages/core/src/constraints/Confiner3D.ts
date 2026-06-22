import { createCameraState, type CameraState } from "../state/CameraState.js";
import { snapshotVec3, type Vec3Like } from "../state/SnapshotTypes.js";

export interface Confiner3DAabb {
  readonly min: Vec3Like;
  readonly max: Vec3Like;
}

export interface Confiner3DConfig {
  readonly aabb: Confiner3DAabb;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyConfiner3D(state: CameraState, config: Confiner3DConfig): CameraState {
  const min = snapshotVec3(config.aabb.min);
  const max = snapshotVec3(config.aabb.max);

  return createCameraState({
    position: {
      x: clamp(state.position.x, min.x, max.x),
      y: clamp(state.position.y, min.y, max.y),
      z: clamp(state.position.z, min.z, max.z)
    },
    rotation: state.rotation,
    up: state.up,
    lens: state.lens,
    time: state.time,
    ...(state.debug === undefined ? {} : { debug: state.debug })
  });
}
