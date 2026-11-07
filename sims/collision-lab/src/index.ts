/** نقطة دخول مختبر التصادم — تصادم مرن بحفظ الزخم والطاقة ومشاركة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { CollisionModel } from './model.js';
import { CollisionView } from './view.js';

export { CollisionModel, elasticVelocities } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="كتلة الجسم الأول" unit="كغ" min="0.5" max="10" step="0.5" value="1"></sim-slider>
        <sim-slider label="سرعته الابتدائية" unit="م/ث" min="-5" max="5" step="0.5" value="3"></sim-slider>
        <sim-slider label="كتلة الجسم الثاني" unit="كغ" min="0.5" max="10" step="0.5" value="2"></sim-slider>
        <sim-slider label="سرعته الابتدائية" unit="م/ث" min="-5" max="5" step="0.5" value="-1"></sim-slider>
        <div class="sim-actions">
          <sim-button id="launch" label="أطلق" variant="primary"></sim-button>
          <sim-button id="reset" label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new CollisionModel();
  const view = new CollisionView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [mass1, velocity1, mass2, velocity2] = container.querySelectorAll('sim-slider');
  mass1!.addEventListener('sim-change', (e) => {
    model.mass1.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  velocity1!.addEventListener('sim-change', (e) => {
    model.velocity1.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  mass2!.addEventListener('sim-change', (e) => {
    model.mass2.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  velocity2!.addEventListener('sim-change', (e) => {
    model.velocity2.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('#launch')!.addEventListener('sim-press', () => model.launch());
  container.querySelector('#reset')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'مسار تصادم جاهز — أطلق وراقب ثبات الزخم والطاقة';
  view.start();
}
