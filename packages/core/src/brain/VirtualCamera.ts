import type { CameraState } from "../state/CameraState.js";

export interface CameraEvaluationContext {
  readonly dt: number;
  readonly time: number;
  readonly previous?: CameraState;
}

export interface VirtualCamera {
  readonly id: string;
  readonly priority?: number;
  readonly enabled?: boolean;
  evaluate(context: CameraEvaluationContext): CameraState;
}

export interface VirtualCameraConfig {
  readonly id: string;
  readonly priority?: number;
  readonly enabled?: boolean;
  readonly evaluate: (context: CameraEvaluationContext) => CameraState;
}

export function createVirtualCamera(config: VirtualCameraConfig): VirtualCamera {
  return Object.freeze({ ...config });
}

export function isVirtualCameraEnabled(camera: VirtualCamera): boolean {
  return camera.enabled !== false;
}

export function evaluateVirtualCamera(
  camera: VirtualCamera,
  context: CameraEvaluationContext
): CameraState | null {
  if (!isVirtualCameraEnabled(camera)) {
    return null;
  }

  return camera.evaluate(context);
}
