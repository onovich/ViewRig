import { vec3Add, vec3Distance, vec3Normalize, vec3Scale, vec3Sub } from "../math/Vec3";
import { createCameraState, type CameraState } from "../state/CameraState";
import type { Vec3Like } from "../state/SnapshotTypes";
import type { LayerMask, WorldProbe } from "../world/WorldProbe";
import { safeSpherecast } from "../world/WorldProbeFallback";

export interface CollisionConstraintConfig {
  readonly target: Vec3Like;
  readonly probe?: WorldProbe;
  readonly radius: number;
  readonly minDistance?: number;
  readonly mask?: LayerMask;
}

export function applyCollisionConstraint(
  state: CameraState,
  config: CollisionConstraintConfig
): CameraState {
  const distance = vec3Distance(state.position, config.target);
  const direction = vec3Normalize(vec3Sub(state.position, config.target), [0, 0, 1]);
  const hit = safeSpherecast(config.probe, {
    origin: config.target,
    direction
  }, config.radius, distance, config.mask);

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
