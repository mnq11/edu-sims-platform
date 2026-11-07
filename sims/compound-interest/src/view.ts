/**
 * عرض شجرة الفائدة المركبة — منحنى نمو الرصيد عبر الدورات على Canvas.
 * كل خطوة ساعة تمثل دورة تركيب واحدة، فينكشف التسارع الأسي بصرياً.
 */
import type { CompoundInterestModel } from './model.js';

export class CompoundInterestView {
  private readonly ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;
  private history: number[] = [];

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: CompoundInterestModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    model.complete.link((done) => {
      if (done) {
        this.liveRegion.textContent =
          `اكتمل المسار: الرصيد النهائي ${model.balance.value.toFixed(2)} ` +
          `بفائدة ${model.interestEarned.value.toFixed(2)} خلال ${model.elapsedPeriods.value} دورة`;
      }
    });
    model.elapsedPeriods.link((n) => {
      if (n === 0) this.history = [model.balance.value];
    });
  }

  start(): void {
    const loop = (timestamp: number): void => {
      this.model.clock.tick(timestamp);
      const b = this.model.balance.value;
      if (this.history[this.history.length - 1] !== b) this.history.push(b);
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

    const padX = 60;
    const padTop = 70;
    const chartW = canvas.width - padX - 30;
    const chartH = canvas.height - padTop - 50;
    const principal = model.principal.value;
    const maxBalance = Math.max(...this.history, principal) * 1.05;

    // شبكة أفقية إرشادية + خط رأس المال الأصلي
    ctx.strokeStyle = '#dde8ea';
    ctx.lineWidth = 1;
    for (let g = 0; g <= 4; g += 1) {
      const y = padTop + (chartH * g) / 4;
      ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(padX + chartW, y); ctx.stroke();
    }
    const yPrincipal = padTop + chartH * (1 - principal / maxBalance);
    ctx.strokeStyle = '#c98a12';
    ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(padX, yPrincipal); ctx.lineTo(padX + chartW, yPrincipal); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#5b6b73';
    ctx.font = '13px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText('رأس المال', padX + 6, yPrincipal - 6);

    // منحنى الرصيد
    if (this.history.length > 1) {
      ctx.strokeStyle = '#1f6f78';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const total = Math.max(1, model.totalPeriods);
      this.history.forEach((b, idx) => {
        const x = padX + (idx / total) * chartW;
        const y = padTop + chartH * (1 - b / maxBalance);
        if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // لوحة القياس
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(`الرصيد: ${model.balance.value.toFixed(2)}`, canvas.width - 240, 30);
    ctx.fillText(`الفائدة: +${model.interestEarned.value.toFixed(2)}`, canvas.width - 240, 54);
    ctx.fillStyle = '#5b6b73';
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillText(
      `الدورة ${model.elapsedPeriods.value} من ${model.totalPeriods}`,
      padX, canvas.height - 16,
    );
  }
}
