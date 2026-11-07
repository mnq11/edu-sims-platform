/** نقطة دخول محاكاة البندول — نموذج + عرض + تحكم RTL + مشاركة حالة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { PendulumModel } from './model.js';
import { PendulumView } from './view.js';

export { PendulumModel, smallAnglePeriod } from './model.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="480" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="طول الخيط" unit="م" min="0.2" max="3" step="0.05" value="1"></sim-slider>
        <sim-slider label="الجاذبية" unit="م/ث²" min="1" max="25" step="0.01" value="9.81"></sim-slider>
        <sim-slider label="زاوية التحرير" unit="°" min="1" max="80" step="1" value="15"></sim-slider>
        <sim-slider label="التخميد" unit="" min="0" max="1" step="0.01" value="0"></sim-slider>
        <div class="sim-actions">
          <sim-button label="تحرير"></sim-button>
          <sim-button label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new PendulumModel();
  const view = new PendulumView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [length, gravity, angle, damping] = container.querySelectorAll('sim-slider');
  length!.addEventListener('sim-change', (e) => {
    model.length.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  gravity!.addEventListener('sim-change', (e) => {
    model.gravity.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  angle!.addEventListener('sim-change', (e) => {
    model.releaseAngleDeg.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  damping!.addEventListener('sim-change', (e) => {
    model.damping.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  const [releaseBtn, resetBtn] = container.querySelectorAll('sim-button');
  releaseBtn!.addEventListener('sim-press', () => model.release());
  resetBtn!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  view.start();
}

export { QUESTIONS } from './quiz.js';
