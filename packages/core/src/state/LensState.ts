export interface PerspectiveLensState {
  readonly projection: "perspective";
  readonly fov: number;
  readonly near?: number;
  readonly far?: number;
}

export interface OrthographicLensState {
  readonly projection: "orthographic";
  readonly orthographicSize: number;
  readonly near?: number;
  readonly far?: number;
}

export type LensState = PerspectiveLensState | OrthographicLensState;

export const DEFAULT_LENS_STATE: PerspectiveLensState = Object.freeze({
  projection: "perspective",
  fov: 60,
  near: 0.1,
  far: 1000
});

export function snapshotLensState(lens: LensState = DEFAULT_LENS_STATE): LensState {
  return Object.freeze({ ...lens });
}
