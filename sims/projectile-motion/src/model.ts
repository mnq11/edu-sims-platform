/**
 * نموذج الحركة المقذوفة — رياضيات صرفة بلا عرض.
 * التكامل بنصف خطوة السرعة (semi-implicit Euler) بخطوة ثابتة من الساعة،
 * مع خيار مقاومة هواء تربيعية للمستوى المتقدم. القيم المرجعية للاختبارات
 * مأخوذة من الحل التحليلي بدون مقاومة.
 */
import { Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

export interface ProjectileParams {
  speed: number; // م/ث
  angleDeg: number; // درجة فوق الأفق
  gravity: number; // م/ث²
  mass: number; // كغ
  dragEnabled: boolean;
  dragCoefficient: number; // معامل مبسط كغ/م
}

const DEFAULTS: ProjectileParams = {
  speed: 18,
  angleDeg: 60,
  gravity: 9.81,
  mass: 1,
  dragEnabled: false,
  dragCoefficient: 0.05,
};

export class ProjectileMotionModel extends SimModel {
  readonly speed = new Property(DEFAULTS.speed);
  readonly angleDeg = new Property(DEFAULTS.angleDeg);
  readonly gravity = new Property(DEFAULTS.gravity);
  readonly dragEnabled = new Property(DEFAULTS.dragEnabled);

  /** موضع وسرعة الجسم — للعرض والقياس والوصف الصوتي. */
  readonly x = new Property(0);
  readonly y = new Property(0);
  readonly vx = new Property(0);
  readonly vy = new Property(0);
  readonly time = new Property(0);
  readonly flying = new Property(false);

  constructor() {
    super();
    this.launch();
  }

  /** إطلاق جديد بالمعاملات الحالية — يُستدعى أيضاً عند تغيير زاوية أو سرعة. */
  launch(): void {
    const angleRad = (this.angleDeg.value * Math.PI) / 180;
    this.x.value = 0;
    this.y.value = 0;
    this.vx.value = this.speed.value * Math.cos(angleRad);
    this.vy.value = this.speed.value * Math.sin(angleRad);
    this.time.value = 0;
    this.flying.value = true;
    this.play();
  }

  protected step(dt: number): void {
    if (!this.flying.value) return;

    const g = this.gravity.value;
    let ax = 0;
    let ay = -g;

    if (this.dragEnabled.value) {
      const v = Math.hypot(this.vx.value, this.vy.value);
      const k = DEFAULTS.dragCoefficient;
      ax = (-k * v * this.vx.value) / DEFAULTS.mass;
      ay = -g - (k * v * this.vy.value) / DEFAULTS.mass;
    }

    // نصف خطوة السرعة: تحديث السرعة أولاً ثم الموضع بالسرعة الجديدة.
    this.vx.value += ax * dt;
    this.vy.value += ay * dt;
    this.x.value += this.vx.value * dt;
    this.y.value += this.vy.value * dt;
    this.time.value += dt;

    if (this.y.value <= 0 && this.time.value > 0) {
      this.y.value = 0;
      this.flying.value = false;
      this.pause();
    }
  }

  reset(): void {
    this.speed.value = DEFAULTS.speed;
    this.angleDeg.value = DEFAULTS.angleDeg;
    this.gravity.value = DEFAULTS.gravity;
    this.dragEnabled.value = DEFAULTS.dragEnabled;
    this.launch();
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        speed: this.speed.value,
        angleDeg: this.angleDeg.value,
        gravity: this.gravity.value,
        dragEnabled: this.dragEnabled.value,
      },
    };
  }

  setState(state: SimState): void {
    const v = state.values;
    this.speed.value = Number(v['speed'] ?? DEFAULTS.speed);
    this.angleDeg.value = Number(v['angleDeg'] ?? DEFAULTS.angleDeg);
    this.gravity.value = Number(v['gravity'] ?? DEFAULTS.gravity);
    this.dragEnabled.value = Boolean(v['dragEnabled'] ?? DEFAULTS.dragEnabled);
    this.launch();
  }
}

/** المدى التحليلي بدون مقاومة — مرجع الاختبار العلمي. */
export function analyticRange(speed: number, angleDeg: number, gravity: number): number {
  const rad = (angleDeg * Math.PI) / 180;
  return (speed * speed * Math.sin(2 * rad)) / gravity;
}
