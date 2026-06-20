import { vec3Add, vec3Distance, vec3Normalize, vec3Scale, vec3Sub } from "../math/Vec3";
import { createCameraState, type CameraState } from "../state/CameraState";
import type { Vec3Like } from "../state/SnapshotTypes";

export interface DistanceClampConfig {
  readonly target: Vec3Like;
  readonly minDistance?: number;
  readonly maxDistance?: number;
}

export function applyDistanceClamp(state: CameraState, config: DistanceClampConfig): CameraState {
  const distance = vec3Distance(state.position, config.target);
  const minDistance = config.minDistance ?? 0;
  const maxDistance = config.maxDistance ?? Number.POSITIVE_INFINITY;
  const clampedDistance = Math.min(maxDistance, Math.max(minDistance, distance));

  if (Math.abs(clampedDistance - distance) <= Number.EPSILON) {
    return state;
  }

  const direction = vec3Normalize(vec3Sub(state.position, config.target), [0, 0, 1]);

  return createCameraState({
    position: vec3Add(config.target, vec3Scale(direction, clampedDistance)),
    rotation: state.rotation,
    up: state.up,
    lens: state.lens,
    time: state.time,
    ...(state.debug === undefined ? {} : { debug: state.debug })
  });
}
