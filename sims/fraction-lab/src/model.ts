/**
 * نموذج مختبر الكسور (ابتدائي) — حساب كسور دقيق بالأعداد الصحيحة
 * بلا أخطاء فاصلة عائمة: كل عملية تُعيد كسراً مبسطاً بالقاسم المشترك الأكبر.
 */
import { NumberProperty, Property, SimModel, derived } from '@edusims/core';
import type { SimState } from '@edusims/core';

/** القاسم المشترك الأكبر — خوارزمية إقليدس. */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x === 0 ? 1 : x;
}

/** يبسط كسراً ويوحّد إشارته (المقام موجب دائماً). */
export function simplify(numerator: number, denominator: number): [number, number] {
  if (denominator === 0) throw new Error('المقام لا يمكن أن يكون صفراً');
  let n = numerator;
  let d = denominator;
  if (d < 0) [n, d] = [-n, -d];
  const g = gcd(n, d);
  return [n / g, d / g];
}

export type FractionOp = 'add' | 'subtract' | 'multiply' | 'divide';

/** يطبق عملية على كسرين ويعيد الناتج مبسطاً [بسط، مقام]. */
export function applyOp(
  a: readonly [number, number],
  b: readonly [number, number],
  op: FractionOp,
): [number, number] {
  const [an, ad] = a;
  const [bn, bd] = b;
  switch (op) {
    case 'add':
      return simplify(an * bd + bn * ad, ad * bd);
    case 'subtract':
      return simplify(an * bd - bn * ad, ad * bd);
    case 'multiply':
      return simplify(an * bn, ad * bd);
    case 'divide':
      return simplify(an * bd, ad * bn);
  }
}

/** تكافؤ كسرين بعد التبسيط. */
export function equivalent(a: readonly [number, number], b: readonly [number, number]): boolean {
  const sa = simplify(a[0], a[1]);
  const sb = simplify(b[0], b[1]);
  return sa[0] === sb[0] && sa[1] === sb[1];
}

const DEFAULTS = { aNum: 1, aDen: 2, bNum: 1, bDen: 3, op: 'add' as FractionOp };

export class FractionLabModel extends SimModel {
  readonly aNum = new NumberProperty(DEFAULTS.aNum, { min: 0, max: 12, step: 1 });
  readonly aDen = new NumberProperty(DEFAULTS.aDen, { min: 1, max: 12, step: 1 });
  readonly bNum = new NumberProperty(DEFAULTS.bNum, { min: 0, max: 12, step: 1 });
  readonly bDen = new NumberProperty(DEFAULTS.bDen, { min: 1, max: 12, step: 1 });
  readonly operation = new Property<FractionOp>(DEFAULTS.op);

  /** ناتج العملية الحالية مبسطاً — مشتق من المدخلات الأربعة والعملية. */
  readonly result: Property<readonly [number, number]>;

  constructor() {
    super();
    const compute = (): readonly [number, number] =>
      applyOp(
        [this.aNum.value, this.aDen.value],
        [this.bNum.value, this.bDen.value],
        this.operation.value,
      );
    this.result = derived(this.aNum, compute);
    for (const source of [this.aDen, this.bNum, this.bDen] as const) {
      source.link(() => {
        this.result.value = compute();
      });
    }
    this.operation.link(() => {
      this.result.value = compute();
    });
  }

  protected step(_dt: number): void {
    // حساب لحظي — لا تكامل زمنياً
  }

  reset(): void {
    this.aNum.value = DEFAULTS.aNum;
    this.aDen.value = DEFAULTS.aDen;
    this.bNum.value = DEFAULTS.bNum;
    this.bDen.value = DEFAULTS.bDen;
    this.operation.value = DEFAULTS.op;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        aNum: this.aNum.value, aDen: this.aDen.value,
        bNum: this.bNum.value, bDen: this.bDen.value,
        op: this.operation.value,
      },
    };
  }

  setState(state: SimState): void {
    const v = state.values;
    this.aNum.value = Number(v['aNum'] ?? DEFAULTS.aNum);
    this.aDen.value = Number(v['aDen'] ?? DEFAULTS.aDen);
    this.bNum.value = Number(v['bNum'] ?? DEFAULTS.bNum);
    this.bDen.value = Number(v['bDen'] ?? DEFAULTS.bDen);
    const op = String(v['op'] ?? DEFAULTS.op);
    this.operation.value = op === 'subtract' || op === 'multiply' || op === 'divide' ? op : 'add';
  }
}
