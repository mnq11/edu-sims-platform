/**
 * نموذج البندول البسيط — معادلة θ″ = -(g/L)sinθ - c·θ′ بتكامل نصف خطوة السرعة.
 * التحقق العلمي: زمن الدورة للزوايا الصغيرة يقارب 2π√(L/g) (اختبار ±2٪)،
 * وحفظ الطاقة عند غياب التخميد (سعة الذبذبة ثابتة).
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = {
  length: 1.0, // م
  gravity: 9.81, // م/ث²
  releaseAngleDeg: 15, // درجة
  damping: 0, // معامل تخميد مبسط /ث
};

export class PendulumModel extends SimModel {
  readonly length = new NumberProperty(DEFAULTS.length, { min: 0.2, max: 3, step: 0.05 });
  readonly gravity = new NumberProperty(DEFAULTS.gravity, { min: 1, max: 25, step: 0.01 });
  readonly releaseAngleDeg = new NumberProperty(DEFAULTS.releaseAngleDeg, { min: 1, max: 80, step: 1 });
  readonly damping = new NumberProperty(DEFAULTS.damping, { min: 0, max: 1, step: 0.01 });

  /** زاوية البندول عن الشاقول (راديان) وسرعته الزاوية. */
  readonly theta = new Property(0);
  readonly omega = new Property(0);
  readonly time = new Property(0);
  readonly swinging = new Property(false);

  constructor() {
    super();
    this.release();
  }

  /** تحرير البندول من زاوية الانطلاق الحالية بلا سرعة ابتدائية. */
  release(): void {
    this.theta.value = (this.releaseAngleDeg.value * Math.PI) / 180;
    this.omega.value = 0;
    this.time.value = 0;
    this.swinging.value = true;
    this.play();
  }

  protected step(dt: number): void {
    if (!this.swinging.value) return;
    const alpha =
      -(this.gravity.value / this.length.value) * Math.sin(this.theta.value) -
      this.damping.value * this.omega.value;
    // نصف خطوة السرعة: السرعة أولاً ثم الموضع الزاوي بالسرعة الجديدة
    this.omega.value += alpha * dt;
    this.theta.value += this.omega.value * dt;
    this.time.value += dt;

    // إيقاف تلقائي عند تلاشي الذبذبة شبه الكامل (تخميد عالٍ)
    if (Math.abs(this.omega.value) < 1e-4 && Math.abs(this.theta.value) < 1e-4 && this.time.value > 1) {
      this.swinging.value = false;
      this.pause();
    }
  }

  reset(): void {
    this.length.value = DEFAULTS.length;
    this.gravity.value = DEFAULTS.gravity;
    this.releaseAngleDeg.value = DEFAULTS.releaseAngleDeg;
    this.damping.value = DEFAULTS.damping;
    this.release();
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        length: this.length.value,
        gravity: this.gravity.value,
        releaseAngleDeg: this.releaseAngleDeg.value,
        damping: this.damping.value,
      },
    };
  }

  setState(state: SimState): void {
    const v = state.values;
    this.length.value = Number(v['length'] ?? DEFAULTS.length);
    this.gravity.value = Number(v['gravity'] ?? DEFAULTS.gravity);
    this.releaseAngleDeg.value = Number(v['releaseAngleDeg'] ?? DEFAULTS.releaseAngleDeg);
    this.damping.value = Number(v['damping'] ?? DEFAULTS.damping);
    this.release();
  }
}

/** زمن الدورة التحليلي للزوايا الصغيرة — مرجع الاختبار العلمي. */
export function smallAnglePeriod(length: number, gravity: number): number {
  return 2 * Math.PI * Math.sqrt(length / gravity);
}
