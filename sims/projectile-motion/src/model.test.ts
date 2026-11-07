import { describe, expect, it } from 'vitest';
import { ProjectileMotionModel, analyticRange } from './model.js';

describe('الحركة المقذوفة — التحقق العلمي', () => {
  it('المدى العددي يطابق الحل التحليلي بدون مقاومة', () => {
    const model = new ProjectileMotionModel();
    model.speed.value = 20;
    model.angleDeg.value = 45;
    model.gravity.value = 9.81;
    model.dragEnabled.value = false;
    model.launch();

    // نحاكي حتى الهبوط بخطوات يدوية (الاختبار لا يحتاج رسوماً)
    let guard = 0;
    while (model.flying.value && guard < 100000) {
      model.clock.stepOnce();
      guard += 1;
    }

    const expected = analyticRange(20, 45, 9.81); // ≈ 40.77 م
    expect(model.x.value).toBeGreaterThan(expected * 0.98);
    expect(model.x.value).toBeLessThan(expected * 1.02);
  });

  it('الارتفاع الأقصى عند 90 درجة يطابق v²/2g', () => {
    const model = new ProjectileMotionModel();
    model.speed.value = 10;
    model.angleDeg.value = 90;
    model.launch();

    let maxY = 0;
    let guard = 0;
    while (model.flying.value && guard < 100000) {
      model.clock.stepOnce();
      maxY = Math.max(maxY, model.y.value);
      guard += 1;
    }

    const expected = (10 * 10) / (2 * 9.81); // ≈ 5.097 م
    expect(maxY).toBeGreaterThan(expected * 0.98);
    expect(maxY).toBeLessThan(expected * 1.02);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل (مشاركة الرابط)', () => {
    const model = new ProjectileMotionModel();
    model.speed.value = 33;
    model.angleDeg.value = 25;
    const state = model.getState();

    const restored = new ProjectileMotionModel();
    restored.setState(state);
    expect(restored.speed.value).toBe(33);
    expect(restored.angleDeg.value).toBe(25);
    expect(restored.getState()).toEqual(state);
  });

  it('إعادة الضبط تعيد القيم الافتراضية', () => {
    const model = new ProjectileMotionModel();
    model.speed.value = 99;
    model.reset();
    expect(model.speed.value).toBe(18);
  });
});
