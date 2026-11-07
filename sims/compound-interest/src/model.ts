/**
 * نموذج شجرة الفائدة المركبة (EC-201) — كل خطوة ساعة تمثل دورة تركيب واحدة.
 * A = P(1 + r/n)^(n·t) هو المرجع التحليلي للاختبار؛ النموذج يبني الرصيد
 * دورةً دورة ليرى المتعلم التسارع الأسي بعينه لا كصيغة مجردة.
 */
import { NumberProperty, Property, SimModel, derived } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = {
  principal: 1000, // وحدة نقدية
  annualRatePercent: 8, // ٪
  years: 10,
  compoundsPerYear: 12,
};

export class CompoundInterestModel extends SimModel {
  readonly principal = new NumberProperty(DEFAULTS.principal, { min: 10, max: 1_000_000, step: 10 });
  readonly annualRatePercent = new NumberProperty(DEFAULTS.annualRatePercent, { min: 0, max: 30, step: 0.1 });
  readonly years = new NumberProperty(DEFAULTS.years, { min: 1, max: 50, step: 1 });
  readonly compoundsPerYear = new NumberProperty(DEFAULTS.compoundsPerYear, { min: 1, max: 365, step: 1 });

  /** الرصيد الجاري وعدد الدورات المنقضية وحالة الاكتمال. */
  readonly balance = new Property(DEFAULTS.principal);
  readonly elapsedPeriods = new Property(0);
  readonly complete = new Property(false);
  /** الفائدة المتراكمة حتى الآن — مشتقة من الرصيد. */
  readonly interestEarned: Property<number>;

  constructor() {
    super();
    this.interestEarned = derived(this.balance, (b) => b - this.principal.value);
    this.principal.link(() => {
      this.interestEarned.value = this.balance.value - this.principal.value;
    });
    this.startOver();
  }

  /** العدد الكلي لدورات التركيب عبر المدة. */
  get totalPeriods(): number {
    return Math.round(this.years.value * this.compoundsPerYear.value);
  }

  /** بدء مسار تركيب جديد بالمعاملات الحالية. */
  startOver(): void {
    this.balance.value = this.principal.value;
    this.elapsedPeriods.value = 0;
    this.complete.value = false;
    this.play();
  }

  protected step(_dt: number): void {
    if (this.complete.value) return;
    const ratePerPeriod = this.annualRatePercent.value / 100 / this.compoundsPerYear.value;
    this.balance.value = this.balance.value * (1 + ratePerPeriod);
    this.elapsedPeriods.value += 1;
    if (this.elapsedPeriods.value >= this.totalPeriods) {
      this.complete.value = true;
      this.pause();
    }
  }

  reset(): void {
    this.principal.value = DEFAULTS.principal;
    this.annualRatePercent.value = DEFAULTS.annualRatePercent;
    this.years.value = DEFAULTS.years;
    this.compoundsPerYear.value = DEFAULTS.compoundsPerYear;
    this.startOver();
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        principal: this.principal.value,
        annualRatePercent: this.annualRatePercent.value,
        years: this.years.value,
        compoundsPerYear: this.compoundsPerYear.value,
      },
    };
  }

  setState(state: SimState): void {
    const v = state.values;
    this.principal.value = Number(v['principal'] ?? DEFAULTS.principal);
    this.annualRatePercent.value = Number(v['annualRatePercent'] ?? DEFAULTS.annualRatePercent);
    this.years.value = Number(v['years'] ?? DEFAULTS.years);
    this.compoundsPerYear.value = Number(v['compoundsPerYear'] ?? DEFAULTS.compoundsPerYear);
    this.startOver();
  }
}

/** القيمة المستقبلية التحليلية — مرجع الاختبار العلمي. */
export function futureValue(
  principal: number, annualRatePercent: number, compoundsPerYear: number, years: number,
): number {
  const r = annualRatePercent / 100;
  return principal * Math.pow(1 + r / compoundsPerYear, compoundsPerYear * years);
}
