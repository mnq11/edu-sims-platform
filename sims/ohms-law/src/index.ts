/** نقطة دخول قانون أوم — دائرة تفاعلية مع مشاركة الإعداد برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { OhmsLawModel } from './model.js';
import { OhmsLawView } from './view.js';

export { OhmsLawModel } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="الجهد" unit="فولت" min="0" max="24" step="0.5" value="9"></sim-slider>
        <sim-slider label="المقاومة" unit="أوم" min="1" max="1000" step="1" value="100"></sim-slider>
        <div class="sim-actions">
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new OhmsLawModel();
  const view = new OhmsLawView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [voltage, resistance] = container.querySelectorAll('sim-slider');
  voltage!.addEventListener('sim-change', (e) => {
    model.voltage.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  resistance!.addEventListener('sim-change', (e) => {
    model.resistance.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('sim-button')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'دائرة جاهزة — غيّر الجهد أو المقاومة وراقب التيار';
  view.start();
}
