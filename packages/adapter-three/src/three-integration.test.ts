import { evaluateFixedPose, evaluateThirdPersonGameplayPreset } from "@viewrig/core";
import { OrthographicCamera, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { describe, expect, it, vi } from "vitest";
import { applyThreeCameraState } from "./index";

function projectionElements(camera: PerspectiveCamera | OrthographicCamera): number[] {
  return [...camera.projectionMatrix.elements];
}

function matrixWorldElements(camera: PerspectiveCamera | OrthographicCamera): number[] {
  return [...camera.matrixWorld.elements];
}

function expectVectorClose(actual: Vector3, expected: Vector3): void {
  expect(actual.x).toBeCloseTo(expected.x, 10);
  expect(actual.y).toBeCloseTo(expected.y, 10);
  expect(actual.z).toBeCloseTo(expected.z, 10);
}

function stateLookDirection(rotation: { readonly x: number; readonly y: number; readonly z: number; readonly w: number }): Vector3 {
  return new Vector3(0, 0, -1).applyQuaternion(
    new Quaternion(rotation.x, rotation.y, rotation.z, rotation.w)
  );
}

describe("applyThreeCameraState Three integration", () => {
  it("writes a CameraState into a real PerspectiveCamera", () => {
    const camera = new PerspectiveCamera(50, 16 / 9, 0.1, 1000);
    const beforeProjection = projectionElements(camera);
    const beforeMatrixWorld = matrixWorldElements(camera);
    const updateMatrixWorld = vi.spyOn(camera, "updateMatrixWorld");
    const updateProjectionMatrix = vi.spyOn(camera, "updateProjectionMatrix");
    const state = evaluateFixedPose({
      position: [1, 2, 3],
      rotation: [0, 0.3826834323650898, 0, 0.9238795325112867],
      lens: { projection: "perspective", fov: 70, near: 0.2, far: 500 }
    });

    applyThreeCameraState(camera, state);

    expect(camera.position.toArray()).toEqual([1, 2, 3]);
    expect(camera.quaternion.toArray()).toEqual([0, 0.3826834323650898, 0, 0.9238795325112867]);
    expect(camera.fov).toBe(70);
    expect(camera.near).toBe(0.2);
    expect(camera.far).toBe(500);
    expect(updateMatrixWorld).toHaveBeenCalledWith(true);
    expect(updateProjectionMatrix).toHaveBeenCalledTimes(1);
    expect(matrixWorldElements(camera)).not.toEqual(beforeMatrixWorld);
    expect(projectionElements(camera)).not.toEqual(beforeProjection);
  });

  it("writes an orthographic CameraState into a real OrthographicCamera", () => {
    const camera = new OrthographicCamera(-2, 2, 2, -2, 0.1, 1000);
    const beforeProjection = projectionElements(camera);
    const updateMatrixWorld = vi.spyOn(camera, "updateMatrixWorld");
    const updateProjectionMatrix = vi.spyOn(camera, "updateProjectionMatrix");
    const state = evaluateFixedPose({
      position: [-1, 4, 8],
      rotation: [0, 0, 0, 1],
      lens: { projection: "orthographic", orthographicSize: 4, near: 0.5, far: 80 }
    });

    applyThreeCameraState(camera, state);

    expect(camera.position.toArray()).toEqual([-1, 4, 8]);
    expect(camera.quaternion.toArray()).toEqual([0, 0, 0, 1]);
    expect(camera.zoom).toBe(0.25);
    expect(camera.near).toBe(0.5);
    expect(camera.far).toBe(80);
    expect(updateMatrixWorld).toHaveBeenCalledWith(true);
    expect(updateProjectionMatrix).toHaveBeenCalledTimes(1);
    expect(projectionElements(camera)).not.toEqual(beforeProjection);
  });

  it("preserves real camera clip planes when optional lens fields are missing", () => {
    const camera = new PerspectiveCamera(45, 4 / 3, 0.25, 90);
    const beforeProjection = projectionElements(camera);
    const updateProjectionMatrix = vi.spyOn(camera, "updateProjectionMatrix");
    const state = evaluateFixedPose({
      position: [0, 1, 2],
      rotation: [0, 0, 0, 1],
      lens: { projection: "perspective", fov: 65 }
    });

    applyThreeCameraState(camera, state);

    expect(camera.position.toArray()).toEqual([0, 1, 2]);
    expect(camera.quaternion.toArray()).toEqual([0, 0, 0, 1]);
    expect(camera.fov).toBe(65);
    expect(camera.near).toBe(0.25);
    expect(camera.far).toBe(90);
    expect(updateProjectionMatrix).toHaveBeenCalledTimes(1);
    expect(projectionElements(camera)).not.toEqual(beforeProjection);
  });

  it("applies a preset-generated CameraState to a real PerspectiveCamera", () => {
    const camera = new PerspectiveCamera(50, 16 / 9, 0.1, 1000);
    const updateMatrixWorld = vi.spyOn(camera, "updateMatrixWorld");
    const updateProjectionMatrix = vi.spyOn(camera, "updateProjectionMatrix");
    const evaluation = evaluateThirdPersonGameplayPreset({
      target: [1, 0, 2],
      look: { yaw: 35, pitch: -12 },
      distance: 4.5,
      shoulder: 0.5,
      lens: { projection: "perspective", fov: 62, near: 0.3, far: 250 }
    }, { time: 1.25 });
    const state = evaluation.state;

    applyThreeCameraState(camera, state);

    expect(camera.position.x).toBeCloseTo(state.position.x, 10);
    expect(camera.position.y).toBeCloseTo(state.position.y, 10);
    expect(camera.position.z).toBeCloseTo(state.position.z, 10);
    expect(camera.quaternion.toArray()).toEqual([
      state.rotation.x,
      state.rotation.y,
      state.rotation.z,
      state.rotation.w
    ]);
    expectVectorClose(
      new Vector3(0, 0, -1).applyQuaternion(camera.quaternion),
      stateLookDirection(state.rotation)
    );
    expect(camera.fov).toBe(62);
    expect(camera.near).toBe(0.3);
    expect(camera.far).toBe(250);
    expect(camera.matrixWorld.elements[12]).toBeCloseTo(state.position.x, 10);
    expect(camera.matrixWorld.elements[13]).toBeCloseTo(state.position.y, 10);
    expect(camera.matrixWorld.elements[14]).toBeCloseTo(state.position.z, 10);
    expect(updateMatrixWorld).toHaveBeenCalledWith(true);
    expect(updateProjectionMatrix).toHaveBeenCalledTimes(1);
  });
});
