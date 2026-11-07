/**
 * عرض الكثافة والطفو — حوض سائل وكتلة موضعها يعكس نسبة الغمر،
 * مع سهمي الوزن والطفو ولوحة قراءة كاملة. عرض ساكن: يُعاد رسمه
 * عند تغيّر القيم فقط (لا حلقة حركة — احترام تقليل الحركة بنيوياً).
 */
import type { DensityModel } from './model.js';

export class DensityView {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: DensityModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    const redraw = (): void => this.draw();
    model.objectDensity.link(redraw);
    model.fluidDensity.link(redraw);
    model.objectVolume.link(redraw);
    // إعلان نصي فوري للمكفوفين
    model.status.link(() => {
      this.liveRegion.textContent =
        `${model.status.value} — كثافة الجسم ${model.objectDensity.value}، ` +
        `كثافة السائل ${model.fluidDensity.value}، نسبة الغمر ` +
        `${Math.round(model.submergedFraction.value * 100)}٪، ` +
        `الوزن الظاهري ${model.apparentWeight.value.toFixed(2)} نيوتن`;
    });
    this.draw();
  }

  private drawArrow(x: number, y0: number, y1: number, color: string, label: string): void {
    const { ctx } = this;
    const dir = Math.sign(y1 - y0);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y1 - dir * 12);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x - 7, y1 - dir * 12);
    ctx.lineTo(x + 7, y1 - dir * 12);
    ctx.closePath();
    ctx.fill();
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(label, x + 12, (y0 + y1) / 2);
  }

  private draw(): void {
    const { ctx, canvas, model } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // الحوض
    const tankX = 150;
    const tankW = 300;
    const tankTop = 60;
    const tankBottom = 400;
    const fluidTop = 120; // سطح السائل
    ctx.fillStyle = '#bfe3ea';
    ctx.fillRect(tankX, fluidTop, tankW, tankBottom - fluidTop);
    ctx.strokeStyle = '#41565c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(tankX, tankTop);
    ctx.lineTo(tankX, tankBottom);
    ctx.lineTo(tankX + tankW, tankBottom);
    ctx.lineTo(tankX + tankW, tankTop);
    ctx.stroke();
    // خط السطح
    ctx.strokeStyle = '#1f6f78';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tankX, fluidTop);
    ctx.lineTo(tankX + tankW, fluidTop);
    ctx.stroke();

    // الكتلة — حجمها يعكس objectVolume وموضعها يعكس submergedFraction
    const blockH = 40 + model.objectVolume.value * 8; // 44–120 بكسل
    const blockW = blockH * 1.3;
    const cx = tankX + tankW / 2 - blockW / 2;
    const fraction = model.submergedFraction.value;
    const subH = blockH * fraction;
    const blockY = model.status.value === 'يغوص'
      ? tankBottom - blockH // يلامس القاع
      : fluidTop - (blockH - subH); // طافئ أو محايد عند السطح

    ctx.fillStyle = '#c98a12';
    ctx.strokeStyle = '#8a5c00';
    ctx.lineWidth = 2;
    ctx.fillRect(cx, blockY, blockW, blockH);
    ctx.strokeRect(cx, blockY, blockW, blockH);
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(`${model.objectDensity.value} kg/m³`, cx - 4, blockY - 8);

    // سهم الوزن (للأسفل، أحمر) وسهم الطفو (للأعلى، أخضر)
    const arrowCx = tankX + tankW + 50;
    const wLen = Math.min(150, model.weight.value * 3);
    const bLen = Math.min(150, (model.status.value === 'يغوص' ? model.maxBuoyancy.value : model.weight.value) * 3);
    if (wLen > 3) this.drawArrow(arrowCx, 160, 160 + wLen, '#b3413c', `الوزن ${model.weight.value.toFixed(1)} N`);
    if (bLen > 3) this.drawArrow(arrowCx - 46, 160 + Math.max(wLen, bLen) + 40, 160 + Math.max(wLen, bLen) + 40 - bLen, '#2e7d4f', `الطفو ${(model.status.value === 'يغوص' ? model.maxBuoyancy.value : model.weight.value).toFixed(1)} N`);

    // شارة الحالة
    const statusColors: Record<string, string> = { 'يطفو': '#2e7d4f', 'يغوص': '#b3413c', 'محايد': '#8a5c00' };
    ctx.fillStyle = statusColors[model.status.value] ?? '#1f2937';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(model.status.value, 60, 90);

    // لوحة القراءة
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#0f3d42';
    const lines = [
      `الكتلة: ${model.mass.value.toFixed(2)} kg`,
      `نسبة الغمر: ${Math.round(fraction * 100)}٪`,
      `الوزن الظاهري: ${model.apparentWeight.value.toFixed(2)} N`,
      `حجم الجسم: ${model.objectVolume.value} L`,
    ];
    lines.forEach((line, i) => ctx.fillText(line, 40, 140 + i * 28));
  }
}
