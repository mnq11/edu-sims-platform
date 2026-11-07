import { describe, expect, it } from 'vitest';
import { KNOWN_TRIPLES, PythagorasModel, isIntegerTriple } from './model.js';

describe('نظرية فيثاغورس — الدوال الجبرية', () => {
  it('isIntegerTriple تقبل الثلاثيات الصحيحة وترفض غيرها', () => {
    expect(isIntegerTriple(3, 4, 5)).toBe(true);
    expect(isIntegerTriple(5, 12, 13)).toBe(true);
    expect(isIntegerTriple(1, 1, Math.SQRT2)).toBe(false); // وتر غير صحيح
    expect(isIntegerTriple(2, 3, 4)).toBe(false); // 4+9 ≠ 16
    expect(isIntegerTriple(0, 4, 4)).toBe(false); // ضلع صفري ليس مثلثاً
    expect(isIntegerTriple(1.5, 2, 2.5)).toBe(false); // ليست أعداداً صحيحة رغم تحقق العلاقة
  });

  it('كل ثلاثية في KNOWN_TRIPLES تحقق النظرية فعلاً', () => {
    for (const [a, b, c] of KNOWN_TRIPLES) {
      expect(a * a + b * b).toBe(c * c);
      expect(isIntegerTriple(a, b, c)).toBe(true);
    }
  });
});

describe('نظرية فيثاغورس — النموذج التفاعلي', () => {
  it('الوتر في مثلث 3-4 يساوي 5', () => {
    const m = new PythagorasModel();
    expect(m.hypotenuse.value).toBeCloseTo(5, 12);
    expect(m.isTriple.value).toBe(true);
  });

  it('النظرية تتحقق عددياً لأي ضلعين: a²+b² = c²', () => {
    const m = new PythagorasModel();
    const cases: Array<[number, number]> = [
      [1, 1],
      [2.5, 6],
      [7.5, 11],
      [15, 15],
    ];
    for (const [a, b] of cases) {
      m.legA.value = a;
      m.legB.value = b;
      expect(m.sumOfSquares.value).toBeCloseTo(m.hypotenuseSquared, 8);
    }
  });

  it('المساحة = نصف جداء الضلعين', () => {
    const m = new PythagorasModel();
    m.legA.value = 6;
    m.legB.value = 5;
    expect(m.area.value).toBeCloseTo(15, 12);
  });

  it('كشف الثلاثيات: 5-12-13 ثلاثية و 4-5-... ليست', () => {
    const m = new PythagorasModel();
    m.legA.value = 5;
    m.legB.value = 12;
    expect(m.isTriple.value).toBe(true);
    expect(m.hypotenuse.value).toBeCloseTo(13, 12);
    m.legB.value = 6;
    expect(m.isTriple.value).toBe(false); // √61 غير صحيح
  });

  it('الخطوة 0.5 تُثبّت القيم على أنصاف الأعداد', () => {
    const m = new PythagorasModel();
    m.legA.value = 3.3;
    expect(m.legA.value).toBeCloseTo(3.5, 12);
  });

  it('الحالة تُرمَّز وتُستعاد (مشاركة برابط)', () => {
    const m = new PythagorasModel();
    m.legA.value = 8;
    m.legB.value = 15;
    const restored = new PythagorasModel();
    restored.setState(m.getState());
    expect(restored.legA.value).toBe(8);
    expect(restored.legB.value).toBe(15);
    expect(restored.hypotenuse.value).toBeCloseTo(17, 12);
    expect(restored.isTriple.value).toBe(true);
  });
});
