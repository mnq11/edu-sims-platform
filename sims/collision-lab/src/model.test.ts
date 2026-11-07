import { describe, expect, it } from 'vitest';
import { CollisionModel, elasticVelocities } from './model.js';

function advance(model: CollisionModel, seconds: number): void {
  const steps = Math.round(seconds / model.clock.fixedStep);
  for (let i = 0; i < steps; i += 1) model.clock.stepOnce();
}

describe('مختبر التصادم — صيغ التصادم المرن', () => {
  it('كتلتان متساويتان تتبادلان السرعتين تماماً', () => {
    const [v1, v2] = elasticVelocities(1, 3, 1, -1);
    expect(v1).toBeCloseTo(-1, 12);
    expect(v2).toBeCloseTo(3, 12);
  });

  it('جسم خفيف يصطدم بجسم ثقيل ساكن: الثقيل يتحرك ببطء والخفيف يرتد', () => {
    const [v1, v2] = elasticVelocities(1, 4, 9, 0);
    expect(v1).toBeCloseTo(-3.2, 12); // (1−9)/(1+9)·4
    expect(v2).toBeCloseTo(0.8, 12); // 2·1/(1+9)·4
  });

  it('الصيغ تحفظ الزخم والطاقة الحركية لقيم عشوائية', () => {
    const cases: Array<[number, number, number, number]> = [
      [2, 3, 5, -2], [0.5, -4, 7, 1.5], [3, 0, 3, 4],
    ];
    for (const [m1, u1, m2, u2] of cases) {
      const [v1, v2] = elasticVelocities(m1, u1, m2, u2);
      expect(m1 * v1 + m2 * v2).toBeCloseTo(m1 * u1 + m2 * u2, 10);
      expect(m1 * v1 ** 2 + m2 * v2 ** 2).toBeCloseTo(m1 * u1 ** 2 + m2 * u2 ** 2, 10);
    }
  });
});

describe('مختبر التصادم — المحاكاة الزمنية', () => {
  it('الزخم محفوظ عبر التصادم المتبادل بدقة شبه تامة', () => {
    const m = new CollisionModel();
    m.mass1.value = 2;
    m.mass2.value = 3;
    m.velocity1.value = 2.5;
    m.velocity2.value = -1.5;
    m.launch();
    const p0 = m.momentum;
    // تقدّم حتى ما بعد أول تصادم مباشرة — قبل أي ارتداد جداري
    while (m.collisionCount.value === 0 && m.time.value < 5) m.clock.stepOnce();
    m.clock.stepOnce();
    expect(m.collisionCount.value).toBe(1);
    expect(Math.abs(m.momentum - p0)).toBeLessThan(1e-9);
  });

  it('الطاقة الحركية محفوظة عبر تصادمات وجدران مرنة متكررة (±0.1٪)', () => {
    const m = new CollisionModel();
    m.mass1.value = 2;
    m.mass2.value = 3;
    m.velocity1.value = 2.5;
    m.velocity2.value = -1.5;
    m.launch();
    const e0 = m.kineticEnergy;
    advance(m, 6); // عدة تصادمات وارتدادات جدارية — الجدران مرنة فتحفظ الطاقة
    expect(m.collisionCount.value).toBeGreaterThanOrEqual(1);
    expect(Math.abs(m.kineticEnergy - e0) / e0).toBeLessThan(0.001);
  });

  it('لا يحدث تصادم إذا لم يتقارب الجسمان أبداً خلال مدة قصيرة', () => {
    const m = new CollisionModel();
    m.velocity1.value = -1;
    m.velocity2.value = 1; // يتباعدان
    m.launch();
    advance(m, 0.5);
    expect(m.collisionCount.value).toBe(0);
  });

  it('الجدار يعكس السرعة دون تغيير مقدارها (طاقة محفوظة)', () => {
    const m = new CollisionModel();
    m.velocity1.value = -2; // نحو الجدار الأيسر
    m.velocity2.value = 2; // نحو الجدار الأيمن — يتباعدان فلا تصادم متبادلاً
    m.launch();
    advance(m, 1.5); // كافٍ لارتدادين جداريين، وأقل من زمن اللقاء (~2.75 ث)
    expect(m.collisionCount.value).toBe(0);
    expect(Math.abs(m.v1.value)).toBeCloseTo(2, 6);
    expect(Math.abs(m.v2.value)).toBeCloseTo(2, 6);
    expect(m.v1.value).toBeGreaterThan(0); // انعكسا فعلاً
    expect(m.v2.value).toBeLessThan(0);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new CollisionModel();
    m.mass1.value = 4.5;
    m.velocity2.value = 3;
    const state = m.getState();
    const restored = new CollisionModel();
    restored.setState(state);
    expect(restored.mass1.value).toBe(4.5);
    expect(restored.v2.value).toBe(3);
    expect(restored.getState()).toEqual(state);
  });
});
