/**
 * Sustained-low-frame-rate detector for `<SceneCanvas>` (spec §6.5: swap to the poster below
 * 40fps for 3s). Frame deltas are grouped into ~0.5s buckets; the guard trips once consecutive
 * low buckets add up to `windowMs`. A single long gap (tab switch, demand loop) resets it instead
 * of counting as slowness. Pure and framework-free, so it is unit-tested directly.
 */
export class FpsGuard {
  private bucketTime = 0
  private bucketFrames = 0
  private lowTime = 0
  private trippedFlag = false

  constructor(
    readonly minFps = 40,
    readonly windowMs = 3000,
    readonly bucketMs = 500,
    readonly maxGapMs = 1000,
  ) {}

  get tripped(): boolean {
    return this.trippedFlag
  }

  /** Feed one frame's delta in seconds. Returns true once the guard has tripped. */
  push(deltaSeconds: number): boolean {
    if (this.trippedFlag) return true
    const ms = deltaSeconds * 1000
    if (!(ms > 0) || ms > this.maxGapMs) {
      this.reset()
      return false
    }
    this.bucketTime += ms
    this.bucketFrames += 1
    if (this.bucketTime >= this.bucketMs) {
      const fps = (this.bucketFrames * 1000) / this.bucketTime
      this.lowTime = fps < this.minFps ? this.lowTime + this.bucketTime : 0
      this.bucketTime = 0
      this.bucketFrames = 0
      if (this.lowTime >= this.windowMs) this.trippedFlag = true
    }
    return this.trippedFlag
  }

  reset(): void {
    this.bucketTime = 0
    this.bucketFrames = 0
    this.lowTime = 0
    this.trippedFlag = false
  }
}
