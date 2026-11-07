/** نقطة دخول نظرية فيثاغورس — مثلث قائم بمربعات الأضلاع ومشاركة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { PythagorasModel } from './model.js';
import { PythagorasView } from './view.js';

export { PythagorasModel, isIntegerTriple, KNOWN_TRIPLES } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage"></div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="الضلع a" unit="وحدة" min="1" max="15" step="0.5" value="3"></sim-slider>
        <sim-slider label="الضلع b" unit="وحدة" min="1" max="15" step="0.5" value="4"></sim-slider>
        <div class="sim-actions">
          <sim-button id="reset" label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const stage = container.querySelector('.sim-stage') as HTMLElement;
  const model = new PythagorasModel();
  new PythagorasView(model, stage);
  const liveRegion = stage.querySelector('.sr-only') as HTMLElement;

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [legA, legB] = container.querySelectorAll('sim-slider');
  legA!.addEventListener('sim-change', (e) => {
    model.legA.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  legB!.addEventListener('sim-change', (e) => {
    model.legB.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('#reset')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'مثلث قائم جاهز — غيّر الضلعين وراقب تساوي a²+b² مع c²';
}
