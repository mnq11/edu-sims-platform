import { describe, expect, it } from 'vitest';
import {
  LinearModel,
  evaluateY,
  formatEquation,
  perpendicularSlope,
  slopeFromPoints,
} from './model.js';

describe('الخط المستقيم y = mx + b', () => {
  it('evaluateY عند x=0 يعيد المقطع الصادي دائماً', () => {
    const cases: Array<[number, number]> = [[1, 2], [-2.5, -4], [0, 7]];
    for (const [m, b] of cases) {
      expect(evaluateY(m, b, 0)).toBe(b);
    }
  });

  it('الميل المحسوب من نقطتين على الخط يعيد m بدقة 10 خانات', () => {
    const m = 1.5;
    const b = -3;
    const y1 = evaluateY(m, b, 2);
    const y2 = evaluateY(m, b, 7);
    expect(slopeFromPoints(2, y1, 7, y2)).toBeCloseTo(m, 10);
  });

  it('المقطع السيني = −b/m: m=2 وb=−6 → x=3', () => {
    const lm = new LinearModel();
    lm.slope.value = 2;
    lm.intercept.value = -6;
    expect(lm.xIntercept.value).toBeCloseTo(3, 10);
  });

  it('الخط الأفقي بلا مقطع سيني وبلا ميل عمودي', () => {
    const lm = new LinearModel();
    lm.slope.value = 0;
    expect(lm.xIntercept.value).toBeNull();
    expect(perpendicularSlope(0)).toBeNull();
  });

  it('ميلا العمودين حاصل ضربهما −1 لأي ميل غير صفري', () => {
    for (const m of [0.5, 1, -2.5, 4]) {
      const perp = perpendicularSlope(m);
      expect(perp).not.toBeNull();
      expect(m * (perp ?? 0)).toBeCloseTo(-1, 10);
    }
  });

  it('slopeFromPoints عند x1=x2 يعيد Infinity (خط شاقولي)', () => {
    expect(slopeFromPoints(3, 1, 3, 5)).toBe(Infinity);
  });

  it('formatEquation يعالج الإشارات والمعامل 1 والحد الصفري', () => {
    expect(formatEquation(1, 0)).toBe('y = x');
    expect(formatEquation(-2, 3)).toBe('y = −2x + 3');
    expect(formatEquation(2, -4)).toBe('y = 2x − 4');
    expect(formatEquation(0, 5)).toBe('y = 5');
    expect(formatEquation(0, -2)).toBe('y = −2');
    expect(formatEquation(-1, 0)).toBe('y = −x');
  });

  it('النقطة المتجولة تبقى على الخط عند كل تغيير', () => {
    const lm = new LinearModel();
    lm.slope.value = -1.5;
    lm.intercept.value = 4;
    for (const x of [-10, -3.5, 0, 6, 10]) {
      lm.pointX.value = x;
      expect(lm.pointY.value).toBeCloseTo(evaluateY(-1.5, 4, x), 10);
    }
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const lm = new LinearModel();
    lm.slope.value = -2.3;
    lm.intercept.value = 5.5;
    lm.pointX.value = -4;
    const state = lm.getState();
    const restored = new LinearModel();
    restored.setState(state);
    expect(restored.slope.value).toBeCloseTo(-2.3, 10);
    expect(restored.equation.value).toBe(lm.equation.value);
    expect(restored.getState()).toEqual(state);
  });
});
