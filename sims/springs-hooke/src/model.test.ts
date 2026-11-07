import { describe, expect, it } from 'vitest';
import { SpringsModel } from './model.js';

/** يشغّل الساعة بخطوات ثابتة حتى يبلغ الزمن seconds. */
function advance(model: SpringsModel, seconds: number): void {
  const steps = Math.round(seconds / model.clock.fixedStep);
  for (let i = 0; i < steps; i += 1) model.clock.stepOnce();
}

describe('النوابض وقانون هوك — تحقق فيزيائي', () => {
  it('زمن الدورة المقاس يطابق T = 2π√(m/k) ضمن ±2٪', () => {
    const m = new SpringsModel();
    m.mass.value = 1;
    m.springConstant.value = 100;
    m.release();
    const theoretical = m.period; // 2π/10 ≈ 0.6283 ث
    // قِس الزمن بين عبوري الصفر صعوداً (x: − → +)
    let crossings = 0;
    let firstT = -1;
    let secondT = -1;
    let prevX = m.x.value;
    const maxSteps = Math.round((3 * theoretical) / m.clock.fixedStep);
    for (let i = 0; i < maxSteps && crossings < 2; i += 1) {
      m.clock.stepOnce();
      if (prevX < 0 && m.x.value >= 0) {
        crossings += 1;
        if (crossings === 1) firstT = m.time.value;
        else secondT = m.time.value;
      }
      prevX = m.x.value;
    }
    expect(secondT).toBeGreaterThan(firstT);
    const measured = secondT - firstT;
    expect(Math.abs(measured - theoretical) / theoretical).toBeLessThan(0.02);
  });

  it('الطاقة محفوظة بلا انحراف تراكمي (متذبذبة ضمن ±2٪ منهجياً) على مدى ثلاث دورات', () => {
    const m = new SpringsModel();
    m.mass.value = 2;
    m.springConstant.value = 80;
    m.initialStretch.value = 0.3;
    m.release();
    const e0 = m.totalEnergy;
    const totalSteps = Math.round((3 * m.period) / m.clock.fixedStep);
    for (let i = 0; i < totalSteps; i += 1) {
      m.clock.stepOnce();
      if (i % 50 === 0) {
        // التكامل السيمبلكتي يبقي الطاقة محصورة بلا نمو علماني؛
        // التذبذب المنهجي من مرتبة dt·ω (هنا ≈ 1٪) — الحد 2٪.
        expect(Math.abs(m.currentEnergy - e0) / e0).toBeLessThan(0.02);
      }
    }
  });

  it('قانون هوك: |F| = k·|x| في كل لحظة', () => {
    const m = new SpringsModel();
    m.springConstant.value = 120;
    advance(m, 0.13);
    expect(m.force).toBeCloseTo(-120 * m.x.value, 10);
    advance(m, 0.21);
    expect(Math.abs(m.force)).toBeCloseTo(120 * Math.abs(m.x.value), 10);
  });

  it('مضاعفة الكتلة أربع مرات تضاعف زمن الدورة', () => {
    const m = new SpringsModel();
    const t1 = m.period;
    m.mass.value = 4;
    expect(m.period).toBeCloseTo(t1 * 2, 10);
  });

  it('الكتلة لا تصل صفراً — قصّ عند الحد الأدنى', () => {
    const m = new SpringsModel();
    m.mass.value = 0;
    expect(m.mass.value).toBe(0.1);
    expect(Number.isFinite(m.period)).toBe(true);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new SpringsModel();
    m.mass.value = 3;
    m.springConstant.value = 75;
    m.initialStretch.value = 0.15;
    const state = m.getState();
    const restored = new SpringsModel();
    restored.setState(state);
    expect(restored.mass.value).toBe(3);
    expect(restored.x.value).toBeCloseTo(0.15, 10);
    expect(restored.getState()).toEqual(state);
  });
});
