/**
 * نموذج احتمالات نردين — التوزيع النظري الدقيق (36 حالة متساوية)
 * مع محاكاة مونت كارلو بعشوائية قابلة للحقن (اختبارات حتمية).
 * الفكرة: تقارب التردد المشاهد نحو الاحتمال النظري (قانون الأعداد الكبيرة).
 */
import { Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

/** عدد الطرق للحصول على مجموع s بنردين سداسيين (0 خارج 2..12). */
export function countWays(sum: number): number {
  if (!Number.isInteger(sum) || sum < 2 || sum > 12) return 0;
  return 6 - Math.abs(sum - 7);
}

/** الاحتمال النظري لمجموع s: عدد الطرق ÷ 36. */
export function theoreticalProbability(sum: number): number {
  return countWays(sum) / 36;
}

/** المتوسط النظري لمجموع نردين عادلين = 7 تماماً. */
export function theoreticalMean(): number {
  let total = 0;
  for (let s = 2; s <= 12; s += 1) total += s * countWays(s);
  return total / 36;
}

/** التباين النظري = 35/6. */
export function theoreticalVariance(): number {
  const mean = theoreticalMean();
  let total = 0;
  for (let s = 2; s <= 12; s += 1) total += (s - mean) ** 2 * countWays(s);
  return total / 36;
}

export class DiceModel extends SimModel {
  private readonly rng: () => number;

  /** الترددات المشاهدة للمجاميع 2..12 — الفهرس i يقابل المجموع i+2. */
  readonly observedCounts: Property<readonly number[]>;
  readonly totalRolls = new Property(0);
  /** آخر رمية بصيغة "a + b = s" أو نص فارغ قبل أول رمية. */
  readonly lastRoll = new Property('');

  constructor(rng: () => number = Math.random) {
    super();
    this.rng = rng;
    this.observedCounts = new Property<readonly number[]>(new Array<number>(11).fill(0));
  }

  private rollDie(): number {
    return Math.floor(this.rng() * 6) + 1;
  }

  /** ينفّذ times رمية محدثاً الترددات — roll(0) لا يغيّر شيئاً. */
  roll(times: number): void {
    const n = Math.max(0, Math.floor(times));
    if (n === 0) return;
    const counts = [...this.observedCounts.value];
    let last = this.lastRoll.value;
    let total = this.totalRolls.value;
    for (let i = 0; i < n; i += 1) {
      const a = this.rollDie();
      const b = this.rollDie();
      const sum = a + b;
      const idx = sum - 2;
      counts[idx] = (counts[idx] ?? 0) + 1;
      total += 1;
      last = `${a} + ${b} = ${sum}`;
    }
    this.observedCounts.value = counts;
    this.totalRolls.value = total;
    this.lastRoll.value = last;
  }

  /** التردد النسبي المشاهد لمجموع s — 0 قبل أي رمية. */
  observedFrequency(sum: number): number {
    if (this.totalRolls.value === 0) return 0;
    const idx = sum - 2;
    if (idx < 0 || idx > 10) return 0;
    return (this.observedCounts.value[idx] ?? 0) / this.totalRolls.value;
  }

  /** المتوسط المشاهد للمجاميع — 0 قبل أي رمية. */
  observedMean(): number {
    if (this.totalRolls.value === 0) return 0;
    let weighted = 0;
    for (let i = 0; i < 11; i += 1) weighted += (i + 2) * (this.observedCounts.value[i] ?? 0);
    return weighted / this.totalRolls.value;
  }

  protected step(_dt: number): void {
    // لا تكامل زمنياً — الرمي حدث لحظي
  }

  reset(): void {
    this.observedCounts.value = new Array<number>(11).fill(0);
    this.totalRolls.value = 0;
    this.lastRoll.value = '';
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: { totalRolls: this.totalRolls.value, counts: this.observedCounts.value.join(',') },
    };
  }

  setState(state: SimState): void {
    const vals = state.values;
    const raw = String(vals['counts'] ?? '');
    const parsed = raw.split(',').map((x) => {
      const n = Number(x);
      return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
    });
    const counts = new Array<number>(11).fill(0);
    for (let i = 0; i < 11 && i < parsed.length; i += 1) counts[i] = parsed[i] ?? 0;
    this.observedCounts.value = counts;
    const total = Number(vals['totalRolls'] ?? 0);
    this.totalRolls.value = Number.isFinite(total) && total >= 0 ? Math.floor(total) : 0;
    this.lastRoll.value = '';
  }
}
