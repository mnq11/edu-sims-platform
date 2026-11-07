import { describe, expect, it } from 'vitest';
import { AreaModel } from './model.js';

describe('مساحة متوازي الأضلاع والمثلث', () => {
  it('ثابتة القصّ: المساحة لا تتغير مهما مال الشكل', () => {
    const m = new AreaModel();
    m.base.value = 8;
    m.height.value = 4;
    const area0 = m.parallelogramArea.value;
    for (const s of [-5, -2.5, 0, 2.5, 5]) {
      m.shear.value = s;
      expect(m.parallelogramArea.value).toBe(area0);
      expect(m.parallelogramArea.value).toBe(32);
    }
  });

  it('مساحة المثلث نصف مساحة المتوازي تماماً لأي قيم', () => {
    const m = new AreaModel();
    const cases: Array<[number, number]> = [[6, 3], [10, 2.5], [2, 8], [12, 1]];
    for (const [b, h] of cases) {
      m.base.value = b;
      m.height.value = h;
      expect(m.triangleArea.value).toBeCloseTo(m.parallelogramArea.value / 2, 10);
    }
  });

  it('حالات عددية: قاعدة 6 وارتفاع 3 → 18 ومثلث 9', () => {
    const m = new AreaModel();
    m.base.value = 6;
    m.height.value = 3;
    expect(m.parallelogramArea.value).toBe(18);
    expect(m.triangleArea.value).toBe(9);
  });

  it('طول الضلع المائل بفيثاغورس: ارتفاع 3 وقصّ 4 → 5', () => {
    const m = new AreaModel();
    m.height.value = 3;
    m.shear.value = 4;
    expect(m.sideLength.value).toBeCloseTo(5, 10);
  });

  it('المحيط يزداد بازدياد مقدار القصّ مع ثبات بقية الأبعاد', () => {
    const m = new AreaModel();
    m.base.value = 8;
    m.height.value = 4;
    m.shear.value = 0;
    const p0 = m.perimeter.value;
    m.shear.value = 4;
    expect(m.perimeter.value).toBeGreaterThan(p0);
    // المحيط متماثل في ±shear (يعتمد على |shear| عبر h² + s²)
    const p4 = m.perimeter.value;
    m.shear.value = -4;
    expect(m.perimeter.value).toBeCloseTo(p4, 10);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new AreaModel();
    m.base.value = 9.5;
    m.height.value = 2.5;
    m.shear.value = -3;
    const state = m.getState();
    const restored = new AreaModel();
    restored.setState(state);
    expect(restored.base.value).toBe(9.5);
    expect(restored.parallelogramArea.value).toBeCloseTo(m.parallelogramArea.value, 10);
    expect(restored.getState()).toEqual(state);
  });
});
