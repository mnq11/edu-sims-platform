/**
 * نقطة دخول المحاكاة الرائدة — توضح العقد الكامل:
 * نموذج صرف + عرض Canvas + مكونات تحكم RTL + مشاركة حالة برابط دون حساب.
 */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { ProjectileMotionModel } from './model.js';
import { ProjectileView } from './view.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="420" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="السرعة الابتدائية" unit="م/ث" min="5" max="40" step="0.5" value="18"></sim-slider>
        <sim-slider label="زاوية الإطلاق" unit="°" min="5" max="85" step="1" value="60"></sim-slider>
        <sim-slider label="الجاذبية" unit="م/ث²" min="1" max="25" step="0.01" value="9.81"></sim-slider>
        <div class="sim-actions">
          <sim-button label="إطلاق"></sim-button>
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new ProjectileMotionModel();
  const view = new ProjectileView(canvas, model, liveRegion);

  // استرجاع حالة مشتركة من الرابط إن وجدت — استمرارية دون حساب
  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [speed, angle, gravity] = container.querySelectorAll('sim-slider');
  speed!.addEventListener('sim-change', (e) => {
    model.speed.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  angle!.addEventListener('sim-change', (e) => {
    model.angleDeg.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  gravity!.addEventListener('sim-change', (e) => {
    model.gravity.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  const [launchBtn, resetBtn] = container.querySelectorAll('sim-button');
  launchBtn!.addEventListener('sim-press', () => model.launch());
  resetBtn!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  view.start();
}
