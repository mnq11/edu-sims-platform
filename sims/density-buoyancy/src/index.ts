/** نقطة دخول الكثافة والطفو — تجربة أرخميدس مع مشاركة الإعداد برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { DensityModel } from './model.js';
import { DensityView } from './view.js';

export { DensityModel } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="كثافة الجسم" unit="كغ/م³" min="100" max="3000" step="10" value="500"></sim-slider>
        <sim-slider label="كثافة السائل" unit="كغ/م³" min="500" max="3000" step="10" value="1000"></sim-slider>
        <sim-slider label="حجم الجسم" unit="لتر" min="0.5" max="10" step="0.5" value="2"></sim-slider>
        <div class="sim-actions">
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new DensityModel();
  new DensityView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [objectDensity, fluidDensity, objectVolume] = container.querySelectorAll('sim-slider');
  objectDensity!.addEventListener('sim-change', (e) => {
    model.objectDensity.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  fluidDensity!.addEventListener('sim-change', (e) => {
    model.fluidDensity.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  objectVolume!.addEventListener('sim-change', (e) => {
    model.objectVolume.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('sim-button')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'حوض جاهز — غيّر الكثافتين وراقب الطفو والغمر';
}
