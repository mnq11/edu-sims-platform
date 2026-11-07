/**
 * نموذج مستكشف المعادلة التربيعية y = ax² + bx + c.
 * الرأس والمميز والجذور تُحسب جبرياً بدقة تامة — بلا تقريب عددي.
 */
import { NumberProperty, Property, SimModel, derived } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = { a: 1, b: 0, c: 0 };

/** قيمة الاقتران عند x. */
export function evaluateY(a: number, b: number, c: number, x: number): number {
  return a * x * x + b * x + c;
}

/** المميز Δ = b² − 4ac. */
export function discriminant(a: number, b: number, c: number): number {
  return b * b - 4 * a * c;
}

/** إحداثيات الرأس (h, k) حيث h = −b/2a و k = c − b²/4a. */
export function vertex(a: number, b: number, c: number): { h: number; k: number } {
  const h = -b / (2 * a);
  return { h, k: evaluateY(a, b, c, h) };
}

/** الجذور الحقيقية مرتبة تصاعدياً — مصفوفة فارغة عند Δ<0 وجذر مضاعف عند Δ=0. */
export function roots(a: number, b: number, c: number): number[] {
  const d = discriminant(a, b, c);
  if (d < 0) return [];
  if (d === 0) return [-b / (2 * a)];
  const s = Math.sqrt(d);
  const r1 = (-b - s) / (2 * a);
  const r2 = (-b + s) / (2 * a);
  return r1 <= r2 ? [r1, r2] : [r2, r1];
}

export class QuadraticModel extends SimModel {
  readonly a = new NumberProperty(DEFAULTS.a, { min: -3, max: 3, step: 0.1 });
  readonly b = new NumberProperty(DEFAULTS.b, { min: -10, max: 10, step: 0.5 });
  readonly c = new NumberProperty(DEFAULTS.c, { min: -10, max: 10, step: 0.5 });

  readonly discriminant: Property<number>;
  readonly vertexH: Property<number>;
  readonly vertexK: Property<number>;
  /** عدد الجذور الحقيقية: 0 أو 1 (مضاعف) أو 2. */
  readonly rootCount: Property<number>;

  constructor() {
    super();
    const recompute = () => {
      const av = this.a.value;
      const bv = this.b.value;
      const cv = this.c.value;
      this.discriminant.value = discriminant(av, bv, cv);
      const { h, k } = vertex(av, bv, cv);
      this.vertexH.value = h;
      this.vertexK.value = k;
      this.rootCount.value = roots(av, bv, cv).length;
    };
    this.discriminant = derived(this.a, () => discriminant(this.a.value, this.b.value, this.c.value));
    this.vertexH = derived(this.a, () => vertex(this.a.value, this.b.value, this.c.value).h);
    this.vertexK = derived(this.a, () => vertex(this.a.value, this.b.value, this.c.value).k);
    this.rootCount = derived(this.a, () => roots(this.a.value, this.b.value, this.c.value).length);
    this.b.link(recompute);
    this.c.link(recompute);
  }

  /** قيمة y عند x بالمعاملات الحالية. */
  evaluate(x: number): number {
    return evaluateY(this.a.value, this.b.value, this.c.value, x);
  }

  /** الجذور الحقيقية بالمعاملات الحالية. */
  currentRoots(): number[] {
    return roots(this.a.value, this.b.value, this.c.value);
  }

  /** هل القطع مفتوح للأعلى؟ */
  get opensUp(): boolean {
    return this.a.value > 0;
  }

  protected step(_dt: number): void {
    // نموذج جبري ساكن — لا تطور زمنياً.
  }

  reset(): void {
    this.a.value = DEFAULTS.a;
    this.b.value = DEFAULTS.b;
    this.c.value = DEFAULTS.c;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: { a: this.a.value, b: this.b.value, c: this.c.value },
    };
  }

  setState(state: SimState): void {
    const v = state.values as { a?: number; b?: number; c?: number };
    if (typeof v.a === 'number' && v.a !== 0) this.a.value = v.a;
    if (typeof v.b === 'number') this.b.value = v.b;
    if (typeof v.c === 'number') this.c.value = v.c;
  }
}
