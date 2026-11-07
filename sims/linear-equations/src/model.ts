/**
 * نموذج الخط المستقيم y = mx + b — جبر صرف مع مقاطع ونقطة متجولة.
 * m = 0 خط أفقي بلا مقطع سيني (null)، والعمودية: m⊥ = −1/m.
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = { slope: 1, intercept: 2, pointX: 3 };

/** قيمة الخط عند x. */
export function evaluateY(m: number, b: number, x: number): number {
  return m * x + b;
}

/** الميل من نقطتين — Infinity عند تطابق الإحداثيين السينيين. */
export function slopeFromPoints(x1: number, y1: number, x2: number, y2: number): number {
  return (y2 - y1) / (x2 - x1);
}

/** ميل العمودي على خط ميله m — null للخط الأفقي (العمودي عليه شاقولي). */
export function perpendicularSlope(m: number): number | null {
  return m === 0 ? null : -1 / m;
}

/** تنسيق المعادلة عربياً: "y = 2x + 3" مع معالجة الإشارات والمعامل 1. */
export function formatEquation(m: number, b: number): string {
  const fmt = (n: number): string => String(Math.round(n * 100) / 100);
  const sign = (n: number): string => (n < 0 ? '−' : '+');
  const parts: string[] = [];
  if (m !== 0) {
    const coef = Math.abs(m) === 1 ? '' : fmt(Math.abs(m));
    parts.push(m < 0 ? `−${coef}x` : `${coef}x`);
  }
  if (b !== 0 || parts.length === 0) {
    const term = fmt(Math.abs(b));
    parts.push(parts.length === 0 ? (b < 0 ? `−${term}` : term) : `${sign(b)} ${term}`);
  }
  return `y = ${parts.join(' ')}`;
}

export class LinearModel extends SimModel {
  readonly slope = new NumberProperty(DEFAULTS.slope, { min: -5, max: 5, step: 0.1 });
  readonly intercept = new NumberProperty(DEFAULTS.intercept, { min: -10, max: 10, step: 0.5 });
  readonly pointX = new NumberProperty(DEFAULTS.pointX, { min: -10, max: 10, step: 0.5 });

  /** إحداثي النقطة المتجولة على الخط. */
  readonly pointY: Property<number>;
  /** المقطع السيني −b/m أو null للخط الأفقي. */
  readonly xIntercept: Property<number | null>;
  /** المعادلة المنسقة للعرض. */
  readonly equation: Property<string>;

  constructor() {
    super();
    const recompute = (): { py: number; xi: number | null; eq: string } => {
      const m = this.slope.value;
      const b = this.intercept.value;
      return {
        py: evaluateY(m, b, this.pointX.value),
        xi: m === 0 ? null : -b / m,
        eq: formatEquation(m, b),
      };
    };
    const init = recompute();
    this.pointY = new Property(init.py);
    this.xIntercept = new Property<number | null>(init.xi);
    this.equation = new Property(init.eq);

    const update = (): void => {
      const next = recompute();
      this.pointY.value = next.py;
      this.xIntercept.value = next.xi;
      this.equation.value = next.eq;
    };
    this.slope.link(update);
    this.intercept.link(update);
    this.pointX.link(update);
  }

  protected step(_dt: number): void {
    // نموذج جبري ساكن — لا تكامل زمنياً
  }

  reset(): void {
    this.slope.value = DEFAULTS.slope;
    this.intercept.value = DEFAULTS.intercept;
    this.pointX.value = DEFAULTS.pointX;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: { slope: this.slope.value, intercept: this.intercept.value, pointX: this.pointX.value },
    };
  }

  setState(state: SimState): void {
    const vals = state.values;
    this.slope.value = Number(vals['slope'] ?? DEFAULTS.slope);
    this.intercept.value = Number(vals['intercept'] ?? DEFAULTS.intercept);
    this.pointX.value = Number(vals['pointX'] ?? DEFAULTS.pointX);
  }
}
