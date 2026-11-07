/** نقطة دخول النوابض وقانون هوك — تجربة تفاعلية مع مشاركة الإعداد برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { SpringsModel } from './model.js';
import { SpringsView } from './view.js';

export { SpringsModel } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage">
        <canvas width="720" height="440" aria-hidden="true"></canvas>
        <p class="sr-only" aria-live="polite" role="status"></p>
      </div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="الكتلة" unit="كغ" min="0.1" max="10" step="0.1" value="1"></sim-slider>
        <sim-slider label="ثابت النابض" unit="نيوتن/م" min="5" max="200" step="1" value="50"></sim-slider>
        <sim-slider label="الإزاحة الابتدائية" unit="متر" min="0.05" max="0.5" step="0.01" value="0.2"></sim-slider>
        <div class="sim-actions">
          <sim-button id="release" label="حرّر" variant="primary"></sim-button>
          <sim-button id="reset" label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const canvas = container.querySelector('canvas')!;
  const liveRegion = container.querySelector('.sr-only') as HTMLElement;
  const model = new SpringsModel();
  const view = new SpringsView(canvas, model, liveRegion);

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [mass, springConstant, initialStretch] = container.querySelectorAll('sim-slider');
  mass!.addEventListener('sim-change', (e) => {
    model.mass.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.release();
  });
  springConstant!.addEventListener('sim-change', (e) => {
    model.springConstant.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.release();
  });
  initialStretch!.addEventListener('sim-change', (e) => {
    model.initialStretch.value = (e as CustomEvent<{ value: number }>).detail.value;
    model.release();
  });

  container.querySelector('#release')!.addEventListener('sim-press', () => model.release());
  container.querySelector('#reset')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'نابض جاهز — غيّر الكتلة أو ثابت النابض وراقب زمن الدورة';
  view.start();
}
