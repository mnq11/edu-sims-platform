import { describe, expect, it } from 'vitest';
import { BalancingModel, REACTIONS, atomsEqual, countAtoms } from './model.js';

describe('موازنة المعادلات — الحفظ الكتلي', () => {
  it('عدّ الذرات دقيق: CH₄ + 2O₂ يعطي C=1 وH=4 وO=4', () => {
    const methane = REACTIONS[0]!;
    const left = countAtoms(methane.reactants, [1, 2]);
    expect(left).toEqual({ C: 1, H: 4, O: 4 });
  });

  it('المعاملات الابتدائية (كلها 1) غير متزنة في كل التفاعلات المدمجة', () => {
    for (let i = 0; i < REACTIONS.length; i += 1) {
      const m = new BalancingModel();
      m.selectReaction(i);
      expect(m.balanced.value).toBe(false);
    }
  });

  it('الحل المرجعي يوازن كل تفاعل مدمج (اتساق البيانات نفسها)', () => {
    for (let i = 0; i < REACTIONS.length; i += 1) {
      const m = new BalancingModel();
      m.selectReaction(i);
      m.reaction.solution.forEach((coeff, idx) => m.setCoefficient(idx, coeff));
      expect(m.balanced.value).toBe(true);
    }
  });

  it('كسر التوازن يُكشف فوراً: رفع معامل الماء إلى 3 في احتراق الميثان', () => {
    const m = new BalancingModel();
    m.reaction.solution.forEach((c, i) => m.setCoefficient(i, c));
    expect(m.balanced.value).toBe(true);
    m.setCoefficient(3, 3); // H₂O × 3 بدل 2
    expect(m.balanced.value).toBe(false);
    const { left, right } = m.atomCounts();
    expect(left['H']).not.toBe(right['H']);
  });

  it('المعاملات تُثبَّت بين 1 و10', () => {
    const m = new BalancingModel();
    m.setCoefficient(0, 0);
    expect(m.coefficients.value[0]).toBe(1);
    m.setCoefficient(0, 99);
    expect(m.coefficients.value[0]).toBe(10);
    m.setCoefficient(-1, 5); // مؤشر غير صالح — تجاهل آمن
    expect(m.coefficients.value).toHaveLength(m.reaction.solution.length);
  });

  it('atomsEqual تكشف اختلاف أي عنصر وتتجاهل ترتيب المفاتيح', () => {
    expect(atomsEqual({ C: 1, O: 4 }, { O: 4, C: 1 })).toBe(true);
    expect(atomsEqual({ C: 1, O: 4 }, { C: 1, O: 3 })).toBe(false);
    expect(atomsEqual({ C: 1 }, { C: 1, N: 1 })).toBe(false);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل مع المعاملات', () => {
    const m = new BalancingModel();
    m.selectReaction(2);
    [1, 3, 2].forEach((c, i) => m.setCoefficient(i, c));
    const state = m.getState();
    const restored = new BalancingModel();
    restored.setState(state);
    expect(restored.reactionIndex.value).toBe(2);
    expect(restored.balanced.value).toBe(true);
    expect(restored.getState()).toEqual(state);
  });
});
