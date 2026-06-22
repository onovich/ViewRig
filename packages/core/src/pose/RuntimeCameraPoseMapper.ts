import type { CameraDebugState, CameraState } from "../state/CameraState.js";
import type { LensState } from "../state/LensState.js";
import type { QuatSnapshot, Vec3Snapshot } from "../state/SnapshotTypes.js";

export interface RuntimeCameraPoseLike {
  readonly position: Vec3Snapshot;
  readonly rotation: QuatSnapshot;
  readonly up: Vec3Snapshot;
  readonly projection: LensState["projection"];
  readonly fov?: number;
  readonly orthographicSize?: number;
  readonly near?: number;
  readonly far?: number;
  readonly time: number;
  readonly debug?: CameraDebugState;
}

export function toRuntimeCameraPose(state: CameraState): RuntimeCameraPoseLike {
  const lens = state.lens;
  const clip = {
    ...(lens.near === undefined ? {} : { near: lens.near }),
    ...(lens.far === undefined ? {} : { far: lens.far })
  };

  if (lens.projection === "perspective") {
    return Object.freeze({
      position: state.position,
      rotation: state.rotation,
      up: state.up,
      projection: lens.projection,
      fov: lens.fov,
      ...clip,
      time: state.time,
      ...(state.debug === undefined ? {} : { debug: state.debug })
    });
  }

  return Object.freeze({
    position: state.position,
    rotation: state.rotation,
    up: state.up,
    projection: lens.projection,
    orthographicSize: lens.orthographicSize,
    ...clip,
    time: state.time,
    ...(state.debug === undefined ? {} : { debug: state.debug })
  });
}
