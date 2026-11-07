import { describe, expect, it } from 'vitest';
import { SortingModel, generateArray, traceSort } from './model.js';

const isSorted = (a: readonly number[]): boolean =>
  a.every((v, i) => i === 0 || a[i - 1]! <= v);

describe('تصوير الفرز — التحقق من الخوارزميات', () => {
  it('مولد المصفوفات حتمي: نفس البذرة تعطي نفس المصفوفة', () => {
    expect(generateArray(10, 7)).toEqual(generateArray(10, 7));
    expect(generateArray(10, 7)).not.toEqual(generateArray(10, 8));
  });

  it('الخوارزميات الثلاث تنتج مصفوفة مرتبة فعلاً', () => {
    const input = generateArray(30, 99);
    for (const algo of ['bubble', 'selection', 'insertion'] as const) {
      const arr = [...input];
      const trace = traceSort(arr, algo);
      // إعادة تطبيق التبديلات على نسخة للتحقق من صحة الأثر
      const replay = [...input];
      for (const op of trace.ops) {
        if (op.type === 'swap') [replay[op.i], replay[op.j]] = [replay[op.j]!, replay[op.i]!];
      }
      expect(isSorted(replay)).toBe(true);
    }
  });

  it('الفرز الفقاعي لا يتجاوز n(n-1)/2 مقارنة (حد التعقيد التربيعي)', () => {
    const n = 25;
    const trace = traceSort(generateArray(n, 5), 'bubble');
    expect(trace.comparisons).toBeLessThanOrEqual((n * (n - 1)) / 2);
  });

  it('الفرز الاختياري لا يبدّل أكثر من n-1 مرة مهما كان الإدخال', () => {
    for (const seed of [1, 2, 3, 42]) {
      const trace = traceSort(generateArray(30, seed), 'selection');
      expect(trace.swaps).toBeLessThanOrEqual(29);
    }
  });

  it('الفرز بالإدخال كفء على مصفوفة شبه مرتبة (ميزته الشهيرة)', () => {
    const almost = Array.from({ length: 30 }, (_, i) => i + 1);
    [almost[5], almost[6]] = [almost[6]!, almost[5]!]; // اضطراب واحد
    const insertion = traceSort(almost, 'insertion');
    const bubble = traceSort(almost, 'bubble');
    expect(insertion.comparisons).toBeLessThan(bubble.comparisons);
  });

  it('النموذج يكمل الفرز خطوة بخطوة حتى النهاية', () => {
    const model = new SortingModel();
    model.size.value = 15;
    model.regenerate();
    let guard = 0;
    while (!model.done.value && guard < 100_000) {
      model.clock.stepOnce();
      guard += 1;
    }
    expect(model.done.value).toBe(true);
    expect(isSorted(model.array.value)).toBe(true);
    expect(model.comparisons.value).toBeGreaterThan(0);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const model = new SortingModel();
    model.algorithm.value = 'insertion';
    model.seed.value = 777;
    model.regenerate(); // كما تفعل الواجهة عند تغيير المعاملات
    const state = model.getState();
    const restored = new SortingModel();
    restored.setState(state);
    expect(restored.algorithm.value).toBe('insertion');
    expect(restored.seed.value).toBe(777);
    expect(restored.array.value).toEqual(model.array.value); // حتمية البذرة
  });
});
