import { createCameraState, type CameraState } from "../state/CameraState";

export type Confiner2DPlane = "xy" | "xz";

export interface Confiner2DAabb {
  readonly min: readonly [number, number];
  readonly max: readonly [number, number];
}

export interface Confiner2DConfig {
  readonly plane: Confiner2DPlane;
  readonly aabb: Confiner2DAabb;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function applyConfiner2D(state: CameraState, config: Confiner2DConfig): CameraState {
  const position = { ...state.position };

  if (config.plane === "xy") {
    position.x = clamp(position.x, config.aabb.min[0], config.aabb.max[0]);
    position.y = clamp(position.y, config.aabb.min[1], config.aabb.max[1]);
  } else {
    position.x = clamp(position.x, config.aabb.min[0], config.aabb.max[0]);
    position.z = clamp(position.z, config.aabb.min[1], config.aabb.max[1]);
  }

  return createCameraState({
    position,
    rotation: state.rotation,
    up: state.up,
    lens: state.lens,
    time: state.time,
    ...(state.debug === undefined ? {} : { debug: state.debug })
  });
}
