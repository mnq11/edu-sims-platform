/** نقطة دخول موازنة المعادلات — ثلاثة تفاعلات مناهج مع مشاركة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { BalancingModel, REACTIONS } from './model.js';
import { BalancingView } from './view.js';

export { BalancingModel, REACTIONS, atomsEqual, countAtoms } from './model.js';
export type { Reaction, Species } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <div class="balance-host"></div>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <div class="algo-picker" role="group" aria-label="اختر التفاعل">
          ${REACTIONS.map((r, i) =>
            `<button type="button" class="chip${i === 0 ? ' active' : ''}" data-reaction="${i}">${r.nameAr}</button>`,
          ).join('')}
        </div>
        <div class="sim-actions">
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const host = container.querySelector<HTMLElement>('.balance-host')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new BalancingModel();

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  new BalancingView(host, model, liveRegion);

  container.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      container.querySelector('.chip.active')?.classList.remove('active');
      chip.classList.add('active');
      model.selectReaction(Number(chip.dataset.reaction));
    });
  });

  container.querySelector('sim-button')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });
}
