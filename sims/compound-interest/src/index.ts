/** نقطة دخول الفائدة المركبة — منحنى نمو تفاعلي مع مشاركة الإعداد برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { CompoundInterestModel } from './model.js';
import { CompoundInterestView } from './view.js';

export { CompoundInterestModel, futureValue } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="رأس المال" unit="" min="10" max="100000" step="100" value="1000"></sim-slider>
        <sim-slider label="المعدل السنوي" unit="٪" min="0" max="30" step="0.5" value="8"></sim-slider>
        <sim-slider label="المدة" unit="سنة" min="1" max="50" step="1" value="10"></sim-slider>
        <sim-slider label="دورات التركيب سنوياً" unit="" min="1" max="365" step="1" value="12"></sim-slider>
        <div class="sim-actions">
          <sim-button label="ابدأ من جديد"></sim-button>
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new CompoundInterestModel();
  const view = new CompoundInterestView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [principal, rate, years, compounds] = container.querySelectorAll('sim-slider');
  principal!.addEventListener('sim-change', (e) => {
    model.principal.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.startOver();
  });
  rate!.addEventListener('sim-change', (e) => {
    model.annualRatePercent.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.startOver();
  });
  years!.addEventListener('sim-change', (e) => {
    model.years.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.startOver();
  });
  compounds!.addEventListener('sim-change', (e) => {
    model.compoundsPerYear.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.startOver();
  });

  const [startBtn, resetBtn] = container.querySelectorAll('sim-button');
  startBtn!.addEventListener('sim-press', () => model.startOver());
  resetBtn!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  view.start();
}
