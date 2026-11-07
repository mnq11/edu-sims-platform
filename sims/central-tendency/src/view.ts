/**
 * عرض مقاييس النزعة المركزية — مخطط نقاط (dot plot) مع خطوط الوسط والوسيط.
 * رسم ساكن يُعاد عند تغيير البيانات — لا حلقة حركة.
 */
import type { StatsModel } from './model.js';

const W = 720;
const H = 440;
const V_MAX = 20;

export class StatsView {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly reading: HTMLElement;
  private readonly status: HTMLElement;

  constructor(private readonly model: StatsModel, host: HTMLElement) {
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
      'display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:14px;color:#1f2933;';

    this.status = document.createElement('p');
    this.status.className = 'sr-only';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');

    host.append(this.canvas, this.reading, this.status);

    const refresh = () => {
      this.draw();
      this.updateReading();
    };
    model.values.link(refresh);
    refresh();
  }

  private updateReading(): void {
    const m = this.model;
    const modeText = m.mode.value.length === 0 ? 'لا منوال' : m.mode.value.join(' ، ');
    this.reading.innerHTML =
      `<span>الوسط = <strong>${m.mean.value.toFixed(2)}</strong></span>` +
      `<span>الوسيط = <strong>${m.median.value.toFixed(2)}</strong></span>` +
      `<span>المنوال = <strong>${modeText}</strong></span>` +
      `<span>المدى = <strong>${m.range.value.toFixed(1)}</strong></span>` +
      `<span>σ = <strong>${m.stdDev.value.toFixed(2)}</strong></span>`;
    this.status.textContent = `${m.count.value} قيمة — الوسط ${m.mean.value.toFixed(2)} والوسيط ${m.median.value.toFixed(2)} والمنوال ${modeText}`;
  }

  private draw(): void {
    const { ctx, model } = this;
    ctx.clearRect(0, 0, W, H);

    const padL = 50;
    const padR = 30;
    const axisY = H - 70;
    const toX = (v: number) => padL + (v / V_MAX) * (W - padL - padR);

    // محور القيم
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padL, axisY);
    ctx.lineTo(W - padR, axisY);
    ctx.stroke();
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#475569';
    for (let v = 0; v <= V_MAX; v += 2) {
      ctx.beginPath();
      ctx.moveTo(toX(v), axisY);
      ctx.lineTo(toX(v), axisY + 6);
      ctx.stroke();
      ctx.fillText(String(v), toX(v), axisY + 22);
    }

    // نقاط البيانات مكدّسة فوق قيمها
    const drawn = new Map<number, number>();
    for (const x of model.values.value) {
      const level = drawn.get(x) ?? 0;
      drawn.set(x, level + 1);
      ctx.beginPath();
      ctx.arc(toX(x), axisY - 16 - level * 26, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#2dd4bf';
      ctx.fill();
      ctx.strokeStyle = '#0f766e';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // خط الوسط (عنبر) وخط الوسيط (أزرق مخضرّ غامق)
    const topY = 40;
    const drawMarker = (value: number, color: string, label: string, dash: number[]) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(toX(value), topY);
      ctx.lineTo(toX(value), axisY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = color;
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(label, toX(value), topY - 10);
    };
    drawMarker(model.mean.value, '#b45309', `الوسط ${model.mean.value.toFixed(2)}`, []);
    drawMarker(model.median.value, '#0f766e', `الوسيط ${model.median.value.toFixed(2)}`, [6, 5]);
  }
}
