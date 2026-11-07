/** نقطة دخول الخط المستقيم وميله — استكشاف y = mx + b مع مشاركة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { LinearModel } from './model.js';
import { LinearView } from './view.js';

export { LinearModel, slopeFromPoints, perpendicularSlope, formatEquation } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="الميل m" unit="" min="-5" max="5" step="0.1" value="1"></sim-slider>
        <sim-slider label="المقطع الصادي b" unit="" min="-10" max="10" step="0.5" value="2"></sim-slider>
        <sim-slider label="النقطة x" unit="" min="-10" max="10" step="0.5" value="3"></sim-slider>
        <div class="sim-actions">
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new LinearModel();
  new LinearView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [slope, intercept, pointX] = container.querySelectorAll('sim-slider');
  slope!.addEventListener('sim-change', (e) => {
    model.slope.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  intercept!.addEventListener('sim-change', (e) => {
    model.intercept.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  pointX!.addEventListener('sim-change', (e) => {
    model.pointX.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('sim-button')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'خط جاهز — غيّر الميل والمقطع الصادي وراقب المعادلة والمقاطع';
}
