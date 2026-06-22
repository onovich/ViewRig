import type { Vec3Like } from "../state/SnapshotTypes.js";

export type LayerMask = number | string | symbol;

export interface RayLike {
  readonly origin: Vec3Like;
  readonly direction: Vec3Like;
}

export interface HitLike {
  readonly point: Vec3Like;
  readonly normal: Vec3Like;
  readonly distance: number;
  readonly colliderId?: string;
}

export interface WorldProbe {
  raycast?(ray: RayLike, maxDistance: number, mask?: LayerMask): HitLike | null;
  spherecast?(ray: RayLike, radius: number, maxDistance: number, mask?: LayerMask): HitLike | null;
  containsPoint?(volumeId: string, point: Vec3Like): boolean;
  closestPoint?(volumeId: string, point: Vec3Like): Vec3Like;
}
