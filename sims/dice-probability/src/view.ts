/**
 * عرض احتمالات نردين — مدرّج تكراري للمجاميع 2..12 يقارن التردد
 * المشاهد بالتوزيع النظري. عرض ساكن يُعاد رسمه بعد كل دفعة رمي.
 */
import { theoreticalProbability, type DiceModel } from './model.js';

export class DiceView {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: DiceModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    model.totalRolls.link(() => {
      this.draw();
      this.liveRegion.textContent =
        `أُجريت ${model.totalRolls.value} رمية — المتوسط المشاهد ` +
        `${model.observedMean().toFixed(2)} مقابل 7 نظرياً`;
    });
    this.draw();
  }

  private draw(): void {
    const { ctx, canvas, model } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chartX = 60;
    const chartW = canvas.width - 120;
    const chartBottom = canvas.height - 70;
    const chartTop = 70;
    const chartH = chartBottom - chartTop;
    const barW = chartW / 11;
    const maxTheoretical = theoreticalProbability(7); // 6/36

    // شبكة أفقية
    ctx.strokeStyle = '#dce9ec';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i += 1) {
      const gy = chartBottom - (chartH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(chartX, gy);
      ctx.lineTo(chartX + chartW, gy);
      ctx.stroke();
    }

    for (let i = 0; i < 11; i += 1) {
      const sum = i + 2;
      const x = chartX + i * barW + 4;
      const w = barW - 8;

      // التوزيع النظري (إطار كهرماني مجوّف)
      const th = (theoreticalProbability(sum) / maxTheoretical) * chartH * 0.92;
      ctx.strokeStyle = '#c98a12';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, chartBottom - th, w, th);

      // التردد المشاهد (تركوازي ممتلئ) — مقاس على النسبة المشاهدة
      const obs = model.observedFrequency(sum);
      const oh = (obs / maxTheoretical) * chartH * 0.92;
      if (oh > 0.5) {
        ctx.fillStyle = '#1f6f78';
        ctx.fillRect(x, chartBottom - oh, w, oh);
      }

      // اسم المجموع
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText(String(sum), x + w / 2 - 4, chartBottom + 22);
    }

    // مفتاح الألوان
    ctx.font = '13px system-ui, sans-serif';
    ctx.fillStyle = '#1f6f78';
    ctx.fillText('■ مشاهَد', chartX, 36);
    ctx.fillStyle = '#c98a12';
    ctx.fillText('□ نظري', chartX + 90, 36);

    // لوحة القراءة
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 15px system-ui, sans-serif';
    const lines = [
      `عدد الرميات: ${model.totalRolls.value}`,
      `المتوسط المشاهد: ${model.observedMean().toFixed(2)} (نظرياً 7)`,
    ];
    if (model.lastRoll.value) lines.push(`آخر رمية: ${model.lastRoll.value}`);
    lines.forEach((line, i) => ctx.fillText(line, canvas.width - 280, 28 + i * 26));
  }
}
