/** نقطة دخول الموجات — تجربة v = f·λ تفاعلية مع مشاركة الإعداد برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { WaveModel } from './model.js';
import { WaveView } from './view.js';

export { WaveModel } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage"></div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="التردد" unit="هرتز" min="0.1" max="5" step="0.1" value="1"></sim-slider>
        <sim-slider label="السعة" unit="متر" min="0.1" max="1" step="0.05" value="0.5"></sim-slider>
        <sim-slider label="سرعة الموجة" unit="م/ث" min="0.5" max="10" step="0.5" value="4"></sim-slider>
        <div class="sim-actions">
          <sim-button id="reset" label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const stage = container.querySelector('.sim-stage') as HTMLElement;
  const model = new WaveModel();
  const view = new WaveView(model, stage);
  const liveRegion = stage.querySelector('.sr-only') as HTMLElement;

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [frequency, amplitude, waveSpeed] = container.querySelectorAll('sim-slider');
  frequency!.addEventListener('sim-change', (e) => {
    model.frequency.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  amplitude!.addEventListener('sim-change', (e) => {
    model.amplitude.value = (e as CustomEvent<{ value: number }>).detail.value;
  });
  waveSpeed!.addEventListener('sim-change', (e) => {
    model.waveSpeed.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('#reset')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'موجة جاهزة — غيّر التردد أو السرعة وراقب تغيّر الطول الموجي';
  void view;
}
