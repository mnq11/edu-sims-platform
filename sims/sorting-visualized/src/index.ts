/** نقطة دخول تصوير الفرز — سباق الخوارزميات مع مشاركة الإعداد برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { SortingModel, type SortAlgorithm } from './model.js';
import { SortingView } from './view.js';

export { SortingModel, generateArray, traceSort } from './model.js';
export type { SortAlgorithm, SortOp, SortTrace } from './model.js';

const ALGORITHMS: readonly { id: SortAlgorithm; label: string }[] = [
  { id: 'bubble', label: 'الفقاعي' },
  { id: 'selection', label: 'الاختياري' },
  { id: 'insertion', label: 'الإدخالي' },
];

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="420" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <div class="algo-picker" role="group" aria-label="اختر الخوارزمية">
          ${ALGORITHMS.map((a, i) =>
            `<button type="button" class="chip${i === 0 ? ' active' : ''}" data-algo="${a.id}">${a.label}</button>`,
          ).join('')}
        </div>
        <sim-slider label="حجم المصفوفة" unit="عنصر" min="5" max="60" step="1" value="20"></sim-slider>
        <sim-slider label="بذرة العشوائية" unit="#" min="1" max="9999" step="1" value="42"></sim-slider>
        <div class="sim-actions">
          <sim-button label="ابدأ السباق"></sim-button>
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new SortingModel();
  const view = new SortingView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  container.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      container.querySelector('.chip.active')?.classList.remove('active');
      chip.classList.add('active');
      model.algorithm.value = chip.dataset.algo as SortAlgorithm;
      model.regenerate();
    });
  });

  const [size, seed] = container.querySelectorAll('sim-slider');
  size!.addEventListener('sim-change', (e) => {
    model.size.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.regenerate();
  });
  seed!.addEventListener('sim-change', (e) => {
    model.seed.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.regenerate();
  });

  const [startBtn, resetBtn] = container.querySelectorAll('sim-button');
  startBtn!.addEventListener('sim-press', () => model.regenerate());
  resetBtn!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  view.start();
}

export { QUESTIONS } from './quiz.js';
