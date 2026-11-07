/**
 * عرض النوابض وقانون هوك — جدار يساراً ونابض متعرج يمتد حتى كتلة،
 * مع سهم قوة الاسترجاع ولوحة قراءة (T وE وF). الحركة الحقيقية عبر
 * SimulationClock، وتُحترم خاصية «تقليل الحركة» بعرض ثابت (WCAG 2.2).
 */
import { onReducedMotionChange, prefersReducedMotion } from '@edusims/ui';
import type { SpringsModel } from './model.js';

export class SpringsView {
  private readonly ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;
  private reduced = prefersReducedMotion();

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: SpringsModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    onReducedMotionChange((reduced) => {
      this.reduced = reduced;
      if (reduced) this.draw();
    });
    // إعلان القراءات للمكفوفين عند تغيّر الإعدادات أو التحرير
    const announce = (): void => {
      this.liveRegion.textContent =
        `كتلة ${model.mass.value} كغ، ثابت نابض ${model.springConstant.value} نيوتن لكل متر، ` +
        `زمن الدورة ${model.period.toFixed(2)} ثانية، الطاقة ${model.totalEnergy.toFixed(2)} جول`;
    };
    model.mass.link(announce);
    model.springConstant.link(announce);
    model.initialStretch.link(announce);
    model.x.link(() => {
      if (this.reduced) this.draw();
    });
  }

  start(): void {
    if (this.reduced) {
      this.model.release();
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

    const wallX = 70;
    const axisY = canvas.height / 2;
    const scale = 380; // بكسل لكل متر
    const restLen = 170; // طول النابض غير المشدود بالبكسل
    const eqX = wallX + restLen; // موضع الاتزان
    const blockW = 64;
    const blockX = eqX + model.x.value * scale;

    // الأرضية والجدار
    ctx.strokeStyle = '#41565c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wallX, axisY - 110);
    ctx.lineTo(wallX, axisY + 110);
    ctx.stroke();
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 9; i += 1) {
      const hy = axisY - 105 + i * 26;
      ctx.beginPath();
      ctx.moveTo(wallX, hy);
      ctx.lineTo(wallX - 14, hy - 12);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(40, axisY + blockW / 2 + 8);
    ctx.lineTo(canvas.width - 40, axisY + blockW / 2 + 8);
    ctx.stroke();

    // خط الاتزان المنقّط
    ctx.strokeStyle = '#9db6bb';
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(eqX + blockW / 2, axisY - 100);
    ctx.lineTo(eqX + blockW / 2, axisY + 100);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#5d767c';
    ctx.font = '13px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText('الاتزان', eqX + blockW / 2 + 8, axisY - 108);

    // النابض المتعرج
    const coils = 9;
    const springEnd = blockX;
    const segLen = (springEnd - wallX) / coils;
    ctx.strokeStyle = '#1f6f78';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wallX, axisY);
    for (let i = 0; i < coils; i += 1) {
      const cx = wallX + segLen * (i + 0.5);
      ctx.lineTo(cx, axisY + (i % 2 === 0 ? -22 : 22));
      ctx.lineTo(wallX + segLen * (i + 1), axisY);
    }
    ctx.stroke();

    // الكتلة
    ctx.fillStyle = '#c98a12';
    ctx.strokeStyle = '#8a5c00';
    ctx.lineWidth = 2;
    ctx.fillRect(blockX, axisY - blockW / 2, blockW, blockW);
    ctx.strokeRect(blockX, axisY - blockW / 2, blockW, blockW);
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(`${model.mass.value.toFixed(1)} kg`, blockX - 2, axisY + blockW / 2 + 26);

    // سهم قوة الاسترجاع F = −kx (أحمر، اتجاهه نحو الاتزان)
    const f = model.force;
    const arrowLen = Math.min(120, Math.abs(f) * 18);
    if (arrowLen > 4) {
      const dir = Math.sign(f); // +x يمين
      const ay = axisY - blockW / 2 - 18;
      const ax0 = blockX + blockW / 2;
      ctx.strokeStyle = '#b3413c';
      ctx.fillStyle = '#b3413c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(ax0, ay);
      ctx.lineTo(ax0 + dir * arrowLen, ay);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax0 + dir * arrowLen, ay);
      ctx.lineTo(ax0 + dir * (arrowLen - 10), ay - 6);
      ctx.lineTo(ax0 + dir * (arrowLen - 10), ay + 6);
      ctx.closePath();
      ctx.fill();
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(`F = ${f.toFixed(1)} N`, ax0 + dir * (arrowLen + 8) - 60, ay - 8);
    }

    // لوحة القراءة
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText(`زمن الدورة: ${model.period.toFixed(2)} s`, canvas.width - 230, 36);
    ctx.fillText(`الطاقة: ${model.totalEnergy.toFixed(2)} J`, canvas.width - 230, 62);
    ctx.fillText(`الإزاحة: ${(model.x.value * 100).toFixed(1)} cm`, canvas.width - 230, 88);
  }
}
