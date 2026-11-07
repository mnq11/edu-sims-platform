import { describe, expect, it } from 'vitest';
import { SimulationClock } from './clock.js';

describe('SimulationClock', () => {
  it('لا يخطو قبل التشغيل', () => {
    const clock = new SimulationClock(1 / 60);
    let steps = 0;
    clock.onStep(() => steps++);
    clock.tick(0);
    clock.tick(16.7);
    expect(steps).toBe(0);
  });

  it('يتراكم الوقت وينفذ خطوات ثابتة', () => {
    const clock = new SimulationClock(1 / 60);
    let steps = 0;
    clock.onStep(() => steps++);
    clock.start();
    clock.tick(0);
    clock.tick(50); // 50ms ≈ 3 خطوات بخطوة 1/60
    expect(steps).toBe(3);
  });

  it('stepOnce يخدم الاختبارات دون رسوم', () => {
    const clock = new SimulationClock(0.01);
    let total = 0;
    clock.onStep((dt) => (total += dt));
    clock.stepOnce();
    clock.stepOnce();
    expect(total).toBeCloseTo(0.02);
  });
});
