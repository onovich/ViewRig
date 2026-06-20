export type ScreenPointNdc = readonly [x: number, y: number];

export interface NdcRange {
  readonly min: -1;
  readonly max: 1;
}

export const NDC_RANGE: NdcRange = Object.freeze({
  min: -1,
  max: 1
});

export function isNdcPoint(point: ScreenPointNdc): boolean {
  return point[0] >= NDC_RANGE.min && point[0] <= NDC_RANGE.max
    && point[1] >= NDC_RANGE.min && point[1] <= NDC_RANGE.max;
}

export function clampNdcPoint(point: ScreenPointNdc): ScreenPointNdc {
  return [
    Math.min(NDC_RANGE.max, Math.max(NDC_RANGE.min, point[0])),
    Math.min(NDC_RANGE.max, Math.max(NDC_RANGE.min, point[1]))
  ];
}
