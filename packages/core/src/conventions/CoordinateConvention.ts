export type Axis = "x" | "y" | "z";
export type SignedAxis = "+x" | "-x" | "+y" | "-y" | "+z" | "-z";

export interface CoordinateConvention {
  readonly handedness: "right-handed" | "left-handed";
  readonly upAxis: SignedAxis;
  readonly forwardAxis: SignedAxis;
  readonly rightAxis: SignedAxis;
  readonly fovUnit: "degree";
  readonly ndcRange: "-1..1";
  readonly yawPitchRollOrder: "yaw-pitch-roll";
}

export const DEFAULT_COORDINATE_CONVENTION: CoordinateConvention = Object.freeze({
  handedness: "right-handed",
  upAxis: "+y",
  forwardAxis: "-z",
  rightAxis: "+x",
  fovUnit: "degree",
  ndcRange: "-1..1",
  yawPitchRollOrder: "yaw-pitch-roll"
});

export function signedAxisBase(axis: SignedAxis): Axis {
  return axis.slice(1) as Axis;
}

export function signedAxisSign(axis: SignedAxis): 1 | -1 {
  return axis.startsWith("-") ? -1 : 1;
}
