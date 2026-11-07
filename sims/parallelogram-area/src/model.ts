/**
 * نموذج مساحة متوازي الأضلاع والمثلث — جبرية هندسية صرفة.
 * الفكرة الجوهرية: القصّ الأفقي (shear) لا يغيّر المساحة، لأن
 * المساحة = القاعدة × الارتفاع العمودي مهما مال الشكل.
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = { base: 8, height: 4, shear: 2 }; // وحدات

export class AreaModel extends SimModel {
  readonly base = new NumberProperty(DEFAULTS.base, { min: 2, max: 12, step: 0.5 });
  readonly height = new NumberProperty(DEFAULTS.height, { min: 1, max: 8, step: 0.5 });
  readonly shear = new NumberProperty(DEFAULTS.shear, { min: -5, max: 5, step: 0.5 });

  /** مساحة متوازي الأضلاع: القاعدة × الارتفاع — لا تعتمد على القصّ. */
  readonly parallelogramArea: Property<number>;
  /** مساحة المثلث الناتج عن القطر: نصف مساحة المتوازي تماماً. */
  readonly triangleArea: Property<number>;
  /** طول الضلع المائل: √(h² + s²) بفيثاغورس. */
  readonly sideLength: Property<number>;
  /** المحيط: 2 × (القاعدة + الضلع المائل). */
  readonly perimeter: Property<number>;

  constructor() {
    super();
    const recompute = (): { area: number; tri: number; side: number; per: number } => {
      const b = this.base.value;
      const h = this.height.value;
      const s = this.shear.value;
      const area = b * h;
      const side = Math.sqrt(h * h + s * s);
      return { area, tri: area / 2, side, per: 2 * (b + side) };
    };
    const init = recompute();
    this.parallelogramArea = new Property(init.area);
    this.triangleArea = new Property(init.tri);
    this.sideLength = new Property(init.side);
    this.perimeter = new Property(init.per);

    const update = (): void => {
      const next = recompute();
      this.parallelogramArea.value = next.area;
      this.triangleArea.value = next.tri;
      this.sideLength.value = next.side;
      this.perimeter.value = next.per;
    };
    this.base.link(update);
    this.height.link(update);
    this.shear.link(update);
  }

  protected step(_dt: number): void {
    // نموذج جبري ساكن — لا تكامل زمنياً
  }

  reset(): void {
    this.base.value = DEFAULTS.base;
    this.height.value = DEFAULTS.height;
    this.shear.value = DEFAULTS.shear;
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: { base: this.base.value, height: this.height.value, shear: this.shear.value },
    };
  }

  setState(state: SimState): void {
    const vals = state.values;
    this.base.value = Number(vals['base'] ?? DEFAULTS.base);
    this.height.value = Number(vals['height'] ?? DEFAULTS.height);
    this.shear.value = Number(vals['shear'] ?? DEFAULTS.shear);
  }
}
