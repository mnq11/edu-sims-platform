/**
 * نموذج مقاييس النزعة المركزية — بيانات قابلة للتحرير مع وسيط ومنوال ومدى
 * وانحراف معياري (مجتمع كامل ÷n). كل المقاييس تُحسب جبرياً من البيانات.
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULT_DATA: readonly number[] = [4, 7, 7, 9, 12];
export const MAX_POINTS = 24;

/** الوسط الحسابي — NaN لمصفوفة فارغة. */
export function mean(xs: readonly number[]): number {
  if (xs.length === 0) return NaN;
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

/** الوسيط — NaN لمصفوفة فارغة. */
export function median(xs: readonly number[]): number {
  if (xs.length === 0) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 === 1 ? s[mid]! : (s[mid - 1]! + s[mid]!) / 2;
}

/** المنوال — مصفوفة بأكثر القيم تكراراً؛ فارغة إذا تساوت كل التكرارات. */
export function mode(xs: readonly number[]): number[] {
  if (xs.length === 0) return [];
  const counts = new Map<number, number>();
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1);
  const max = Math.max(...counts.values());
  if (max === 1) return []; // لا تكرار — لا منوال
  const modes = [...counts.entries()].filter(([, n]) => n === max).map(([x]) => x);
  return modes.sort((a, b) => a - b);
}

/** المدى = الأكبر − الأصغر. */
export function range(xs: readonly number[]): number {
  if (xs.length === 0) return NaN;
  return Math.max(...xs) - Math.min(...xs);
}

/** الانحراف المعياري لمجتمع كامل: √(Σ(x−μ)²/n). */
export function stdDev(xs: readonly number[]): number {
  if (xs.length === 0) return NaN;
  const mu = mean(xs);
  const variance = xs.reduce((s, x) => s + (x - mu) ** 2, 0) / xs.length;
  return Math.sqrt(variance);
}

export class StatsModel extends SimModel {
  /** القيمة الحالية لشريط الإضافة. */
  readonly newValue = new NumberProperty(10, { min: 0, max: 20, step: 1 });

  readonly values = new Property<readonly number[]>(DEFAULT_DATA);
  readonly count = new Property(DEFAULT_DATA.length);
  readonly mean = new Property(mean(DEFAULT_DATA));
  readonly median = new Property(median(DEFAULT_DATA));
  readonly mode = new Property<readonly number[]>(mode(DEFAULT_DATA));
  readonly range = new Property(range(DEFAULT_DATA));
  readonly stdDev = new Property(stdDev(DEFAULT_DATA));

  constructor() {
    super();
  }

  /** إعادة حساب كل المقاييس من البيانات الحالية. */
  private recompute(): void {
    const xs = this.values.value;
    this.count.value = xs.length;
    this.mean.value = mean(xs);
    this.median.value = median(xs);
    this.mode.value = mode(xs);
    this.range.value = range(xs);
    this.stdDev.value = stdDev(xs);
  }

  /** إضافة قيمة الشريط الحالية إلى البيانات (حتى MAX_POINTS). */
  addValue(): boolean {
    const xs = this.values.value;
    if (xs.length >= MAX_POINTS) return false;
    this.values.value = [...xs, this.newValue.value];
    this.recompute();
    return true;
  }

  /** حذف آخر قيمة — لا شيء إذا بقيت قيمة واحدة. */
  removeLast(): boolean {
    const xs = this.values.value;
    if (xs.length <= 1) return false;
    this.values.value = xs.slice(0, -1);
    this.recompute();
    return true;
  }

  protected step(_dt: number): void {
    // بيانات ساكنة — لا تطور زمنياً.
  }

  reset(): void {
    this.values.value = DEFAULT_DATA;
    this.newValue.value = 10;
    this.recompute();
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: { data: this.values.value.join(','), newValue: this.newValue.value },
    };
  }

  setState(state: SimState): void {
    const v = state.values as { data?: string; newValue?: number };
    if (typeof v.data === 'string' && v.data.length > 0) {
      const parsed = v.data
        .split(',')
        .map(Number)
        .filter((n) => Number.isFinite(n) && n >= 0 && n <= 20)
        .slice(0, MAX_POINTS);
      if (parsed.length > 0) {
        this.values.value = parsed;
        this.recompute();
      }
    }
    if (typeof v.newValue === 'number') this.newValue.value = v.newValue;
  }
}
