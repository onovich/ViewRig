import type { RectNdc } from "../composer/RectNdc";
import type { ScreenPointNdc } from "../conventions/ScreenSpace";
import type { CameraDebugState, CameraState } from "../state/CameraState";
import type { Vec3Like } from "../state/SnapshotTypes";

export type DebugDrawCommand =
  | {
      readonly type: "point3";
      readonly position: Vec3Like;
      readonly color?: string;
      readonly label?: string;
    }
  | {
      readonly type: "line3";
      readonly from: Vec3Like;
      readonly to: Vec3Like;
      readonly color?: string;
      readonly label?: string;
    }
  | {
      readonly type: "rectNdc";
      readonly rect: RectNdc;
      readonly color?: string;
      readonly label?: string;
    }
  | {
      readonly type: "pointNdc";
      readonly point: ScreenPointNdc;
      readonly color?: string;
      readonly label?: string;
    };

export interface CameraDebugFrame {
  readonly state: CameraState;
  readonly metadata?: CameraDebugState;
  readonly draw: readonly DebugDrawCommand[];
}

export function createCameraDebugFrame(
  state: CameraState,
  draw: readonly DebugDrawCommand[] = []
): CameraDebugFrame {
  return Object.freeze({
    state,
    ...(state.debug === undefined ? {} : { metadata: state.debug }),
    draw: Object.freeze([...draw])
  });
}
