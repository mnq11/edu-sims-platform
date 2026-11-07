import { describe, expect, it } from 'vitest';
import { WaveModel } from './model.js';

describe('الموجات — العلاقة v = f·λ', () => {
  it('الطول الموجي = السرعة ÷ التردد بدقة تامة', () => {
    const m = new WaveModel();
    const cases: Array<[number, number]> = [[4, 1], [10, 2.5], [0.5, 0.1], [6.5, 5]];
    for (const [v, f] of cases) {
      m.waveSpeed.value = v;
      m.frequency.value = f;
      expect(m.wavelength.value).toBeCloseTo(v / f, 10);
    }
  });

  it('زمن الدورة = مقلوب التردد', () => {
    const m = new WaveModel();
    m.frequency.value = 2;
    expect(m.period.value).toBeCloseTo(0.5, 10);
  });

  it('تضاعف التردد ينصّف الطول الموجي عند ثبات السرعة', () => {
    const m = new WaveModel();
    m.waveSpeed.value = 8;
    m.frequency.value = 1;
    const l1 = m.wavelength.value;
    m.frequency.value = 2;
    expect(m.wavelength.value).toBeCloseTo(l1 / 2, 10);
  });
});

describe('الموجات — خواص الموجة الجيبية الزمنية', () => {
  it('الإزاحة عند x وx+λ متطابقتان (دورية مكانية)', () => {
    const m = new WaveModel();
    for (let i = 0; i < 50; i += 1) m.clock.stepOnce();
    const x = 1.3;
    expect(m.displacement(x)).toBeCloseTo(m.displacement(x + m.wavelength.value), 10);
  });

  it('الإزاحة عند t وt+T متطابقتان (دورية زمنية)', () => {
    const m = new WaveModel();
    m.frequency.value = 2; // T = 0.5
    for (let i = 0; i < 30; i += 1) m.clock.stepOnce();
    const x = 0.7;
    const t = m.time.value;
    expect(m.displacement(x, t)).toBeCloseTo(m.displacement(x, t + m.period.value), 10);
  });

  it('القمة تنتقل بسرعة v: بعد Δt تكون قد قطعت v·Δt', () => {
    const m = new WaveModel();
    m.frequency.value = 1;
    m.waveSpeed.value = 4;
    // القمة عندما kx − ωt = π/2 → x(t) = (π/2 + ωt)/k
    const k = (2 * Math.PI) / m.wavelength.value;
    const omega = 2 * Math.PI;
    const crestAt = (t: number): number => (Math.PI / 2 + omega * t) / k;
    const dt = 0.3;
    expect(crestAt(dt) - crestAt(0)).toBeCloseTo(4 * dt, 10);
    // تحقق من النموذج نفسه: الإزاحة عند crestAt(t) تساوي السعة
    expect(m.displacement(crestAt(0.17), 0.17)).toBeCloseTo(m.amplitude.value, 8);
  });

  it('السعة هي أقصى إزاحة مطلقة', () => {
    const m = new WaveModel();
    m.amplitude.value = 0.8;
    for (let x = 0; x < 20; x += 0.05) {
      expect(Math.abs(m.displacement(x))).toBeLessThanOrEqual(0.8 + 1e-9);
    }
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new WaveModel();
    m.frequency.value = 2.5;
    m.waveSpeed.value = 7;
    m.amplitude.value = 0.35;
    const state = m.getState();
    const restored = new WaveModel();
    restored.setState(state);
    expect(restored.frequency.value).toBe(2.5);
    expect(restored.wavelength.value).toBeCloseTo(m.wavelength.value, 10);
    expect(restored.getState()).toEqual(state);
  });
});
