/**
 * نموذج تصوير خوارزميات الفرز (CS-201) — سباق حي بين الفرز الفقاعي
 * والاختياري والإدخالي على المصفوفة ذاتها، مع عدّ المقارنات والتبديلات
 * لكشف التعقيد الزمني بالتجربة لا بالتلقين.
 * العشوائية بمولّد LCG بذرة محددة — نتائج قابلة لإعادة الإنتاج والاختبار.
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

export type SortAlgorithm = 'bubble' | 'selection' | 'insertion';
export interface SortOp {
  readonly type: 'compare' | 'swap';
  readonly i: number;
  readonly j: number;
}
export interface SortTrace {
  readonly ops: readonly SortOp[];
  readonly comparisons: number;
  readonly swaps: number;
}

/** مولد عشوائية LCG حتمي — نفس البذرة تعطي نفس المصفوفة دائماً. */
export function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function generateArray(n: number, seed: number): number[] {
  const rand = lcg(seed);
  return Array.from({ length: n }, () => 1 + Math.floor(rand() * 99));
}

/** يبني أثر العمليات لخوارزمية فرز على نسخة من المصفوفة. */
export function traceSort(input: readonly number[], algorithm: SortAlgorithm): SortTrace {
  const arr = [...input];
  const ops: SortOp[] = [];
  let comparisons = 0;
  let swaps = 0;
  const n = arr.length;
  const compare = (i: number, j: number): number => {
    comparisons += 1;
    ops.push({ type: 'compare', i, j });
    return arr[i]! - arr[j]!;
  };
  const swap = (i: number, j: number): void => {
    swaps += 1;
    ops.push({ type: 'swap', i, j });
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  };

  if (algorithm === 'bubble') {
    for (let end = n - 1; end > 0; end -= 1) {
      for (let i = 0; i < end; i += 1) {
        if (compare(i, i + 1) > 0) swap(i, i + 1);
      }
    }
  } else if (algorithm === 'selection') {
    for (let i = 0; i < n - 1; i += 1) {
      let minIdx = i;
      for (let j = i + 1; j < n; j += 1) {
        if (compare(minIdx, j) > 0) minIdx = j;
      }
      if (minIdx !== i) swap(i, minIdx);
    }
  } else {
    for (let i = 1; i < n; i += 1) {
      let j = i;
      while (j > 0) {
        comparisons += 1;
        ops.push({ type: 'compare', i: j - 1, j });
        if (arr[j - 1]! <= arr[j]!) break;
        swap(j - 1, j);
        j -= 1;
      }
    }
  }
  return { ops, comparisons, swaps };
}

const DEFAULTS = { size: 20, seed: 42, algorithm: 'bubble' as SortAlgorithm };
const OPS_PER_STEP = 2; // عمليات لكل خطوة ساعة — سرعة العرض الافتراضية

export class SortingModel extends SimModel {
  readonly algorithm = new Property<SortAlgorithm>(DEFAULTS.algorithm);
  readonly size = new NumberProperty(DEFAULTS.size, { min: 5, max: 60, step: 1 });
  readonly seed = new NumberProperty(DEFAULTS.seed, { min: 1, max: 9999, step: 1 });

  /** المصفوفة الحية أثناء الفرز (قيم 1..100). */
  readonly array = new Property<readonly number[]>([]);
  /** مواضع المقارنة الجارية للإبراز البصري. */
  readonly activeIndices = new Property<readonly [number, number] | null>(null);
  readonly comparisons = new Property(0);
  readonly swaps = new Property(0);
  readonly done = new Property(false);

  private ops: readonly SortOp[] = [];
  private working: number[] = [];
  private cursor = 0;

  constructor() {
    super();
    this.regenerate();
  }

  /** يولد مصفوفة جديدة ويعيد بناء أثر الفرز. */
  regenerate(): void {
    this.working = generateArray(Math.round(this.size.value), Math.round(this.seed.value));
    const trace = traceSort(this.working, this.algorithm.value);
    this.ops = trace.ops;
    this.array.value = [...this.working];
    this.cursor = 0;
    this.comparisons.value = 0;
    this.swaps.value = 0;
    this.done.value = false;
    this.activeIndices.value = null;
    this.play();
  }

  protected step(_dt: number): void {
    if (this.done.value) return;
    for (let k = 0; k < OPS_PER_STEP && this.cursor < this.ops.length; k += 1) {
      const op = this.ops[this.cursor]!;
      if (op.type === 'swap') {
        [this.working[op.i], this.working[op.j]] = [this.working[op.j]!, this.working[op.i]!];
        this.swaps.value += 1;
      } else {
        this.comparisons.value += 1;
      }
      this.activeIndices.value = [op.i, op.j];
      this.cursor += 1;
    }
    this.array.value = [...this.working];
    if (this.cursor >= this.ops.length) {
      this.done.value = true;
      this.activeIndices.value = null;
      this.pause();
    }
  }

  reset(): void {
    this.algorithm.value = DEFAULTS.algorithm;
    this.size.value = DEFAULTS.size;
    this.seed.value = DEFAULTS.seed;
    this.regenerate();
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        algorithm: this.algorithm.value,
        size: this.size.value,
        seed: this.seed.value,
      },
    };
  }

  setState(state: SimState): void {
    const v = state.values;
    const algo = String(v['algorithm'] ?? DEFAULTS.algorithm);
    this.algorithm.value = algo === 'selection' || algo === 'insertion' ? algo : 'bubble';
    this.size.value = Number(v['size'] ?? DEFAULTS.size);
    this.seed.value = Number(v['seed'] ?? DEFAULTS.seed);
    this.regenerate();
  }
}
