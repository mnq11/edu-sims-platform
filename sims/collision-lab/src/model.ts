/**
 * نموذج مختبر التصادم — تصادم مرن أحادي البعد على مسار أفقي بلا احتكاك.
 * عند التلامس تُطبَّق صيغتا التصادم المرن التحليليتان مباشرة (لا تكامل
 * قوى)، فيُحفظ الزخم والطاقة الحركية بدقة رقمية تامة تقريباً.
 * الجداران يعكسان السرعة (تصادم مرن مع الحدود).
 */
import { NumberProperty, Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

const DEFAULTS = {
  mass1: 1, // كغ
  mass2: 2,
  velocity1: 3, // م/ث
  velocity2: -1,
};

/** طول المسار بالمتر — الجداران عند 0 وTRACK_LENGTH. */
export const TRACK_LENGTH = 8;
/** نصف عرض الجسم الواحد (متر) — التلامس عندما تساوي المسافة المركزية 2·HALF. */
const HALF = 0.25;

/** سرعتا ما بعد التصادم المرن — مُصدَّرة للاختبار المباشر. */
export function elasticVelocities(
  m1: number, u1: number, m2: number, u2: number,
): [number, number] {
  const total = m1 + m2;
  const v1 = ((m1 - m2) * u1 + 2 * m2 * u2) / total;
  const v2 = ((m2 - m1) * u2 + 2 * m1 * u1) / total;
  return [v1, v2];
}

export class CollisionModel extends SimModel {
  readonly mass1 = new NumberProperty(DEFAULTS.mass1, { min: 0.5, max: 10, step: 0.5 });
  readonly mass2 = new NumberProperty(DEFAULTS.mass2, { min: 0.5, max: 10, step: 0.5 });
  readonly velocity1 = new NumberProperty(DEFAULTS.velocity1, { min: -5, max: 5, step: 0.5 });
  readonly velocity2 = new NumberProperty(DEFAULTS.velocity2, { min: -5, max: 5, step: 0.5 });

  /** موضعا المركزين على المسار (م) وسرعتاهما الحاليتان. */
  readonly x1 = new Property(2);
  readonly x2 = new Property(6);
  readonly v1 = new Property(DEFAULTS.velocity1);
  readonly v2 = new Property(DEFAULTS.velocity2);
  readonly time = new Property(0);
  readonly collisionCount = new Property(0);

  constructor() {
    super();
    this.launch();
  }

  /** إطلاق التجربة بالإعدادات الحالية. */
  launch(): void {
    this.x1.value = 2;
    this.x2.value = 6;
    this.v1.value = this.velocity1.value;
    this.v2.value = this.velocity2.value;
    this.time.value = 0;
    this.collisionCount.value = 0;
    this.play();
  }

  /** الزخم الكلي p = m1·v1 + m2·v2 — ثابت حركة. */
  get momentum(): number {
    return this.mass1.value * this.v1.value + this.mass2.value * this.v2.value;
  }

  /** الطاقة الحركية الكلية بالجول — محفوظة في التصادم المرن. */
  get kineticEnergy(): number {
    return 0.5 * this.mass1.value * this.v1.value ** 2 + 0.5 * this.mass2.value * this.v2.value ** 2;
  }

  protected step(dt: number): void {
    this.x1.value += this.v1.value * dt;
    this.x2.value += this.v2.value * dt;
    this.time.value += dt;

    // ارتداد مرن عن الجدارين
    if (this.x1.value < HALF) {
      this.x1.value = HALF;
      this.v1.value = Math.abs(this.v1.value);
    }
    if (this.x1.value > TRACK_LENGTH - HALF) {
      this.x1.value = TRACK_LENGTH - HALF;
      this.v1.value = -Math.abs(this.v1.value);
    }
    if (this.x2.value < HALF) {
      this.x2.value = HALF;
      this.v2.value = Math.abs(this.v2.value);
    }
    if (this.x2.value > TRACK_LENGTH - HALF) {
      this.x2.value = TRACK_LENGTH - HALF;
      this.v2.value = -Math.abs(this.v2.value);
    }

    // تصادم مرن عند التلامس أثناء التقارب فقط (تجنّب التكرار داخل التلامس)
    const touching = this.x2.value - this.x1.value <= 2 * HALF;
    if (touching && this.v1.value > this.v2.value) {
      const [nv1, nv2] = elasticVelocities(
        this.mass1.value, this.v1.value,
        this.mass2.value, this.v2.value,
      );
      this.v1.value = nv1;
      this.v2.value = nv2;
      this.collisionCount.value += 1;
      // فصل بصري طفيف لمنع الالتصاق العددي
      const mid = (this.x1.value + this.x2.value) / 2;
      this.x1.value = mid - HALF;
      this.x2.value = mid + HALF;
    }
  }

  reset(): void {
    this.mass1.value = DEFAULTS.mass1;
    this.mass2.value = DEFAULTS.mass2;
    this.velocity1.value = DEFAULTS.velocity1;
    this.velocity2.value = DEFAULTS.velocity2;
    this.launch();
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        mass1: this.mass1.value,
        mass2: this.mass2.value,
        velocity1: this.velocity1.value,
        velocity2: this.velocity2.value,
      },
    };
  }

  setState(state: SimState): void {
    const vals = state.values;
    this.mass1.value = Number(vals['mass1'] ?? DEFAULTS.mass1);
    this.mass2.value = Number(vals['mass2'] ?? DEFAULTS.mass2);
    this.velocity1.value = Number(vals['velocity1'] ?? DEFAULTS.velocity1);
    this.velocity2.value = Number(vals['velocity2'] ?? DEFAULTS.velocity2);
    this.launch();
  }
}
