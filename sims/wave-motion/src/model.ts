/**
 * نموذج الموجات — موجة جيبية مستعرضة y(x,t) = A·sin(kx − ωt).
 * العلاقة الذهبية v = f·λ محفوظة جبرياً؛ الزمن يتقدم عبر الساعة الثابتة
 * والتحقق يقيس زمن الدورة وسرعة انتقال الطور عددياً.
 */
import { NumberProperty, Property, SimModel, derived } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = {
  frequency: 1, // هرتز
  amplitude: 0.5, // متر
  waveSpeed: 4, // م/ث
};

export class WaveModel extends SimModel {
  readonly frequency = new NumberProperty(DEFAULTS.frequency, { min: 0.1, max: 5, step: 0.1 });
  readonly amplitude = new NumberProperty(DEFAULTS.amplitude, { min: 0.1, max: 1, step: 0.05 });
  readonly waveSpeed = new NumberProperty(DEFAULTS.waveSpeed, { min: 0.5, max: 10, step: 0.5 });

  /** الطول الموجي λ = v/f بالمتر. */
  readonly wavelength: Property<number>;
  /** زمن دورة نقطة واحدة T = 1/f بالثواني. */
  readonly period: Property<number>;
  /** زمن الموجة الحالي بالثواني. */
  readonly time = new Property(0);

  constructor() {
    super();
    this.wavelength = derived(this.frequency, () => this.waveSpeed.value / this.frequency.value);
    this.waveSpeed.link(() => {
      this.wavelength.value = this.waveSpeed.value / this.frequency.value;
    });
    this.period = derived(this.frequency, (f) => 1 / f);
  }

  /** إزاحة الوسط عند الموضع x والزمن الحالي — y = A·sin(kx − ωt). */
  displacement(x: number, t: number = this.time.value): number {
    const k = (2 * Math.PI) / this.wavelength.value;
    const omega = 2 * Math.PI * this.frequency.value;
    return this.amplitude.value * Math.sin(k * x - omega * t);
  }

  protected step(dt: number): void {
    this.time.value += dt;
  }

  reset(): void {
    this.frequency.value = DEFAULTS.frequency;
    this.amplitude.value = DEFAULTS.amplitude;
    this.waveSpeed.value = DEFAULTS.waveSpeed;
    this.time.value = 0;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        frequency: this.frequency.value,
        amplitude: this.amplitude.value,
        waveSpeed: this.waveSpeed.value,
      },
    };
  }

  setState(state: SimState): void {
    const vals = state.values;
    this.frequency.value = Number(vals['frequency'] ?? DEFAULTS.frequency);
    this.amplitude.value = Number(vals['amplitude'] ?? DEFAULTS.amplitude);
    this.waveSpeed.value = Number(vals['waveSpeed'] ?? DEFAULTS.waveSpeed);
    this.time.value = 0;
  }
}
