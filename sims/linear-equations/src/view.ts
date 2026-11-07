/**
 * عرض الخط المستقيم — مستوى ديكارتي −10..10 بشبكة ومحورين، الخط
 * مقصوص جبرياً عند حدود المستوى، مع إبراز المقطعين والنقطة المتجولة
 * ومثلث الميل. عرض ساكن يُعاد رسمه عند تغيّر القيم فقط.
 */
import type { LinearModel } from './model.js';

const RANGE = 10; // المستوى من −10 إلى 10

export class LinearView {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly unit: number;
  private readonly ox: number; // أصل المستوى بالبكسل
  private readonly oy: number;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: LinearModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    this.unit = (canvas.height - 80) / (2 * RANGE);
    this.ox = canvas.width / 2;
    this.oy = canvas.height / 2;
    const redraw = (): void => this.draw();
    model.slope.link(redraw);
    model.intercept.link(redraw);
    model.pointX.link(redraw);
    model.equation.link(() => {
      const xi = model.xIntercept.value;
      this.liveRegion.textContent =
        `${model.equation.value} — الميل ${model.slope.value}، المقطع الصادي ${model.intercept.value}، ` +
        (xi === null ? 'لا مقطع سيني — خط أفقي' : `المقطع السيني ${xi.toFixed(2)}`);
    });
    this.draw();
  }

  private toPx(x: number, y: number): [number, number] {
    return [this.ox + x * this.unit, this.oy - y * this.unit];
  }

  /** نقاط تقاطع الخط مع حدود المستوى −10..10 (قصّ جبري). */
  private clippedSegment(m: number, b: number): Array<[number, number]> {
    const pts: Array<[number, number]> = [];
    const atX = (x: number): number => m * x + b;
    const atY = (y: number): number => (y - b) / m;
    for (const x of [-RANGE, RANGE]) {
      const y = atX(x);
      if (y >= -RANGE && y <= RANGE) pts.push([x, y]);
    }
    if (m !== 0) {
      for (const y of [-RANGE, RANGE]) {
        const x = atY(y);
        if (x > -RANGE && x < RANGE) pts.push([x, y]);
      }
    }
    return pts.slice(0, 2);
  }

  private draw(): void {
    const { ctx, canvas, model } = this;
    const m = model.slope.value;
    const b = model.intercept.value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // الشبكة
    ctx.strokeStyle = '#dce9ec';
    ctx.lineWidth = 1;
    for (let i = -RANGE; i <= RANGE; i += 1) {
      const [vx] = this.toPx(i, 0);
      ctx.beginPath(); ctx.moveTo(vx, 20); ctx.lineTo(vx, canvas.height - 30); ctx.stroke();
      const [, hy] = this.toPx(0, i);
      ctx.beginPath(); ctx.moveTo(this.ox - RANGE * this.unit, hy); ctx.lineTo(this.ox + RANGE * this.unit, hy); ctx.stroke();
    }

    // المحوران بسهمين
    ctx.strokeStyle = '#41565c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.ox - RANGE * this.unit, this.oy);
    ctx.lineTo(this.ox + RANGE * this.unit + 12, this.oy);
    ctx.moveTo(this.ox, this.oy + RANGE * this.unit);
    ctx.lineTo(this.ox, this.oy - RANGE * this.unit - 12);
    ctx.stroke();
    // أرقام المحاور
    ctx.fillStyle = '#5d767c';
    ctx.font = '11px system-ui, sans-serif';
    for (let i = -RANGE; i <= RANGE; i += 5) {
      if (i === 0) continue;
      const [tx] = this.toPx(i, 0);
      ctx.fillText(String(i), tx - 5, this.oy + 16);
      const [, ty] = this.toPx(0, i);
      ctx.fillText(String(i), this.ox + 8, ty + 4);
    }

    // الخط
    const seg = this.clippedSegment(m, b);
    const p0 = seg[0];
    const p1 = seg[1];
    if (p0 && p1) {
      const [x0, y0] = this.toPx(p0[0], p0[1]);
      const [x1, y1] = this.toPx(p1[0], p1[1]);
      ctx.strokeStyle = '#1f6f78';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }

    // مثلث الميل عند النقطة المتجولة (Δx=1 → Δy=m)
    const px = model.pointX.value;
    const py = model.pointY.value;
    if (px + 1 <= RANGE && py >= -RANGE && py <= RANGE && py + m >= -RANGE && py + m <= RANGE) {
      const [tx0, ty0] = this.toPx(px, py);
      const [tx1] = this.toPx(px + 1, py);
      const [, ty1] = this.toPx(px + 1, py + m);
      ctx.strokeStyle = '#8a5c00';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tx0, ty0);
      ctx.lineTo(tx1, ty0);
      ctx.lineTo(tx1, ty1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#8a5c00';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(`Δy = ${Math.round(m * 100) / 100}`, tx1 + 6, (ty0 + ty1) / 2);
    }

    // المقطع الصادي
    const [yx, yy] = this.toPx(0, b);
    ctx.fillStyle = '#c98a12';
    ctx.beginPath();
    ctx.arc(yx, yy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(`(0, ${Math.round(b * 100) / 100})`, yx + 10, yy - 10);

    // المقطع السيني
    const xi = model.xIntercept.value;
    if (xi !== null && xi >= -RANGE && xi <= RANGE) {
      const [ix, iy] = this.toPx(xi, 0);
      ctx.fillStyle = '#1f6f78';
      ctx.beginPath();
      ctx.arc(ix, iy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillText(`(${Math.round(xi * 100) / 100}, 0)`, ix + 10, iy + 20);
    }

    // النقطة المتجولة
    const [qx, qy] = this.toPx(px, py);
    ctx.fillStyle = '#b3413c';
    ctx.beginPath();
    ctx.arc(qx, qy, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`(${px}, ${Math.round(py * 100) / 100})`, qx + 10, qy - 10);

    // لوحة القراءة
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(model.equation.value, 40, 44);
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`الميل m = ${Math.round(m * 100) / 100}`, 40, 72);
    ctx.fillText(
      xi === null ? 'لا مقطع سيني — خط أفقي' : `المقطع السيني: x = ${Math.round(xi * 100) / 100}`,
      40,
      96,
    );
  }
}
