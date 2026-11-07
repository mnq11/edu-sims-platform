/**
 * SimulationClock — ساعة محاكاة بخطوات زمنية ثابتة (fixed timestep).
 * تفصل منطق التكامل العددي عن معدل عرض الإطارات لضمان نتائج علمية
 * قابلة للتكرار على أي جهاز، وهو شرط أساسي في معايير المحاكاة لدينا.
 */
export type StepCallback = (dtSeconds: number) => void;

export class SimulationClock {
  private accumulator = 0;
  private lastTimestamp: number | null = null;
  private running = false;
  private readonly fixedDt: number;
  private readonly maxStepsPerFrame = 8;
  private readonly callbacks = new Set<StepCallback>();

  constructor(fixedDtSeconds = 1 / 240) {
    this.fixedDt = fixedDtSeconds;
  }

  onStep(callback: StepCallback): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  start(): void {
    this.running = true;
    this.lastTimestamp = null;
  }

  stop(): void {
    this.running = false;
  }

  get isRunning(): boolean {
    return this.running;
  }

  /** يُستدعى من requestAnimationFrame بختم زمني بالميلي ثانية. */
  tick(timestampMs: number): void {
    if (!this.running) return;
    if (this.lastTimestamp === null) {
      this.lastTimestamp = timestampMs;
      return;
    }
    const frameSeconds = Math.min((timestampMs - this.lastTimestamp) / 1000, 0.25);
    this.lastTimestamp = timestampMs;
    this.accumulator += frameSeconds;

    let steps = 0;
    while (this.accumulator >= this.fixedDt && steps < this.maxStepsPerFrame) {
      for (const callback of this.callbacks) callback(this.fixedDt);
      this.accumulator -= this.fixedDt;
      steps += 1;
    }
  }

  /** خطوة يدوية واحدة — للاختبارات والتشغيل دون اتصال بالرسوم. */
  stepOnce(): void {
    for (const callback of this.callbacks) callback(this.fixedDt);
  }

  get fixedStep(): number {
    return this.fixedDt;
  }
}
