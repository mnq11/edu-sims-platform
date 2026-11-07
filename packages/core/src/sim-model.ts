/**
 * SimModel — النموذج الأساسي لكل محاكاة.
 * عقد صارم: النموذج رياضيات صرفة بلا DOM ولا Canvas، قابل للتسلسل،
 * ويعيد إنتاج الحالة ذاتها من بيانات الحالة المشتركة عبر الرابط.
 */
import { SimulationClock } from './clock.js';

export interface SimState {
  /** نسخة مخطط الحالة للتوافق المستقبلي عبر إصدارات المحاكاة. */
  schemaVersion: number;
  values: Record<string, number | string | boolean>;
}

export abstract class SimModel {
  readonly clock = new SimulationClock();

  protected constructor() {
    this.clock.onStep((dt) => this.step(dt));
  }

  /** خطوة التكامل العددي — تُنفَّذ بخطوة ثابتة من الساعة. */
  protected abstract step(dtSeconds: number): void;

  /** إعادة المحاكاة إلى حالتها الابتدائية (زر إعادة الضبط). */
  abstract reset(): void;

  /** تسلسل الحالة إلى كائن قابل للتحويل إلى JSON ورابط مشاركة. */
  abstract getState(): SimState;

  /** استرجاع حالة مشتركة سابقاً — يجب أن يكون متماثلاً مع getState. */
  abstract setState(state: SimState): void;

  play(): void {
    this.clock.start();
  }

  pause(): void {
    this.clock.stop();
  }
}

/** ترميز حالة المحاكاة في رابط قصير لمشاركتها دون أي حساب. */
export function encodeState(state: SimState): string {
  const json = JSON.stringify(state);
  return typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(json)))
    : Buffer.from(json, 'utf8').toString('base64');
}

/** فك ترميز حالة من رابط. يرمي خطأ واضحاً عند بيانات فاسدة. */
export function decodeState(encoded: string): SimState {
  const json =
    typeof atob === 'function'
      ? decodeURIComponent(escape(atob(encoded)))
      : Buffer.from(encoded, 'base64').toString('utf8');
  const parsed: unknown = JSON.parse(json);
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    typeof (parsed as SimState).schemaVersion !== 'number' ||
    typeof (parsed as SimState).values !== 'object'
  ) {
    throw new Error('بيانات حالة غير صالحة — الرابط قد يكون تالفاً');
  }
  return parsed as SimState;
}
