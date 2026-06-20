import { quatNormalize } from "../math/Quat";
import { vec3Lerp, vec3Normalize } from "../math/Vec3";
import { createCameraState, type CameraState } from "../state/CameraState";
import type { LensState } from "../state/LensState";

export type BlendCurve = "linear" | "smoothstep";

export interface BlendOptions {
  readonly duration: number;
  readonly curve?: BlendCurve;
}

export function clampBlendProgress(progress: number): number {
  return Math.min(1, Math.max(0, progress));
}

export function applyBlendCurve(progress: number, curve: BlendCurve = "linear"): number {
  const t = clampBlendProgress(progress);
  if (curve === "smoothstep") {
    return t * t * (3 - 2 * t);
  }

  return t;
}

export function blendProgress(elapsed: number, options: BlendOptions): number {
  if (options.duration <= 0) {
    return 1;
  }

  return applyBlendCurve(elapsed / options.duration, options.curve);
}

function blendOptionalNumber(from: number | undefined, to: number | undefined, t: number): number | undefined {
  if (from === undefined && to === undefined) {
    return undefined;
  }

  if (from === undefined) {
    return to;
  }

  if (to === undefined) {
    return from;
  }

  return from + (to - from) * t;
}

function blendLensState(from: LensState, to: LensState, t: number): LensState {
  if (from.projection !== to.projection) {
    return t >= 1 ? to : from;
  }

  if (from.projection === "perspective" && to.projection === "perspective") {
    const near = blendOptionalNumber(from.near, to.near, t);
    const far = blendOptionalNumber(from.far, to.far, t);

    return {
      projection: "perspective",
      fov: from.fov + (to.fov - from.fov) * t,
      ...(near === undefined ? {} : { near }),
      ...(far === undefined ? {} : { far })
    };
  }

  if (from.projection === "orthographic" && to.projection === "orthographic") {
    const near = blendOptionalNumber(from.near, to.near, t);
    const far = blendOptionalNumber(from.far, to.far, t);

    return {
      projection: "orthographic",
      orthographicSize: from.orthographicSize + (to.orthographicSize - from.orthographicSize) * t,
      ...(near === undefined ? {} : { near }),
      ...(far === undefined ? {} : { far })
    };
  }

  return to;
}

export function blendCameraState(from: CameraState, to: CameraState, progress: number): CameraState {
  const t = clampBlendProgress(progress);
  const rotation = quatNormalize([
    from.rotation.x + (to.rotation.x - from.rotation.x) * t,
    from.rotation.y + (to.rotation.y - from.rotation.y) * t,
    from.rotation.z + (to.rotation.z - from.rotation.z) * t,
    from.rotation.w + (to.rotation.w - from.rotation.w) * t
  ]);

  return createCameraState({
    position: vec3Lerp(from.position, to.position, t),
    rotation,
    up: vec3Normalize(vec3Lerp(from.up, to.up, t), to.up),
    lens: blendLensState(from.lens, to.lens, t),
    time: from.time + (to.time - from.time) * t
  });
}
