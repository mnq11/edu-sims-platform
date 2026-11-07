import { describe, expect, it } from 'vitest';
import { OhmsLawModel } from './model.js';

describe('قانون أوم — علاقات جبرية دقيقة', () => {
  it('I = V/R بدقة تامة لأي قيم ضمن النطاق', () => {
    const m = new OhmsLawModel();
    const cases: Array<[number, number]> = [[9, 100], [12, 47], [1.5, 0.5], [24, 1000]];
    for (const [v, r] of cases) {
      m.voltage.value = v;
      m.resistance.value = r;
      expect(m.current.value).toBeCloseTo(v / r, 10);
    }
  });

  it('P = V·I ويتتبع تغير الجهد والمقاومة لحظياً', () => {
    const m = new OhmsLawModel();
    m.voltage.value = 12;
    m.resistance.value = 60;
    expect(m.power.value).toBeCloseTo(12 * 0.2, 10); // 2.4 واط
    m.resistance.value = 30; // مضاعفة التيار
    expect(m.current.value).toBeCloseTo(0.4, 10);
    expect(m.power.value).toBeCloseTo(4.8, 10);
  });

  it('المقاومة لا تصل صفراً أبداً — حماية من القسمة على صفر', () => {
    const m = new OhmsLawModel();
    m.resistance.value = 0;
    expect(m.resistance.value).toBe(0.1);
    expect(Number.isFinite(m.current.value)).toBe(true);
  });

  it('مضاعفة الجهد تضاعف التيار (تناسب طردي) ومضاعفة المقاومة تخفضه للنصف', () => {
    const m = new OhmsLawModel();
    m.voltage.value = 10;
    m.resistance.value = 50;
    const i1 = m.current.value;
    m.voltage.value = 20;
    expect(m.current.value).toBeCloseTo(i1 * 2, 10);
    m.resistance.value = 100;
    expect(m.current.value).toBeCloseTo(i1, 10);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new OhmsLawModel();
    m.voltage.value = 5;
    m.resistance.value = 220;
    const state = m.getState();
    const restored = new OhmsLawModel();
    restored.setState(state);
    expect(restored.voltage.value).toBe(5);
    expect(restored.current.value).toBeCloseTo(m.current.value, 10);
    expect(restored.getState()).toEqual(state);
  });
});
