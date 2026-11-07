/** نقطة دخول احتمالات نردين — قانون الأعداد الكبيرة تفاعلياً مع مشاركة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { DiceModel } from './model.js';
import { DiceView } from './view.js';

export { DiceModel, countWays, theoreticalProbability } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <div class="sim-actions">
          <sim-button id="roll1" label="ارمِ ×1" variant="primary"></sim-button>
          <sim-button id="roll10" label="×10" variant="primary"></sim-button>
          <sim-button id="roll100" label="×100" variant="primary"></sim-button>
        </div>
        <div class="sim-actions">
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new DiceModel();
  new DiceView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  container.querySelector('#roll1')!.addEventListener('sim-press', () => model.roll(1));
  container.querySelector('#roll10')!.addEventListener('sim-press', () => model.roll(10));
  container.querySelector('#roll100')!.addEventListener('sim-press', () => model.roll(100));
  container.querySelector('sim-button[label="إعادة ضبط"]')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'نردان جاهزان — ارمِ وراقب تقارب التردد نحو التوزيع النظري';
}
