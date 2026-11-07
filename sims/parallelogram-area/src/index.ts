/** نقطة دخول مساحة متوازي الأضلاع — استكشاف ثبات المساحة تحت القصّ. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { AreaModel } from './model.js';
import { AreaView } from './view.js';

export { AreaModel } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="القاعدة" unit="وحدة" min="2" max="12" step="0.5" value="8"></sim-slider>
        <sim-slider label="الارتفاع" unit="وحدة" min="1" max="8" step="0.5" value="4"></sim-slider>
        <sim-slider label="القصّ الأفقي" unit="وحدة" min="-5" max="5" step="0.5" value="2"></sim-slider>
        <div class="sim-actions">
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new AreaModel();
  new AreaView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [base, height, shear] = container.querySelectorAll('sim-slider');
  base!.addEventListener('sim-change', (e) => {
    model.base.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  height!.addEventListener('sim-change', (e) => {
    model.height.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  shear!.addEventListener('sim-change', (e) => {
    model.shear.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('sim-button')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'شكل جاهز — حرّك منزلق القصّ ولاحظ أن المساحة لا تتغير';
}
