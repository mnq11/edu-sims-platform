/**
 * نموذج نظرية فيثاغورس — مثلث قائم بضلعين a وb ووتر c = √(a²+b²).
 * تُعرض مربعات الأضلاع (a²، b²، c²) لتجسيد العلاقة بصرياً وعددياً.
 */
import { NumberProperty, Property, SimModel, derived } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = { legA: 3, legB: 4 };

/** هل (a, b, c) ثلاثية فيثاغورسية صحيحة (أعداد طبيعية تُرضي النظرية)؟ */
export function isIntegerTriple(a: number, b: number, c: number): boolean {
  return (
    Number.isInteger(a) &&
    Number.isInteger(b) &&
    Number.isInteger(c) &&
    a > 0 &&
    b > 0 &&
    a * a + b * b === c * c
  );
}

/** أشهر الثلاثيات الفيثاغورسية الصحيحة (a ≤ b، بلا مضاعفات مشتركة ضمن النطاق). */
export const KNOWN_TRIPLES: readonly (readonly [number, number, number])[] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
  [6, 8, 10],
  [9, 12, 15],
  [12, 16, 20],
  [10, 24, 26],
];

export class PythagorasModel extends SimModel {
  readonly legA = new NumberProperty(DEFAULTS.legA, { min: 1, max: 15, step: 0.5 });
  readonly legB = new NumberProperty(DEFAULTS.legB, { min: 1, max: 15, step: 0.5 });

  /** الوتر c = √(a²+b²). */
  readonly hypotenuse: Property<number>;
  /** a² + b² — الطرف الأول. */
  readonly sumOfSquares: Property<number>;
  /** مساحة المثلث = ab/2. */
  readonly area: Property<number>;
  /** هل الضلعان الحاليان مع الوتر ثلاثية صحيحة؟ */
  readonly isTriple: Property<boolean>;

  constructor() {
    super();
    const recompute = () => {
      const a = this.legA.value;
      const b = this.legB.value;
      this.hypotenuse.value = Math.hypot(a, b);
      this.sumOfSquares.value = a * a + b * b;
      this.area.value = (a * b) / 2;
      this.isTriple.value = isIntegerTriple(a, b, Math.hypot(a, b));
    };
    this.hypotenuse = derived(this.legA, () => Math.hypot(this.legA.value, this.legB.value));
    this.sumOfSquares = derived(this.legA, () => {
      const a = this.legA.value;
      const b = this.legB.value;
      return a * a + b * b;
    });
    this.area = derived(this.legA, () => (this.legA.value * this.legB.value) / 2);
    this.isTriple = derived(this.legA, () =>
      isIntegerTriple(this.legA.value, this.legB.value, Math.hypot(this.legA.value, this.legB.value)),
    );
    this.legB.link(recompute);
  }

  /** c² — يساوي sumOfSquares دائماً (هذه هي النظرية). */
  get hypotenuseSquared(): number {
    const c = this.hypotenuse.value;
    return c * c;
  }

  protected step(_dt: number): void {
    // نموذج جبري ساكن — لا تطور زمنياً.
  }

  reset(): void {
    this.legA.value = DEFAULTS.legA;
    this.legB.value = DEFAULTS.legB;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: { legA: this.legA.value, legB: this.legB.value },
    };
  }

  setState(state: SimState): void {
    const v = state.values as { legA?: number; legB?: number };
    if (typeof v.legA === 'number') this.legA.value = v.legA;
    if (typeof v.legB === 'number') this.legB.value = v.legB;
  }
}
