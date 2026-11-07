/** نقطة دخول مختبر الكسور — عمليات دقيقة مع تصوير شريطي ومشاركة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { FractionLabModel, type FractionOp } from './model.js';
import { FractionLabView } from './view.js';

export { FractionLabModel, applyOp, equivalent, gcd, simplify } from './model.js';
export type { FractionOp } from './model.js';
export { QUESTIONS } from './quiz.js';

const OPERATIONS: readonly { id: FractionOp; label: string }[] = [
  { id: 'add', label: 'جمع' },
  { id: 'subtract', label: 'طرح' },
  { id: 'multiply', label: 'ضرب' },
  { id: 'divide', label: 'قسمة' },
];

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="420" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <div class="algo-picker" role="group" aria-label="اختر العملية">
          ${OPERATIONS.map((o, i) =>
            `<button type="button" class="chip${i === 0 ? ' active' : ''}" data-op="${o.id}">${o.label}</button>`,
          ).join('')}
        </div>
        <sim-slider label="بسط الأول" unit="" min="0" max="12" step="1" value="1"></sim-slider>
        <sim-slider label="مقام الأول" unit="" min="1" max="12" step="1" value="2"></sim-slider>
        <sim-slider label="بسط الثاني" unit="" min="0" max="12" step="1" value="1"></sim-slider>
        <sim-slider label="مقام الثاني" unit="" min="1" max="12" step="1" value="3"></sim-slider>
        <div class="sim-actions">
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new FractionLabModel();
  new FractionLabView(canvas, model, liveRegion);

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
      model.operation.value = chip.dataset.op as FractionOp;
    });
  });

  const [aNum, aDen, bNum, bDen] = container.querySelectorAll('sim-slider');
  aNum!.addEventListener('sim-change', (e) => {
    model.aNum.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  aDen!.addEventListener('sim-change', (e) => {
    model.aDen.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  bNum!.addEventListener('sim-change', (e) => {
    model.bNum.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  bDen!.addEventListener('sim-change', (e) => {
    model.bDen.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('sim-button')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });
}
