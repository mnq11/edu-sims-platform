import { Property } from './property.js';

/**
 * خاصية رقمية مقيدة بحد أدنى وأقصى وخطوة اختيارية.
 * القيمة تُثبَّت (clamp) عند كل تعيين — لا يمكن لقيمة خارج النطاق أن تسري في النموذج.
 * هذا هو العقد بين المنزلقات ونماذج المحاكاة: الواجهة لا تحتاج فحص الحدود.
 */
export class NumberProperty extends Property<number> {
  readonly min: number;
  readonly max: number;
  readonly step: number | null;

  constructor(initial: number, options: { min?: number; max?: number; step?: number } = {}) {
    super(0); // تُعاد الكتابة فوراً عبر المثبَّت
    this.min = options.min ?? Number.NEGATIVE_INFINITY;
    this.max = options.max ?? Number.POSITIVE_INFINITY;
    this.step = options.step ?? null;
    if (this.min > this.max) throw new Error('الحد الأدنى أكبر من الحد الأقصى');
    this.value = initial;
  }

  override get value(): number {
    return super.value;
  }

  override set value(next: number) {
    if (!Number.isFinite(next)) return; // تجاهل القيم غير العددية بصمت — متانة واجهة
    let clamped = Math.min(this.max, Math.max(this.min, next));
    if (this.step !== null && this.step > 0) {
      const steps = Math.round((clamped - this.min) / this.step);
      clamped = this.min + steps * this.step;
      // إصلاح أخطاء الفاصلة العائمة عند خطوات عشرية
      clamped = Number(clamped.toPrecision(12));
    }
    super.value = clamped;
  }
}
