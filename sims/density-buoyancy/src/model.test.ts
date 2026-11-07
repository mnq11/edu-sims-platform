import { describe, expect, it } from 'vitest';
import { DensityModel } from './model.js';

describe('الكثافة والطفو — مبدأ أرخميدس', () => {
  it('خشبة 500 كغ/م³ في ماء 1000: نصفها مغمور وتطفو بوزن ظاهري صفر', () => {
    const m = new DensityModel();
    m.objectDensity.value = 500;
    m.fluidDensity.value = 1000;
    expect(m.status.value).toBe('يطفو');
    expect(m.submergedFraction.value).toBeCloseTo(0.5, 10);
    expect(m.apparentWeight.value).toBe(0);
  });

  it('حجر 2500 في ماء 1000 (2 لتر): يغوص كلياً ووزنه الظاهري 29.43 نيوتن', () => {
    const m = new DensityModel();
    m.objectDensity.value = 2500;
    m.fluidDensity.value = 1000;
    m.objectVolume.value = 2;
    expect(m.status.value).toBe('يغوص');
    expect(m.submergedFraction.value).toBe(1);
    expect(m.apparentWeight.value).toBeCloseTo(1500 * 0.002 * 9.81, 6); // 29.43
  });

  it('جليد ≈920 كغ/م³ (خطوة المنزلق 10) في ماء 1000: نسبة الغمر 0.92', () => {
    const m = new DensityModel();
    m.objectDensity.value = 917; // يُقصّ إلى 920 حسب خطوة المنزلق
    m.fluidDensity.value = 1000;
    expect(m.objectDensity.value).toBe(920);
    expect(m.submergedFraction.value).toBeCloseTo(0.92, 10);
    expect(m.status.value).toBe('يطفو');
  });

  it('تساوي الكثافتين: حياد — غمر كامل ووزن ظاهري صفر', () => {
    const m = new DensityModel();
    m.objectDensity.value = 1000;
    m.fluidDensity.value = 1000;
    expect(m.status.value).toBe('محايد');
    expect(m.submergedFraction.value).toBe(1);
    expect(m.apparentWeight.value).toBe(0);
  });

  it('الوزن = ρ·V·g تحقق جبري لثلاث حالات', () => {
    const m = new DensityModel();
    const cases: Array<[number, number]> = [[500, 2], [1000, 5.5], [2700, 0.5]];
    for (const [rho, liters] of cases) {
      m.objectDensity.value = rho;
      m.objectVolume.value = liters;
      expect(m.mass.value).toBeCloseTo(rho * liters / 1000, 10);
      expect(m.weight.value).toBeCloseTo(rho * liters / 1000 * 9.81, 8);
    }
  });

  it('قوة الطفو القصوى تساوي وزن السائل المُزاح عند الغمر الكامل', () => {
    const m = new DensityModel();
    m.fluidDensity.value = 1000;
    m.objectVolume.value = 3;
    expect(m.maxBuoyancy.value).toBeCloseTo(1000 * 0.003 * 9.81, 8); // 29.43
  });

  it('تغيير كثافة السائل من ماء إلى ماء مالح يقلّل نسبة الغمر للطافئ', () => {
    const m = new DensityModel();
    m.objectDensity.value = 900;
    m.fluidDensity.value = 1000;
    const before = m.submergedFraction.value;
    m.fluidDensity.value = 1030;
    expect(m.submergedFraction.value).toBeLessThan(before);
    expect(m.submergedFraction.value).toBeCloseTo(900 / 1030, 10);
  });

  it('الحجم لا يصل صفراً — قصّ عند الحد الأدنى', () => {
    const m = new DensityModel();
    m.objectVolume.value = 0;
    expect(m.objectVolume.value).toBe(0.5);
  });

  it('الحالة تُسلسل وتُسترجع بشكل متماثل', () => {
    const m = new DensityModel();
    m.objectDensity.value = 780;
    m.fluidDensity.value = 1200;
    m.objectVolume.value = 4;
    const state = m.getState();
    const restored = new DensityModel();
    restored.setState(state);
    expect(restored.objectDensity.value).toBe(780);
    expect(restored.submergedFraction.value).toBeCloseTo(m.submergedFraction.value, 10);
    expect(restored.getState()).toEqual(state);
  });
});
