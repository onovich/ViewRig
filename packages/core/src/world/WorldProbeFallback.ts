import { snapshotVec3, type Vec3Like, type Vec3Snapshot } from "../state/SnapshotTypes";
import type { HitLike, LayerMask, RayLike, WorldProbe } from "./WorldProbe";

export function safeRaycast(
  probe: WorldProbe | undefined,
  ray: RayLike,
  maxDistance: number,
  mask?: LayerMask
): HitLike | null {
  return probe?.raycast?.(ray, maxDistance, mask) ?? null;
}

export function safeSpherecast(
  probe: WorldProbe | undefined,
  ray: RayLike,
  radius: number,
  maxDistance: number,
  mask?: LayerMask
): HitLike | null {
  return probe?.spherecast?.(ray, radius, maxDistance, mask) ?? null;
}

export function safeContainsPoint(
  probe: WorldProbe | undefined,
  volumeId: string,
  point: Vec3Like
): boolean {
  return probe?.containsPoint?.(volumeId, point) ?? true;
}

export function safeClosestPoint(
  probe: WorldProbe | undefined,
  volumeId: string,
  point: Vec3Like
): Vec3Snapshot {
  return snapshotVec3(probe?.closestPoint?.(volumeId, point) ?? point);
}
