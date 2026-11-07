import { describe, expect, it } from 'vitest';
import {
  QuadraticModel,
  discriminant,
  evaluateY,
  roots,
  vertex,
} from './model.js';

describe('مستكشف التربيعية — دوال جبرية', () => {
  it('evaluateY تحسب ax²+bx+c بدقة', () => {
    expect(evaluateY(1, 0, 0, 3)).toBe(9);
    expect(evaluateY(2, -4, 1, 2)).toBe(1);
    expect(evaluateY(-1, 0, 5, 0)).toBe(5);
  });

  it('المميز Δ = b² − 4ac', () => {
    expect(discriminant(1, -3, 2)).toBe(1);
    expect(discriminant(1, 2, 1)).toBe(0);
    expect(discriminant(1, 0, 1)).toBe(-4);
  });

  it('الرأس في h = −b/2a و k = قيمة الاقتران هناك', () => {
    const { h, k } = vertex(1, -4, 3);
    expect(h).toBeCloseTo(2, 12);
    expect(k).toBeCloseTo(-1, 12);
    // رأس y = −x² قمة عند الصفر
    expect(Math.abs(vertex(-1, 0, 0).h)).toBe(0);
    expect(vertex(-1, 0, 0).k).toBe(0);
  });

  it('الجذور: جذران عند Δ>0، مضاعف عند Δ=0، لا شيء عند Δ<0', () => {
    expect(roots(1, -3, 2)).toEqual([1, 2]);
    expect(roots(1, 2, 1)).toEqual([-1]);
    expect(roots(1, 0, 1)).toEqual([]);
    // الجذور تُرضي المعادلة فعلاً
    for (const r of roots(2, -8, 6)) {
      expect(evaluateY(2, -8, 6, r)).toBeCloseTo(0, 10);
    }
  });

  it('الجذور متناظرة حول محور الرأس', () => {
    const [r1, r2] = roots(1, -6, 5) as [number, number];
    const { h } = vertex(1, -6, 5);
    expect((r1 + r2) / 2).toBeCloseTo(h, 12);
  });
});

describe('مستكشف التربيعية — النموذج التفاعلي', () => {
  it('الخصائص المشتقة تتحدث عند تغيير المعاملات', () => {
    const m = new QuadraticModel();
    m.a.value = 1;
    m.b.value = -3;
    m.c.value = 2;
    expect(m.discriminant.value).toBeCloseTo(1, 12);
    expect(m.rootCount.value).toBe(2);
    expect(m.vertexH.value).toBeCloseTo(1.5, 12);
    expect(m.vertexK.value).toBeCloseTo(-0.25, 12);
    m.c.value = 5;
    expect(m.discriminant.value).toBeCloseTo(-11, 12);
    expect(m.rootCount.value).toBe(0);
  });

  it('الاتجاه: a>0 مفتوح للأعلى و a<0 للأسفل', () => {
    const m = new QuadraticModel();
    m.a.value = 1;
    expect(m.opensUp).toBe(true);
    m.a.value = -1;
    expect(m.opensUp).toBe(false);
  });

  it('الحالة تُرمَّز وتُستعاد (مشاركة برابط)', () => {
    const m = new QuadraticModel();
    m.a.value = 2;
    m.b.value = -4;
    m.c.value = 1.5;
    const restored = new QuadraticModel();
    restored.setState(m.getState());
    expect(restored.a.value).toBe(2);
    expect(restored.b.value).toBe(-4);
    expect(restored.c.value).toBe(1.5);
    expect(restored.rootCount.value).toBe(2);
  });

  it('a لا يقبل الصفر عبر setState (يبقى اقتراناً تربيعياً)', () => {
    const m = new QuadraticModel();
    m.setState({ schemaVersion: 1, values: { a: 0, b: 2, c: 1 } });
    expect(m.a.value).not.toBe(0);
  });
});
