import type { CameraState } from "../state/CameraState";
import { evaluateVirtualCamera, isVirtualCameraEnabled, type VirtualCamera } from "./VirtualCamera";

export interface CameraBrainUpdateContext {
  readonly dt: number;
  readonly time: number;
}

export class CameraBrain {
  readonly #cameras = new Map<string, VirtualCamera>();
  #activeId: string | null = null;
  #output: CameraState | null = null;

  get activeId(): string | null {
    return this.#activeId;
  }

  get output(): CameraState | null {
    return this.#output;
  }

  add(camera: VirtualCamera): this {
    this.#cameras.set(camera.id, camera);
    return this;
  }

  remove(id: string): boolean {
    const removed = this.#cameras.delete(id);
    if (this.#activeId === id) {
      this.#activeId = null;
      this.#output = null;
    }

    return removed;
  }

  has(id: string): boolean {
    return this.#cameras.has(id);
  }

  get(id: string): VirtualCamera | undefined {
    return this.#cameras.get(id);
  }

  list(): readonly VirtualCamera[] {
    return Object.freeze([...this.#cameras.values()]);
  }

  activate(id: string): void {
    if (!this.#cameras.has(id)) {
      throw new Error(`Cannot activate unknown virtual camera: ${id}`);
    }

    this.#activeId = id;
  }

  update(context: CameraBrainUpdateContext): CameraState | null {
    const camera = this.resolveActiveCamera();
    if (camera === null) {
      this.#output = null;
      return null;
    }

    this.#activeId = camera.id;
    this.#output = evaluateVirtualCamera(camera, {
      ...context,
      ...(this.#output === null ? {} : { previous: this.#output })
    });

    return this.#output;
  }

  private resolveActiveCamera(): VirtualCamera | null {
    if (this.#activeId !== null) {
      const active = this.#cameras.get(this.#activeId);
      if (active !== undefined && isVirtualCameraEnabled(active)) {
        return active;
      }
    }

    return [...this.#cameras.values()]
      .filter(isVirtualCameraEnabled)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))[0] ?? null;
  }
}
