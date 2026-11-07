/**
 * عرض مستكشف التربيعية — منحنى ساكن يُعاد رسمه عند كل تغيير معامل
 * (لا حركة، لذا لا حاجة لبوابة prefers-reduced-motion).
 */
import type { QuadraticModel } from './model.js';

const W = 720;
const H = 440;
const RANGE = 10;

const toPx = (x: number) => ((x + RANGE) / (2 * RANGE)) * W;
const toPy = (y: number) => H - ((y + RANGE) / (2 * RANGE)) * H;

export class QuadraticView {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly reading: HTMLElement;
  private readonly status: HTMLElement;

  constructor(private readonly model: QuadraticModel, host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText = 'display:block;max-width:100%;border-radius:12px;background:#ffffff;border:1px solid #e2e8f0;';
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير متاح');
    this.ctx = ctx;

    this.reading = document.createElement('div');
    this.reading.style.cssText =
      'display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:14px;color:#1f2933;';

    this.status = document.createElement('p');
    this.status.className = 'sr-only';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');

    host.append(this.canvas, this.reading, this.status);

    const refresh = () => {
      this.draw();
      this.updateReading();
    };
    model.a.link(refresh);
    model.b.link(refresh);
    model.c.link(refresh);
    refresh();
  }

  private updateReading(): void {
    const m = this.model;
    const r = m.currentRoots();
    const rootsText =
      r.length === 0
        ? 'لا جذور حقيقية'
        : r.length === 1
          ? `جذر مضاعف x = ${r[0]!.toFixed(2)}`
          : `x₁ = ${r[0]!.toFixed(2)} ، x₂ = ${r[1]!.toFixed(2)}`;
    this.reading.innerHTML =
      `<span>المميز Δ = <strong>${m.discriminant.value.toFixed(2)}</strong></span>` +
      `<span>الرأس (${m.vertexH.value.toFixed(2)} ، ${m.vertexK.value.toFixed(2)})</span>` +
      `<span>الجذور: <strong>${rootsText}</strong></span>`;
    this.status.textContent = `قطع مكافئ ${m.opensUp ? 'مفتوح للأعلى' : 'مفتوح للأسفل'}، ${rootsText}`;
  }

  private draw(): void {
    const { ctx, model } = this;
    ctx.clearRect(0, 0, W, H);

    // شبكة ومحاور
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = -RANGE; i <= RANGE; i += 2) {
      ctx.beginPath();
      ctx.moveTo(toPx(i), 0);
      ctx.lineTo(toPx(i), H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, toPy(i));
      ctx.lineTo(W, toPy(i));
      ctx.stroke();
    }
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, toPy(0));
    ctx.lineTo(W, toPy(0));
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(toPx(0), 0);
    ctx.lineTo(toPx(0), H);
    ctx.stroke();

    // محور التماثل
    ctx.strokeStyle = 'rgba(245,158,11,0.7)';
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(toPx(model.vertexH.value), 0);
    ctx.lineTo(toPx(model.vertexH.value), H);
    ctx.stroke();
    ctx.setLineDash([]);

    // المنحنى
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 3;
    ctx.beginPath();
    let started = false;
    let prevY = 0;
    for (let px = 0; px <= W; px += 2) {
      const x = (px / W) * 2 * RANGE - RANGE;
      const y = model.evaluate(x);
      // تجنّب الخطوط العمودية الوهمية عند خروج المنحنى من الإطار
      if (Math.abs(y) <= RANGE * 1.5) {
        if (!started || Math.abs(y - prevY) > RANGE) {
          ctx.moveTo(px, toPy(y));
        } else {
          ctx.lineTo(px, toPy(y));
        }
        started = true;
        prevY = y;
      } else {
        started = false;
      }
    }
    ctx.stroke();

    // الرأس
    if (Math.abs(model.vertexK.value) <= RANGE) {
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(toPx(model.vertexH.value), toPy(model.vertexK.value), 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // الجذور
    ctx.fillStyle = '#dc2626';
    for (const r of model.currentRoots()) {
      ctx.beginPath();
      ctx.arc(toPx(r), toPy(0), 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
