export type ChannelDelta<TValue> = TValue extends object ? Partial<TValue> : TValue;

export interface ControlChannel<TValue> {
  readonly id: string;
  readonly value: TValue;
  readonly target?: TValue;
  update(dt: number): void;
  set(value: TValue): void;
  add(delta: ChannelDelta<TValue>): void;
  snapshot(): TValue;
}
