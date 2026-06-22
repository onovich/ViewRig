import { quatConjugate, quatRotateVec3 } from "./Quat.js";
import { vec3Sub } from "./Vec3.js";
import type { CameraState } from "../state/CameraState.js";
import type { Vec3Like } from "../state/SnapshotTypes.js";
import type { ScreenPointNdc } from "../conventions/ScreenSpace.js";

export interface ProjectToNdcOptions {
  readonly aspect?: number;
}

export function projectPointToNdc(
  camera: CameraState,
  point: Vec3Like,
  options: ProjectToNdcOptions = {}
): ScreenPointNdc | null {
  const aspect = options.aspect ?? 1;
  const relative = vec3Sub(point, camera.position);
  const view = quatRotateVec3(quatConjugate(camera.rotation), relative);

  if (camera.lens.projection === "perspective") {
    if (view.z >= 0) {
      return null;
    }

    const tanHalfFov = Math.tan((camera.lens.fov * Math.PI / 180) * 0.5);
    const depth = -view.z;
    return [
      (view.x / depth) / (tanHalfFov * aspect),
      (view.y / depth) / tanHalfFov
    ];
  }

  return [
    view.x / ((camera.lens.orthographicSize * aspect) * 0.5),
    view.y / (camera.lens.orthographicSize * 0.5)
  ];
}
