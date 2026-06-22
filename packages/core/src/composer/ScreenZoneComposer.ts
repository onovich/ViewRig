import type { ScreenPointNdc } from "../conventions/ScreenSpace.js";
import { projectPointToNdc, type ProjectToNdcOptions } from "../math/Projection.js";
import type { CameraState } from "../state/CameraState.js";
import type { Vec3Like } from "../state/SnapshotTypes.js";
import { clampPointToRect, rectContainsPoint, type RectNdc } from "./RectNdc.js";

export type ScreenZoneComposerMode = "aim" | "body" | "both";
export type ScreenZoneResultKind = "dead" | "soft" | "hard" | "outside" | "behind";

export interface ScreenZoneComposerConfig {
  readonly mode: ScreenZoneComposerMode;
  readonly dead: RectNdc;
  readonly soft: RectNdc;
  readonly hard: RectNdc;
}

export interface ScreenZoneComposerResult {
  readonly kind: ScreenZoneResultKind;
  readonly targetNdc: ScreenPointNdc | null;
  readonly correctionTargetNdc: ScreenPointNdc | null;
}

export function evaluateScreenZoneComposer(
  camera: CameraState,
  target: Vec3Like,
  config: ScreenZoneComposerConfig,
  options: ProjectToNdcOptions = {}
): ScreenZoneComposerResult {
  const targetNdc = projectPointToNdc(camera, target, options);

  if (targetNdc === null) {
    return Object.freeze({
      kind: "behind",
      targetNdc: null,
      correctionTargetNdc: null
    });
  }

  if (rectContainsPoint(config.dead, targetNdc)) {
    return Object.freeze({
      kind: "dead",
      targetNdc,
      correctionTargetNdc: targetNdc
    });
  }

  if (rectContainsPoint(config.soft, targetNdc)) {
    return Object.freeze({
      kind: "soft",
      targetNdc,
      correctionTargetNdc: clampPointToRect(config.dead, targetNdc)
    });
  }

  if (rectContainsPoint(config.hard, targetNdc)) {
    return Object.freeze({
      kind: "hard",
      targetNdc,
      correctionTargetNdc: clampPointToRect(config.soft, targetNdc)
    });
  }

  return Object.freeze({
    kind: "outside",
    targetNdc,
    correctionTargetNdc: clampPointToRect(config.hard, targetNdc)
  });
}
