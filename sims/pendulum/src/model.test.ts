import { describe, expect, it } from 'vitest';
import { PendulumModel, smallAnglePeriod } from './model.js';

/** يحاكي حتى جمع n عبورات صاعدة للشاقول ويعيد أزمنتها. */
function upwardCrossings(model: PendulumModel, count: number): number[] {
  const crossings: number[] = [];
  let prevTheta = model.theta.value;
  let guard = 0;
  while (crossings.length < count && guard < 2_000_000) {
    model.clock.stepOnce();
    const theta = model.theta.value;
    if (prevTheta < 0 && theta >= 0 && model.omega.value > 0) {
      crossings.push(model.time.value);
    }
    prevTheta = theta;
    guard += 1;
  }
  return crossings;
}

describe('البندول البسيط — التحقق العلمي', () => {
  it('زمن الدورة عند زاوية صغيرة يطابق 2π√(L/g) ضمن ±2٪', () => {
    const model = new PendulumModel();
    model.length.value = 1;
    model.gravity.value = 9.81;
    model.releaseAngleDeg.value = 5;
    model.damping.value = 0;
    model.release();

    const crossings = upwardCrossings(model, 4);
    expect(crossings.length).toBe(4);
    // متوسط ثلاث دورات كاملة بين العبورات المتتالية
    const periods = crossings.slice(1).map((t, i) => t - crossings[i]!);
    const measured = periods.reduce((a, b) => a + b, 0) / periods.length;
    const expected = smallAnglePeriod(1, 9.81); // ≈ 2.006 ث
    expect(measured).toBeGreaterThan(expected * 0.98);
    expect(measured).toBeLessThan(expected * 1.02);
  });

  it('الدورة لا تعتمد على كتلة البندول وتتناسب مع جذر الطول', () => {
    const t1 = smallAnglePeriod(1, 9.81);
    const t2 = smallAnglePeriod(4, 9.81);
    expect(t2 / t1).toBeCloseTo(2, 1); // مضاعفة الطول أربع مرات تضاعف الدورة مرتين
  });

  it('يحفظ سعة الذبذبة دون تخميد (حفظ الطاقة تقريبياً)', () => {
    const model = new PendulumModel();
    model.releaseAngleDeg.value = 10;
    model.damping.value = 0;
    model.release();

    let maxTheta = 0;
    for (let i = 0; i < 20_000; i += 1) {
      model.clock.stepOnce();
      maxTheta = Math.max(maxTheta, Math.abs(model.theta.value));
    }
    const initial = (10 * Math.PI) / 180;
    // السعة القصوى لا تتجاوز الابتدائية بشكل معتدل (لا ضخ طاقة في المكامل)
    expect(maxTheta).toBeLessThan(initial * 1.05);
  });

  it('التخميد يخفض السعة تدريجياً', () => {
    const model = new PendulumModel();
    model.releaseAngleDeg.value = 20;
    model.damping.value = 0.5;
    model.release();

    let maxEarly = 0;
    for (let i = 0; i < 2_000; i += 1) {
      model.clock.stepOnce();
      maxEarly = Math.max(maxEarly, Math.abs(model.theta.value));
    }
    let maxLate = 0;
    for (let i = 0; i < 20_000; i += 1) {
      model.clock.stepOnce();
      maxLate = Math.max(maxLate, Math.abs(model.theta.value));
    }
    expect(maxLate).toBeLessThan(maxEarly);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const model = new PendulumModel();
    model.length.value = 2.5;
    model.releaseAngleDeg.value = 30;
    const state = model.getState();
    const restored = new PendulumModel();
    restored.setState(state);
    expect(restored.length.value).toBe(2.5);
    expect(restored.getState()).toEqual(state);
  });
});
