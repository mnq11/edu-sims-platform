/**
 * نموذج قانون أوم — دائرة بسيطة: بطارية ومقاومة.
 * V = I·R و P = V·I علاقات جبرية دقيقة (لا تكامل عددي)،
 * وNumberProperty تضمن بقاء المقاومة موجبة دائماً (لا قسمة على صفر).
 */
import { NumberProperty, SimModel, derived, type Property } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = { voltage: 9, resistance: 100 }; // فولت، أوم

export class OhmsLawModel extends SimModel {
  readonly voltage = new NumberProperty(DEFAULTS.voltage, { min: 0, max: 24, step: 0.1 });
  readonly resistance = new NumberProperty(DEFAULTS.resistance, { min: 0.1, max: 1000, step: 0.1 });

  /** التيار بالأمبير — مشتق تلقائياً من الجهد والمقاومة. */
  readonly current: Property<number>;
  /** القدرة المتبددة بالواط. */
  readonly power: Property<number>;

  constructor() {
    super();
    this.current = derived(this.voltage, () => this.voltage.value / this.resistance.value);
    // الاشتقاق المتسلسل: أعد الربط عند تغيّر المقاومة أيضاً
    this.resistance.link(() => {
      this.current.value = this.voltage.value / this.resistance.value;
    });
    this.power = derived(this.current, (i) => this.voltage.value * i);
    this.voltage.link(() => {
      this.power.value = this.voltage.value * this.current.value;
    });
  }

  protected step(_dt: number): void {
    // نموذج جبري ساكن — لا تكامل زمنياً
  }

  reset(): void {
    this.voltage.value = DEFAULTS.voltage;
    this.resistance.value = DEFAULTS.resistance;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: { voltage: this.voltage.value, resistance: this.resistance.value },
    };
  }

  setState(state: SimState): void {
    const v = state.values;
    this.voltage.value = Number(v['voltage'] ?? DEFAULTS.voltage);
    this.resistance.value = Number(v['resistance'] ?? DEFAULTS.resistance);
  }
}
