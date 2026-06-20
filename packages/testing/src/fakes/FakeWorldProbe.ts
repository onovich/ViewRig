import {
  snapshotVec3,
  type HitLike,
  type RayLike,
  type Vec3Like,
  type WorldProbe
} from "@viewrig/core";

export interface FakeVolume {
  readonly contains: boolean;
  readonly closestPoint: Vec3Like;
}

export interface FakeWorldProbeOptions {
  readonly rayHits?: readonly HitLike[];
  readonly sphereHits?: readonly HitLike[];
  readonly volumes?: Readonly<Record<string, FakeVolume>>;
}

function firstHitWithinDistance(hits: readonly HitLike[] | undefined, maxDistance: number): HitLike | null {
  return hits?.find((hit) => hit.distance <= maxDistance) ?? null;
}

export function createFakeWorldProbe(options: FakeWorldProbeOptions = {}): WorldProbe {
  return {
    raycast: (_ray: RayLike, maxDistance) => firstHitWithinDistance(options.rayHits, maxDistance),
    spherecast: (_ray: RayLike, _radius, maxDistance) => firstHitWithinDistance(options.sphereHits, maxDistance),
    containsPoint: (volumeId) => options.volumes?.[volumeId]?.contains ?? false,
    closestPoint: (volumeId, point) => {
      const volume = options.volumes?.[volumeId];
      return volume === undefined ? snapshotVec3(point) : snapshotVec3(volume.closestPoint);
    }
  };
}
