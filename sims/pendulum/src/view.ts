/** عرض البندول على Canvas — يقرأ من النموذج فقط ولا يغيّره. */
import type { PendulumModel } from './model.js';

const PIXELS_PER_METER = 150;

export class PendulumView {
  private readonly ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: PendulumModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    model.swinging.link((swinging) => {
      this.liveRegion.textContent = swinging
        ? `حُرر البندول من زاوية ${model.releaseAngleDeg.value} درجة بطول ${model.length.value} متر`
        : 'توقف البندول تقريباً بفعل التخميد';
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

  draw(): void {
    const { ctx, canvas, model } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const pivotX = canvas.width / 2;
    const pivotY = 60;
    const rodPx = model.length.value * PIXELS_PER_METER;
    const bobX = pivotX + rodPx * Math.sin(model.theta.value);
    const bobY = pivotY + rodPx * Math.cos(model.theta.value);

    // قوس المسار الإرشادي
    ctx.strokeStyle = '#c5dadb';
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, rodPx, Math.PI / 2 - 1.2, Math.PI / 2 + 1.2);
    ctx.stroke();
    ctx.setLineDash([]);

    // القضيب والكتلة
    ctx.strokeStyle = '#41565c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pivotX, pivotY);
    ctx.lineTo(bobX, bobY);
    ctx.stroke();
    ctx.fillStyle = '#1f6f78';
    ctx.beginPath();
    ctx.arc(bobX, bobY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f3d42';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
    ctx.fill();

    // لوحة القياس
    ctx.fillStyle = '#1f2937';
    ctx.font = '14px system-ui, sans-serif';
    ctx.direction = 'rtl';
    const angleDeg = ((model.theta.value * 180) / Math.PI).toFixed(1);
    ctx.fillText(`الزاوية: ${angleDeg}°`, canvas.width - 180, 30);
    ctx.fillText(`الزمن: ${model.time.value.toFixed(2)} ث`, canvas.width - 180, 52);
  }
}
