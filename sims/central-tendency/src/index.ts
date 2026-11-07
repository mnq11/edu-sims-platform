/** نقطة دخول مقاييس النزعة المركزية — بيانات تفاعلية مع مشاركة برابط. */
import { decodeState, encodeState } from '@edusims/core';
import '@edusims/ui';
import { StatsModel } from './model.js';
import { StatsView } from './view.js';

export { StatsModel, mean, median, mode, range, stdDev } from './model.js';
export { QUESTIONS } from './quiz.js';

export function bootstrap(container: HTMLElement): void {
  container.innerHTML = `
    <div class="sim-shell" dir="rtl">
      <div class="sim-stage"></div>
      <aside class="sim-controls" aria-label="لوحة التحكم">
        <sim-slider label="القيمة الجديدة" unit="" min="0" max="20" step="1" value="10"></sim-slider>
        <div class="sim-actions">
          <sim-button id="add" label="أضف القيمة" variant="primary"></sim-button>
          <sim-button id="remove" label="احذف آخر قيمة" variant="secondary"></sim-button>
          <sim-button id="reset" label="إعادة ضبط" variant="secondary"></sim-button>
        </div>
        <button class="share" type="button">نسخ رابط هذه التجربة</button>
      </aside>
    </div>`;

  const stage = container.querySelector('.sim-stage') as HTMLElement;
  const model = new StatsModel();
  new StatsView(model, stage);
  const liveRegion = stage.querySelector('.sr-only') as HTMLElement;

  const encoded = new URLSearchParams(location.search).get('state');
  if (encoded) {
    try {
      model.setState(decodeState(encoded));
    } catch {
      liveRegion.textContent = 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة';
    }
  }

  const [newValue] = container.querySelectorAll('sim-slider');
  newValue!.addEventListener('sim-change', (e) => {
    model.newValue.value = (e as CustomEvent<{ value: number }>).detail.value;
  });

  container.querySelector('#add')!.addEventListener('sim-press', () => {
    if (!model.addValue()) liveRegion.textContent = 'وصلنا للحد الأقصى من القيم';
  });
  container.querySelector('#remove')!.addEventListener('sim-press', () => {
    if (!model.removeLast()) liveRegion.textContent = 'لا يمكن إفراغ البيانات بالكامل';
  });
  container.querySelector('#reset')!.addEventListener('sim-press', () => model.reset());

  container.querySelector('.share')!.addEventListener('click', async () => {
    const url = `${location.origin}${location.pathname}?state=${encodeState(model.getState())}`;
    await navigator.clipboard.writeText(url);
    liveRegion.textContent = 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل';
  });

  liveRegion.textContent = 'لوحة إحصاء جاهزة — أضف قيماً وراقب الوسط والوسيط والمنوال';
}
