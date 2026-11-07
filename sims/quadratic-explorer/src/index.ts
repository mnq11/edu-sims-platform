/** نقطة دخول مستكشف التربيعية — y = ax² + bx + c مع مشاركة الإعداد برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { QuadraticModel } from './model.js';
import { QuadraticView } from './view.js';

export { QuadraticModel, discriminant, evaluateY, roots, vertex } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage"></div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="المعامل a" unit="" min="-3" max="3" step="0.1" value="1"></sim-slider>
        <sim-slider label="المعامل b" unit="" min="-10" max="10" step="0.5" value="0"></sim-slider>
        <sim-slider label="المعامل c" unit="" min="-10" max="10" step="0.5" value="0"></sim-slider>
        <div class="sim-actions">
          <sim-button id="reset" label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const stage = container.querySelector('.sim-stage') as HTMLElement;
  const model = new QuadraticModel();
  new QuadraticView(model, stage);
  const liveRegion = stage.querySelector('.sr-only') as HTMLElement;

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [a, b, c] = container.querySelectorAll('sim-slider');
  a!.addEventListener('sim-change', (e) => {
    const v = (e as CustomEvent<{ value: number }>).detail.value;
    if (v !== 0) model.a.value = v;
  });
  b!.addEventListener('sim-change', (e) => {
    model.b.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  c!.addEventListener('sim-change', (e) => {
    model.c.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('#reset')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'مستكشف التربيعية جاهز — غيّر المعاملات وراقب الرأس والجذور';
}
