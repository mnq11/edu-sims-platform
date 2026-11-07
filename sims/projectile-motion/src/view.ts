/**
 * عرض المحاكاة على Canvas — العرض يقرأ من Properties ولا يغيّر النموذج.
 * يتضمن شجرة وصف حية لقارئات الشاشة (إتاحة مدمجة لا لاحقة).
 */
import type { ProjectileMotionModel } from './model.js';

const GROUND_RATIO = 0.85; // موضع الأرض من أعلى اللوحة
const SCALE = 6; // بكسل لكل متر — وضع الأداء المنخفض يخفضه

export class ProjectileView {
  private readonly ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: ProjectileMotionModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;

    // وصف صوتي حي: يتحدث عند تغير حالة الطيران فقط (لا إغراق)
    model.flying.link((flying) => {
      this.liveRegion.textContent = flying
        ? `أُطلق الجسم بسرعة ${model.speed.value} متر في الثانية وزاوية ${model.angleDeg.value} درجة`
        : `هبط الجسم على بعد ${model.x.value.toFixed(1)} متر`;
    });
  }

  start(): void {
    const loop = (timestamp: number): void => {
      this.model.clock.tick(timestamp);
      this.draw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private toPx(x: number, y: number): [number, number] {
    return [x * SCALE + 40, this.canvas.height * GROUND_RATIO - y * SCALE];
  }

  draw(): void {
    const { ctx, canvas, model } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // السماء والأرض
    ctx.fillStyle = '#eef7f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#d8e6d0';
    ctx.fillRect(0, canvas.height * GROUND_RATIO, canvas.width, canvas.height * 0.15);

    // مسار المقذوف التحليلي (مرجع بصري)
    ctx.strokeStyle = '#9db8bb';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    const rad = (model.angleDeg.value * Math.PI) / 180;
    const vx0 = model.speed.value * Math.cos(rad);
    const vy0 = model.speed.value * Math.sin(rad);
    const g = model.gravity.value;
    for (let t = 0; t < 10; t += 0.05) {
      const px = vx0 * t;
      const py = vy0 * t - 0.5 * g * t * t;
      if (py < 0) break;
      const [cx, cy] = this.toPx(px, py);
      if (t === 0) ctx.moveTo(cx, cy);
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // الجسم
    const [bx, by] = this.toPx(model.x.value, model.y.value);
    ctx.fillStyle = '#1f6f78';
    ctx.beginPath();
    ctx.arc(bx, by, 10, 0, Math.PI * 2);
    ctx.fill();

    // لوحة القياس
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(`المسافة: ${model.x.value.toFixed(1)} م`, canvas.width - 200, 30);
    ctx.fillText(`الارتفاع: ${model.y.value.toFixed(1)} م`, canvas.width - 200, 52);
    ctx.fillText(`الزمن: ${model.time.value.toFixed(2)} ث`, canvas.width - 200, 74);
  }
}
