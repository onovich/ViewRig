import type { ScreenPointNdc } from "../conventions/ScreenSpace";

export interface RectNdc {
  readonly center: ScreenPointNdc;
  readonly size: ScreenPointNdc;
}

export function rectCenter(width: number, height: number): RectNdc {
  return Object.freeze({
    center: [0, 0] as const,
    size: [width, height] as const
  });
}

export function rectContainsPoint(rect: RectNdc, point: ScreenPointNdc): boolean {
  const halfWidth = rect.size[0] * 0.5;
  const halfHeight = rect.size[1] * 0.5;
  return point[0] >= rect.center[0] - halfWidth
    && point[0] <= rect.center[0] + halfWidth
    && point[1] >= rect.center[1] - halfHeight
    && point[1] <= rect.center[1] + halfHeight;
}

export function clampPointToRect(rect: RectNdc, point: ScreenPointNdc): ScreenPointNdc {
  const halfWidth = rect.size[0] * 0.5;
  const halfHeight = rect.size[1] * 0.5;
  return [
    Math.min(rect.center[0] + halfWidth, Math.max(rect.center[0] - halfWidth, point[0])),
    Math.min(rect.center[1] + halfHeight, Math.max(rect.center[1] - halfHeight, point[1]))
  ];
}
