import type { CameraState } from "../state/CameraState";
import { inheritControlChannels } from "../channels/ChannelInheritance";
import {
  normalizeActivationOptions,
  type CameraActivationOptions,
  type CameraActivationRecord
} from "./Activation";
import { blendCameraState, blendProgress, type BlendOptions } from "./Blend";
import { evaluateVirtualCamera, isVirtualCameraEnabled, type VirtualCamera } from "./VirtualCamera";

export interface CameraBrainUpdateContext {
  readonly dt: number;
  readonly time: number;
}

export class CameraBrain {
  readonly #cameras = new Map<string, VirtualCamera>();
  #activeId: string | null = null;
  #output: CameraState | null = null;
  #activation: CameraActivationRecord | null = null;
  #blend: {
    toId: string;
    fromState: CameraState;
    elapsed: number;
    options: BlendOptions;
  } | null = null;

  get activeId(): string | null {
    return this.#activeId;
  }

  get output(): CameraState | null {
    return this.#output;
  }

  get activation(): CameraActivationRecord | null {
    return this.#activation;
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

  activate(id: string, options: CameraActivationOptions = {}): void {
    if (!this.#cameras.has(id)) {
      throw new Error(`Cannot activate unknown virtual camera: ${id}`);
    }

    const normalized = normalizeActivationOptions(options);
    if (this.#activeId === id && !normalized.force) {
      return;
    }

    this.#activation = Object.freeze({
      fromId: this.#activeId,
      toId: id,
      transition: normalized.transition
    });

    if (normalized.transition === "matchThenBlend" && options.inheritChannels !== undefined) {
      inheritControlChannels(options.inheritChannels);
    }

    if (normalized.transition === "blend" || normalized.transition === "matchThenBlend") {
      this.#blend = this.#output === null
        ? null
        : {
            toId: id,
            fromState: this.#output,
            elapsed: 0,
            options: options.blend ?? { duration: 0 }
          };
    } else {
      this.#blend = null;
    }

    this.#activeId = id;

    if (normalized.transition === "cut") {
      this.#output = null;
    }
  }

  update(context: CameraBrainUpdateContext): CameraState | null {
    const camera = this.resolveActiveCamera();
    if (camera === null) {
      this.#output = null;
      return null;
    }

    this.#activeId = camera.id;
    const targetState = evaluateVirtualCamera(camera, {
      ...context,
      ...(this.#output === null ? {} : { previous: this.#output })
    });

    if (targetState === null) {
      this.#output = null;
      return null;
    }

    if (this.#blend !== null && this.#blend.toId === camera.id) {
      this.#blend.elapsed += context.dt;
      const progress = blendProgress(this.#blend.elapsed, this.#blend.options);
      this.#output = blendCameraState(this.#blend.fromState, targetState, progress);

      if (progress >= 1) {
        this.#blend = null;
      }

      return this.#output;
    }

    this.#output = targetState;
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
