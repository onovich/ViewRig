import { snapshotVec3, type Vec3Like, type Vec3Snapshot } from "../state/SnapshotTypes";

export interface PathSample {
  readonly position: Vec3Snapshot;
  readonly tangent: Vec3Snapshot;
  readonly up: Vec3Snapshot;
  readonly t: number;
  readonly distance: number;
}

export interface PathSampleInput {
  readonly position: Vec3Like;
  readonly tangent?: Vec3Like;
  readonly up?: Vec3Like;
  readonly t?: number;
  readonly distance?: number;
}

export interface CameraPath {
  readonly length: number;
  sampleAtT(t: number): PathSample;
  sampleAtDistance(distance: number): PathSample;
}

export interface ProjectableCameraPath extends CameraPath {
  projectPoint(point: Vec3Like): PathSample;
}

export function isProjectableCameraPath(path: CameraPath): path is ProjectableCameraPath {
  return "projectPoint" in path && typeof path.projectPoint === "function";
}

export function clampPathT(t: number): number {
  if (!Number.isFinite(t)) {
    return 0;
  }

  return Math.max(0, Math.min(1, t));
}

export function clampPathDistance(distance: number): number {
  if (!Number.isFinite(distance)) {
    return 0;
  }

  return Math.max(0, distance);
}

export function snapshotPathSample(input: PathSampleInput): PathSample {
  return Object.freeze({
    position: snapshotVec3(input.position),
    tangent: snapshotVec3(input.tangent ?? [0, 0, -1]),
    up: snapshotVec3(input.up ?? [0, 1, 0]),
    t: clampPathT(input.t ?? 0),
    distance: clampPathDistance(input.distance ?? 0)
  });
}
