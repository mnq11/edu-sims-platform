import { describe, expect, it } from 'vitest';
import {
  DiceModel,
  countWays,
  theoreticalMean,
  theoreticalProbability,
  theoreticalVariance,
} from './model.js';

/** مولّد عشوائية حتمي mulberry32 للاختبارات القابلة للتكرار. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('احتمالات نردين — التوزيع النظري', () => {
  it('countWays صحيحة لكل المجاميع ومجموعها 36 بالضبط', () => {
    const expected = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1];
    let total = 0;
    for (let s = 2; s <= 12; s += 1) {
      expect(countWays(s)).toBe(expected[s - 2]);
      total += countWays(s);
    }
    expect(total).toBe(36);
    expect(countWays(1)).toBe(0);
    expect(countWays(13)).toBe(0);
    expect(countWays(7.5)).toBe(0);
  });

  it('P(7) = 1/6 و P(2) = 1/36 بدقة 10 خانات', () => {
    expect(theoreticalProbability(7)).toBeCloseTo(1 / 6, 10);
    expect(theoreticalProbability(2)).toBeCloseTo(1 / 36, 10);
  });

  it('المتوسط النظري 7 تماماً والتباين 35/6', () => {
    expect(theoreticalMean()).toBe(7);
    expect(theoreticalVariance()).toBeCloseTo(35 / 6, 10);
  });
});

describe('احتمالات نردين — محاكاة مونت كارلو حتمية', () => {
  it('7200 رمية بذرة ثابتة: تردد المجموع 7 ضمن ±0.03 من 1/6', () => {
    const m = new DiceModel(mulberry32(2026));
    m.roll(7200);
    expect(m.totalRolls.value).toBe(7200);
    expect(Math.abs(m.observedFrequency(7) - 1 / 6)).toBeLessThan(0.03);
    expect(Math.abs(m.observedMean() - 7)).toBeLessThan(0.15);
  });

  it('الترددات الداخلية متسقة مع الإجمالي', () => {
    const m = new DiceModel(mulberry32(7));
    m.roll(500);
    const sum = m.observedCounts.value.reduce((acc, c) => acc + c, 0);
    expect(sum).toBe(m.totalRolls.value);
    expect(m.lastRoll.value).toMatch(/^\d \+ \d = \d+$/);
  });

  it('roll(0) لا يغيّر شيئاً', () => {
    const m = new DiceModel(mulberry32(3));
    m.roll(10);
    const snapshot = m.getState();
    m.roll(0);
    expect(m.getState()).toEqual(snapshot);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل بما فيها الترددات', () => {
    const m = new DiceModel(mulberry32(11));
    m.roll(137);
    const state = m.getState();
    const restored = new DiceModel();
    restored.setState(state);
    expect(restored.totalRolls.value).toBe(137);
    expect(restored.observedCounts.value).toEqual(m.observedCounts.value);
    expect(restored.getState()).toEqual(state);
  });

  it('قبل أي رمية: الترددات والمتوسط المشاهد صفر', () => {
    const m = new DiceModel();
    expect(m.observedFrequency(7)).toBe(0);
    expect(m.observedMean()).toBe(0);
  });
});
