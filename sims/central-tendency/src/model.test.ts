import { describe, expect, it } from 'vitest';
import { MAX_POINTS, StatsModel, mean, median, mode, range, stdDev } from './model.js';

describe('مقاييس النزعة — دوال إحصائية', () => {
  it('الوسط الحسابي', () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(mean([5])).toBe(5);
    expect(Number.isNaN(mean([]))).toBe(true);
  });

  it('الوسيط لعدد فردي وزوجي من القيم', () => {
    expect(median([1, 3, 5])).toBe(3);
    expect(median([5, 1, 3])).toBe(3); // يرتّب داخلياً
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });

  it('المنوال: منوال واحد، تعدد منوال، وغياب المنوال', () => {
    expect(mode([1, 2, 2, 3])).toEqual([2]);
    expect(mode([1, 1, 2, 2, 3])).toEqual([1, 2]); // ثنائي المنوال
    expect(mode([1, 2, 3])).toEqual([]); // لا تكرار
  });

  it('المدى', () => {
    expect(range([3, 10, 5])).toBe(7);
    expect(range([4])).toBe(0);
  });

  it('الانحراف المعياري (مجتمع): بيانات [2,4,4,4,5,5,7,9] تعطي 2', () => {
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2, 10);
    expect(stdDev([7, 7, 7])).toBe(0); // بيانات متطابقة
  });
});

describe('مقاييس النزعة — النموذج التفاعلي', () => {
  it('البيانات الافتراضية [4,7,7,9,12]: وسط 7.8 ووسيط 7 ومنوال 7 ومدى 8', () => {
    const m = new StatsModel();
    expect(m.mean.value).toBeCloseTo(7.8, 10);
    expect(m.median.value).toBe(7);
    expect(m.mode.value).toEqual([7]);
    expect(m.range.value).toBe(8);
  });

  it('إضافة قيمة تُحدِّث كل المقاييس فوراً', () => {
    const m = new StatsModel();
    m.newValue.value = 12;
    m.addValue(); // [4,7,7,9,12,12]
    expect(m.count.value).toBe(6);
    expect(m.mean.value).toBeCloseTo(8.5, 10);
    expect(m.median.value).toBe(8); // (7+9)/2
    expect(m.mode.value).toEqual([7, 12]);
  });

  it('الحذف يمنع إفراغ البيانات تحت قيمة واحدة', () => {
    const m = new StatsModel();
    for (let i = 0; i < 10; i++) m.removeLast();
    expect(m.count.value).toBe(1);
  });

  it('لا إضافة فوق السقف MAX_POINTS', () => {
    const m = new StatsModel();
    let added = 0;
    for (let i = 0; i < MAX_POINTS + 5; i++) if (m.addValue()) added++;
    expect(m.count.value).toBe(MAX_POINTS);
    expect(added).toBe(MAX_POINTS - 5);
  });

  it('القيم المتطرفة تسحب الوسط أكثر من الوسيط (متانة الوسيط)', () => {
    const m = new StatsModel();
    const meanBefore = m.mean.value; // 7.8
    const medianBefore = m.median.value; // 7
    m.newValue.value = 20;
    m.addValue();
    m.addValue();
    m.addValue(); // [4,7,7,9,12,20,20,20]
    const meanShift = m.mean.value - meanBefore; // 12.375 − 7.8 = 4.575
    const medianShift = m.median.value - medianBefore; // 10.5 − 7 = 3.5
    expect(meanShift).toBeGreaterThan(medianShift);
    expect(medianShift).toBeCloseTo(3.5, 10);
    expect(meanShift).toBeCloseTo(4.575, 10);
  });

  it('الحالة تُرمَّز وتُستعاد (مشاركة برابط)', () => {
    const m = new StatsModel();
    m.newValue.value = 3;
    m.addValue();
    const restored = new StatsModel();
    restored.setState(m.getState());
    expect(restored.count.value).toBe(6);
    expect(restored.values.value).toEqual([4, 7, 7, 9, 12, 3]);
    expect(restored.mean.value).toBeCloseTo(mean([4, 7, 7, 9, 12, 3]), 10);
  });
});
