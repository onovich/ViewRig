import type { CameraState } from "@viewrig/core";

export interface ThreeVector3Like {
  set(x: number, y: number, z: number): void;
}

export interface ThreeQuaternionLike {
  set(x: number, y: number, z: number, w: number): void;
}

export interface ThreeCameraLike {
  readonly position: ThreeVector3Like;
  readonly quaternion: ThreeQuaternionLike;
  fov?: number;
  near?: number;
  far?: number;
  zoom?: number;
  updateProjectionMatrix?(): void;
}

interface ThreeMatrixWorldLike {
  updateMatrixWorld?(force?: boolean): void;
}

export function applyThreeCameraState(camera: ThreeCameraLike, state: CameraState): void {
  camera.position.set(state.position.x, state.position.y, state.position.z);
  camera.quaternion.set(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);

  if (state.lens.projection === "perspective") {
    camera.fov = state.lens.fov;
  } else if (state.lens.orthographicSize !== 0) {
    camera.zoom = 1 / state.lens.orthographicSize;
  }

  if (state.lens.near !== undefined) {
    camera.near = state.lens.near;
  }

  if (state.lens.far !== undefined) {
    camera.far = state.lens.far;
  }

  (camera as ThreeCameraLike & ThreeMatrixWorldLike).updateMatrixWorld?.(true);
  camera.updateProjectionMatrix?.();
}
