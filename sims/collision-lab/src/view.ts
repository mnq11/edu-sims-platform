/**
 * عرض مختبر التصادم — مسار أفقي بجدارين وجسمان متحركان، مع شريطي
 * زخم وطاقة ولوحة قراءة. الحركة عبر SimulationClock مع احترام
 * «تقليل الحركة»: عند التفضيل لا حلقة حركة — تُحسب النتيجة مباشرة.
 */
import { onReducedMotionChange, prefersReducedMotion } from '@edusims/ui';
import { TRACK_LENGTH, type CollisionModel } from './model.js';

export class CollisionView {
  private readonly ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;
  private reduced = prefersReducedMotion();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: CollisionModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    onReducedMotionChange((reduced) => {
      this.reduced = reduced;
      if (reduced) this.draw();
    });
    model.collisionCount.link((n) => {
      this.liveRegion.textContent =
        `تصادم رقم ${n} — الزخم ${model.momentum.toFixed(2)} كغ·م/ث محفوظ، ` +
        `الطاقة ${model.kineticEnergy.toFixed(2)} جول محفوظة`;
    });
    model.x1.link(() => {
      if (this.reduced) this.draw();
    });
  }

  start(): void {
    if (this.reduced) {
      this.draw();
      return;
    }
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

  private draw(): void {
    const { ctx, canvas, model } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const trackX0 = 60;
    const trackW = canvas.width - 120;
    const trackY = canvas.height / 2;
    const scale = trackW / TRACK_LENGTH;
    const toPx = (x: number): number => trackX0 + x * scale;

    // المسار والجداران
    ctx.strokeStyle = '#41565c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(trackX0, trackY + 40);
    ctx.lineTo(trackX0 + trackW, trackY + 40);
    ctx.moveTo(trackX0, trackY - 50);
    ctx.lineTo(trackX0, trackY + 40);
    ctx.moveTo(trackX0 + trackW, trackY - 50);
    ctx.lineTo(trackX0 + trackW, trackY + 40);
    ctx.stroke();
    // تعشيق الجدارين
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.moveTo(trackX0, trackY - 45 + i * 25);
      ctx.lineTo(trackX0 - 10, trackY - 55 + i * 25);
      ctx.moveTo(trackX0 + trackW, trackY - 45 + i * 25);
      ctx.lineTo(trackX0 + trackW + 10, trackY - 55 + i * 25);
      ctx.stroke();
    }

    // الجسمان — حجم يعكس الكتلة
    const draw = (x: number, mass: number, v: number, color: string, stroke: string): void => {
      const size = 26 + mass * 5;
      ctx.fillStyle = color;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.fillRect(toPx(x) - size / 2, trackY + 40 - size, size, size);
      ctx.strokeRect(toPx(x) - size / 2, trackY + 40 - size, size, size);
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText(`${mass.toFixed(1)} kg`, toPx(x) - 24, trackY + 66);
      // سهم السرعة
      const len = Math.min(70, Math.abs(v) * 22);
      if (len > 4) {
        const dir = Math.sign(v);
        const ay = trackY - size / 2 + 40 - size;
        ctx.strokeStyle = '#b3413c';
        ctx.fillStyle = '#b3413c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(toPx(x), ay);
        ctx.lineTo(toPx(x) + dir * len, ay);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(toPx(x) + dir * len, ay);
        ctx.lineTo(toPx(x) + dir * (len - 8), ay - 5);
        ctx.lineTo(toPx(x) + dir * (len - 8), ay + 5);
        ctx.closePath();
        ctx.fill();
        ctx.fillText(`${v.toFixed(1)} m/s`, toPx(x) + dir * (len + 6) - 30, ay - 8);
      }
    };
    draw(model.x1.value, model.mass1.value, model.v1.value, '#1f6f78', '#0f3d42');
    draw(model.x2.value, model.mass2.value, model.v2.value, '#c98a12', '#8a5c00');

    // لوحة الثوابت — الزخم والطاقة يجب ألا يتغيرا
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText(`الزخم الكلي: ${model.momentum.toFixed(2)} kg·m/s`, 40, 40);
    ctx.fillText(`الطاقة الحركية: ${model.kineticEnergy.toFixed(2)} J`, 40, 66);
    ctx.fillText(`عدد التصادمات: ${model.collisionCount.value}`, 40, 92);
  }
}
