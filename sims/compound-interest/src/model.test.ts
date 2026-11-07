import { describe, expect, it } from 'vitest';
import { CompoundInterestModel, futureValue } from './model.js';

describe('الفائدة المركبة — التحقق المالي', () => {
  it('المسار الدوري يطابق الصيغة المغلقة A = P(1+r/n)^(nt) ضمن ±0.5٪', () => {
    const m = new CompoundInterestModel();
    m.principal.value = 1000;
    m.annualRatePercent.value = 12;
    m.compoundsPerYear.value = 12;
    m.years.value = 1;
    m.startOver();

    let guard = 0;
    while (!m.complete.value && guard < 100_000) {
      m.clock.stepOnce();
      guard += 1;
    }
    const expected = futureValue(1000, 12, 12, 1); // ≈ 1126.83
    expect(m.balance.value).toBeGreaterThan(expected * 0.995);
    expect(m.balance.value).toBeLessThan(expected * 1.005);
  });

  it('التركيب الأكثر تكراراً يعطي عائداً أعلى لنفس المعدل الاسمي', () => {
    const yearly = futureValue(1000, 10, 1, 5);
    const monthly = futureValue(1000, 10, 12, 5);
    const daily = futureValue(1000, 10, 365, 5);
    expect(monthly).toBeGreaterThan(yearly);
    expect(daily).toBeGreaterThan(monthly);
  });

  it('مضاعفة رأس المال تضاعف القيمة المستقبلية تماماً (خطية المبدأ)', () => {
    expect(futureValue(2000, 8, 4, 10)).toBeCloseTo(futureValue(1000, 8, 4, 10) * 2, 10);
  });

  it('قاعدة 72 تقريبية: معدل 8٪ يضاعف رأس المال في نحو 9 سنوات', () => {
    const doubled = futureValue(1000, 8, 1, 9);
    expect(doubled).toBeGreaterThan(1900); // قريب من الضعف (2000)
    expect(doubled).toBeLessThan(2100);
  });

  it('عدد الدورات الكلي = السنوات × دورات السنة', () => {
    const m = new CompoundInterestModel();
    m.years.value = 7;
    m.compoundsPerYear.value = 4;
    expect(m.totalPeriods).toBe(28);
  });

  it('الفائدة المكتسبة = الرصيد − الأصل لحظياً', () => {
    const m = new CompoundInterestModel();
    for (let i = 0; i < 5; i += 1) m.clock.stepOnce();
    expect(m.interestEarned.value).toBeCloseTo(m.balance.value - m.principal.value, 10);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new CompoundInterestModel();
    m.principal.value = 5000;
    m.annualRatePercent.value = 6.5;
    const state = m.getState();
    const restored = new CompoundInterestModel();
    restored.setState(state);
    expect(restored.principal.value).toBe(5000);
    expect(restored.getState()).toEqual(state);
  });
});
