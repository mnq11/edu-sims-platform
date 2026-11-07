/**
 * عرض مختبر الكسور — شريطان كسريان مرسومان على Canvas (تقسيمات مرئية
 * وتظليل بالبسط) مع لوحة ناتج دقيقة بصيغة بسط/مقام وقيمة عشرية مرافقة.
 */
import type { FractionLabModel } from './model.js';

const OP_SYMBOLS: Record<string, string> = {
  add: '+', subtract: '−', multiply: '×', divide: '÷',
};

export class FractionLabView {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: FractionLabModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    // إعادة الرسم مع كل تغيير — النموذج يحدّث ناتجه لحظياً
    model.result.link(() => this.draw());
    const announce = (): void => {
      const [n, d] = model.result.value;
      this.liveRegion.textContent =
        `الكسر الأول ${model.aNum.value} على ${model.aDen.value}، ` +
        `الثاني ${model.bNum.value} على ${model.bDen.value}، ` +
        `الناتج ${n} على ${d}`;
    };
    model.aNum.link(announce); model.aDen.link(announce);
    model.bNum.link(announce); model.bDen.link(announce);
    model.operation.link(announce);
    this.draw();
  }

  /** يرسم شريطاً كسرياً واحداً: مستطيل مقسّم إلى «مقام» أجزاء، مظلل بعدد «بسط». */
  private drawBar(
    x: number, y: number, w: number, h: number,
    numerator: number, denominator: number, color: string,
  ): void {
    const { ctx } = this;
    const partW = w / denominator;
    ctx.fillStyle = color;
    for (let i = 0; i < numerator && i < denominator; i += 1) {
      ctx.fillRect(x + i * partW + 1, y + 1, partW - 2, h - 2);
    }
    ctx.strokeStyle = '#41565c';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    for (let i = 1; i < denominator; i += 1) {
      ctx.moveTo(x + i * partW, y);
      ctx.lineTo(x + i * partW, y + h);
    }
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  draw(): void {
    const { ctx, canvas, model } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barW = canvas.width - 220;
    const x = 110;
    this.drawBar(x, 70, barW, 64, model.aNum.value, model.aDen.value, '#1f6f78');
    this.drawBar(x, 200, barW, 64, model.bNum.value, model.bDen.value, '#c98a12');

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(`${model.aNum.value}/${model.aDen.value}`, x + barW + 18, 110);
    ctx.fillText(`${model.bNum.value}/${model.bDen.value}`, x + barW + 18, 240);
    ctx.font = 'bold 26px system-ui, sans-serif';
    ctx.fillText(OP_SYMBOLS[model.operation.value] ?? '+', 60, 170);

    // لوحة الناتج
    const [n, d] = model.result.value;
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText(`الناتج: ${n}/${d}`, x, 340);
    ctx.font = '15px system-ui, sans-serif';
    ctx.fillStyle = '#5b6b73';
    ctx.fillText(`≈ ${(n / d).toFixed(3)}`, x, 368);
  }
}
