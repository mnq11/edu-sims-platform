/** عرض سباق الفرز: أعمدة بيانية حية مع إبراز المقارنة والتبديل. */
import type { SortingModel } from './model.js';

export class SortingView {
  private readonly ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: SortingModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    model.done.link((done) => {
      if (done) {
        this.liveRegion.textContent =
          `اكتمل الفرز: ${model.comparisons.value} مقارنة و ${model.swaps.value} تبديلاً`;
      }
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
    const arr = model.array.value;
    if (arr.length === 0) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / arr.length;
    const maxValue = 100;
    const chartHeight = canvas.height - 60;
    const active = model.activeIndices.value;

    for (let i = 0; i < arr.length; i += 1) {
      const h = (arr[i]! / maxValue) * chartHeight;
      const x = i * barWidth;
      const y = canvas.height - 30 - h;
      if (active && (i === active[0] || i === active[1])) {
        ctx.fillStyle = model.done.value ? '#2e7d4f' : '#c98a12'; // إبراز المقارنة/التبديل
      } else if (model.done.value) {
        ctx.fillStyle = '#2e7d4f';
      } else {
        ctx.fillStyle = '#1f6f78';
      }
      ctx.fillRect(x + 1, y, barWidth - 2, h);
    }

    // لوحة العدّادات — تكشف التعقيد بالأرقام أثناء المشاهدة
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(
      `مقارنات: ${model.comparisons.value} — تبديلات: ${model.swaps.value}`,
      canvas.width - 280, 24,
    );
  }
}
