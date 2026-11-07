import { describe, expect, it } from 'vitest';
import { FractionLabModel, applyOp, equivalent, gcd, simplify } from './model.js';

describe('مختبر الكسور — حساب دقيق بلا فاصلة عائمة', () => {
  it('القاسم المشترك الأكبر عبر إقليدس', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 13)).toBe(1);
    expect(gcd(0, 5)).toBe(5);
  });

  it('التبسيط يوحّد الإشارة ويختزل', () => {
    expect(simplify(6, 8)).toEqual([3, 4]);
    expect(simplify(3, -9)).toEqual([-1, 3]);
    expect(simplify(-2, -4)).toEqual([1, 2]);
    expect(() => simplify(1, 0)).toThrow('المقام');
  });

  it('الجمع: 1/2 + 1/3 = 5/6', () => {
    expect(applyOp([1, 2], [1, 3], 'add')).toEqual([5, 6]);
  });

  it('الطرح: 3/4 − 1/4 = 1/2', () => {
    expect(applyOp([3, 4], [1, 4], 'subtract')).toEqual([1, 2]);
  });

  it('الضرب: 2/3 × 3/4 = 1/2', () => {
    expect(applyOp([2, 3], [3, 4], 'multiply')).toEqual([1, 2]);
  });

  it('القسمة: 1/2 ÷ 1/4 = 2', () => {
    expect(applyOp([1, 2], [1, 4], 'divide')).toEqual([2, 1]);
  });

  it('التكافؤ: 2/4 = 3/6 = 5/10', () => {
    expect(equivalent([2, 4], [3, 6])).toBe(true);
    expect(equivalent([2, 4], [5, 10])).toBe(true);
    expect(equivalent([2, 4], [2, 3])).toBe(false);
  });

  it('النموذج يحدّث الناتج لحظياً مع كل تغيير', () => {
    const m = new FractionLabModel();
    expect(m.result.value).toEqual([5, 6]); // 1/2 + 1/3
    m.operation.value = 'multiply';
    expect(m.result.value).toEqual([1, 6]);
    m.bNum.value = 2;
    m.bDen.value = 5; // 2/5
    expect(m.result.value).toEqual([1, 5]);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new FractionLabModel();
    m.aNum.value = 3;
    m.aDen.value = 7;
    m.operation.value = 'divide';
    const state = m.getState();
    const restored = new FractionLabModel();
    restored.setState(state);
    expect(restored.result.value).toEqual(m.result.value);
    expect(restored.getState()).toEqual(state);
  });
});
