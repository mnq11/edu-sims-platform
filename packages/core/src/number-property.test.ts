import { describe, expect, it } from 'vitest';
import { NumberProperty } from './number-property.js';

describe('NumberProperty — التثبيت على الحدود والخطوات', () => {
  it('يثبت القيمة الابتدائية ضمن النطاق', () => {
    expect(new NumberProperty(50, { min: 0, max: 100 }).value).toBe(50);
    expect(new NumberProperty(150, { min: 0, max: 100 }).value).toBe(100);
    expect(new NumberProperty(-5, { min: 0, max: 100 }).value).toBe(0);
  });

  it('يثبت كل تعيين لاحق ضمن النطاق', () => {
    const p = new NumberProperty(10, { min: 5, max: 40 });
    p.value = 999;
    expect(p.value).toBe(40);
    p.value = -999;
    expect(p.value).toBe(5);
  });

  it('يقرب إلى أقرب خطوة عند تحديدها', () => {
    const p = new NumberProperty(0, { min: 0, max: 10, step: 0.5 });
    p.value = 3.3;
    expect(p.value).toBe(3.5);
    p.value = 3.24;
    expect(p.value).toBe(3);
  });

  it('يتجاهل القيم غير العددية دون كسر الحالة', () => {
    const p = new NumberProperty(7, { min: 0, max: 10 });
    p.value = Number.NaN;
    p.value = Number.POSITIVE_INFINITY;
    expect(p.value).toBe(7);
  });

  it('يعمل دون حدود عند عدم تحديدها', () => {
    const p = new NumberProperty(0);
    p.value = -12345.678;
    expect(p.value).toBe(-12345.678);
  });

  it('يرفض نطاقاً معكوساً عند الإنشاء', () => {
    expect(() => new NumberProperty(0, { min: 10, max: 0 })).toThrow();
  });
});
