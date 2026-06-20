import { vec3Add, vec3Distance, vec3Normalize, vec3Scale, vec3Sub } from "../math/Vec3";
import { createCameraState, type CameraState } from "../state/CameraState";
import type { Vec3Like } from "../state/SnapshotTypes";
import type { LayerMask, WorldProbe } from "../world/WorldProbe";
import { safeRaycast } from "../world/WorldProbeFallback";

export interface OcclusionConstraintConfig {
  readonly target: Vec3Like;
  readonly probe?: WorldProbe;
  readonly minDistance?: number;
  readonly mask?: LayerMask;
}

export function applyOcclusionConstraint(
  state: CameraState,
  config: OcclusionConstraintConfig
): CameraState {
  const distance = vec3Distance(state.position, config.target);
  const direction = vec3Normalize(vec3Sub(state.position, config.target), [0, 0, 1]);
  const hit = safeRaycast(config.probe, {
    origin: config.target,
    direction
  }, distance, config.mask);

  if (hit === null) {
    return state;
  }

  const minDistance = config.minDistance ?? 0;
  const resolvedDistance = Math.max(minDistance, hit.distance);

  return createCameraState({
    position: vec3Add(config.target, vec3Scale(direction, resolvedDistance)),
    rotation: state.rotation,
    up: state.up,
    lens: state.lens,
    time: state.time,
    ...(state.debug === undefined ? {} : { debug: state.debug })
  });
}
