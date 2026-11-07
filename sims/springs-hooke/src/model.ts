/**
 * نموذج النوابض وقانون هوك — m·x″ = −k·x بتكامل نصف خطوة السرعة.
 * التحقق العلمي: زمن الدورة T = 2π√(m/k) ضمن ±2٪، وحفظ الطاقة
 * E = ½kx² + ½mv² ضمن ±0.5٪ على مدى دورات كاملة (بلا تخميد).
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = {
  mass: 1, // كغ
  springConstant: 50, // نيوتن/م
  initialStretch: 0.2, // م
};

export class SpringsModel extends SimModel {
  readonly mass = new NumberProperty(DEFAULTS.mass, { min: 0.1, max: 10, step: 0.1 });
  readonly springConstant = new NumberProperty(DEFAULTS.springConstant, { min: 5, max: 200, step: 1 });
  readonly initialStretch = new NumberProperty(DEFAULTS.initialStretch, { min: 0.05, max: 0.5, step: 0.01 });

  /** الإزاحة الحالية عن موضع الاتزان (م) والسرعة (م/ث). */
  readonly x = new Property(0);
  readonly v = new Property(0);
  readonly time = new Property(0);
  readonly oscillating = new Property(false);

  constructor() {
    super();
    this.release();
  }

  /** تحرير الكتلة من الإزاحة الابتدائية بلا سرعة ابتدائية. */
  release(): void {
    this.x.value = this.initialStretch.value;
    this.v.value = 0;
    this.time.value = 0;
    this.oscillating.value = true;
    this.play();
  }

  /** زمن الدورة النظري T = 2π√(m/k) بالثواني. */
  get period(): number {
    return 2 * Math.PI * Math.sqrt(this.mass.value / this.springConstant.value);
  }

  /** الطاقة الميكانيكية الكلية المحفوظة E = ½·k·x₀² بالجول. */
  get totalEnergy(): number {
    return 0.5 * this.springConstant.value * this.initialStretch.value ** 2;
  }

  /** الطاقة الحالية من الحالة الحركية — يجب أن تساوي totalEnergy دوماً. */
  get currentEnergy(): number {
    return (
      0.5 * this.springConstant.value * this.x.value ** 2 +
      0.5 * this.mass.value * this.v.value ** 2
    );
  }

  /** قوة الاسترجاع F = −k·x بالنيوتن. */
  get force(): number {
    return -this.springConstant.value * this.x.value;
  }

  protected step(dt: number): void {
    const a = -(this.springConstant.value / this.mass.value) * this.x.value;
    this.v.value += a * dt;
    this.x.value += this.v.value * dt;
    this.time.value += dt;
  }

  reset(): void {
    this.mass.value = DEFAULTS.mass;
    this.springConstant.value = DEFAULTS.springConstant;
    this.initialStretch.value = DEFAULTS.initialStretch;
    this.release();
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        mass: this.mass.value,
        springConstant: this.springConstant.value,
        initialStretch: this.initialStretch.value,
      },
    };
  }

  setState(state: SimState): void {
    const vals = state.values;
    this.mass.value = Number(vals['mass'] ?? DEFAULTS.mass);
    this.springConstant.value = Number(vals['springConstant'] ?? DEFAULTS.springConstant);
    this.initialStretch.value = Number(vals['initialStretch'] ?? DEFAULTS.initialStretch);
    this.release();
  }
}
