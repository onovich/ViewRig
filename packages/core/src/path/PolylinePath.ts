import { vec3Distance, vec3Lerp, vec3Normalize, vec3Sub } from "../math/Vec3";
import { snapshotVec3, type Vec3Like, type Vec3Snapshot } from "../state/SnapshotTypes";
import {
  clampPathDistance,
  clampPathT,
  snapshotPathSample,
  type CameraPath,
  type PathSample
} from "./CameraPath";

export interface PolylinePathConfig {
  readonly points: readonly Vec3Like[];
  readonly up?: Vec3Like;
}

export interface PolylinePath extends CameraPath {
  readonly points: readonly Vec3Snapshot[];
  readonly segmentLengths: readonly number[];
  readonly cumulativeDistances: readonly number[];
  readonly up: Vec3Snapshot;
}

function createSegmentLengths(points: readonly Vec3Snapshot[]): readonly number[] {
  const lengths: number[] = [];

  for (let i = 0; i < points.length - 1; i += 1) {
    lengths.push(vec3Distance(points[i]!, points[i + 1]!));
  }

  return Object.freeze(lengths);
}

function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function createCumulativeDistances(segmentLengths: readonly number[]): readonly number[] {
  const distances = [0];
  let covered = 0;

  for (const length of segmentLengths) {
    covered += length;
    distances.push(covered);
  }

  return Object.freeze(distances);
}

function findSegmentIndex(
  segmentLengths: readonly number[],
  cumulativeDistances: readonly number[],
  distance: number
): number {
  for (let i = 0; i < segmentLengths.length; i += 1) {
    const length = segmentLengths[i]!;
    const next = cumulativeDistances[i + 1]!;
    if (length > Number.EPSILON && distance <= next) {
      return i;
    }
  }

  for (let i = segmentLengths.length - 1; i >= 0; i -= 1) {
    if (segmentLengths[i]! > Number.EPSILON) {
      return i;
    }
  }

  return 0;
}

export function createPolylinePath(config: PolylinePathConfig): PolylinePath {
  if (config.points.length === 0) {
    throw new Error("PolylinePath requires at least one point.");
  }

  const points = Object.freeze(config.points.map((point) => snapshotVec3(point)));
  const segmentLengths = createSegmentLengths(points);
  const cumulativeDistances = createCumulativeDistances(segmentLengths);
  const totalLength = sum(segmentLengths);
  const up = snapshotVec3(config.up ?? [0, 1, 0]);

  function sampleAtDistance(distance: number): PathSample {
    const clampedDistance = Math.min(clampPathDistance(distance), totalLength);

    if (points.length === 1 || totalLength <= Number.EPSILON) {
      return snapshotPathSample({
        position: points[0]!,
        up,
        t: 0,
        distance: 0
      });
    }

    const segmentIndex = findSegmentIndex(segmentLengths, cumulativeDistances, clampedDistance);
    const segmentStart = points[segmentIndex]!;
    const segmentEnd = points[segmentIndex + 1]!;
    const coveredBefore = cumulativeDistances[segmentIndex]!;
    const segmentLength = segmentLengths[segmentIndex]!;
    const localT =
      segmentLength <= Number.EPSILON ? 0 : (clampedDistance - coveredBefore) / segmentLength;

    return snapshotPathSample({
      position: vec3Lerp(segmentStart, segmentEnd, localT),
      tangent: vec3Normalize(vec3Sub(segmentEnd, segmentStart), [0, 0, -1]),
      up,
      t: totalLength <= Number.EPSILON ? 0 : clampedDistance / totalLength,
      distance: clampedDistance
    });
  }

  return Object.freeze({
    points,
    segmentLengths,
    cumulativeDistances,
    up,
    length: totalLength,
    sampleAtT: (t: number) => sampleAtDistance(clampPathT(t) * totalLength),
    sampleAtDistance
  });
}
