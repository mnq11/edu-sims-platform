/**
 * عرض قانون أوم — دائرة كهربائية مرسومة على Canvas مع جسيمات شحنة
 * تتحرك بسرعة متناسبة مع التيار، ولوحة قياس رقمية (جهد/تيار/قدرة).
 * النموذج جبري ساكن، لذا تُعاد الرسمة عند تغيّر القيم، والحركة استعراضية فقط.
 */
import type { OhmsLawModel } from './model.js';

export class OhmsLawView {
  private readonly ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;
  private phase = 0;
  private lastTime = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: OhmsLawModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    // إعلان لحظي للمكفوفين عند أي تغيير في القياس
    model.current.link((i) => {
      this.liveRegion.textContent =
        `جهد ${model.voltage.value} فولت، مقاومة ${model.resistance.value} أوم، ` +
        `تيار ${i.toFixed(3)} أمبير، قدرة ${model.power.value.toFixed(2)} واط`;
    });
  }

  start(): void {
    const loop = (timestamp: number): void => {
      const dt = this.lastTime === 0 ? 0 : (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      // سرعة الجسيمات تتناسب مع التيار — تيار أعلى يعني تدفقاً أسرع
      this.phase = (this.phase + dt * Math.min(2.5, this.model.current.value * 4)) % 1;
      this.draw();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  /** نقطة على مسار الدائرة المستطيل حسب طور 0..1. */
  private wirePoint(t: number): [number, number] {
    const { width, height } = this.canvas;
    const x0 = 90, x1 = width - 90, y0 = 90, y1 = height - 90;
    const perim = 2 * (x1 - x0) + 2 * (y1 - y0);
    let d = ((t % 1) + 1) % 1 * perim;
    const top = x1 - x0, right = y1 - y0, bottom = x1 - x0;
    if (d < top) return [x0 + d, y0];
    d -= top;
    if (d < right) return [x1, y0 + d];
    d -= right;
    if (d < bottom) return [x1 - d, y1];
    d -= bottom;
    return [x0, y1 - d];
  }

  private draw(): void {
    const { ctx, canvas, model } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const x0 = 90, x1 = canvas.width - 90, y0 = 90, y1 = canvas.height - 90;
    const midY = (y0 + y1) / 2;

    // الأسلاك
    ctx.strokeStyle = '#41565c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x0 + 30, y0); ctx.lineTo(x1, y0); ctx.lineTo(x1, midY - 30);
    ctx.moveTo(x1, midY + 30); ctx.lineTo(x1, y1); ctx.lineTo(x0, y1); ctx.lineTo(x0, y0 + 30);
    ctx.moveTo(x0, y0 - 30); ctx.lineTo(x0 + 30, y0);
    ctx.stroke();

    // البطارية (يسار): خط طويل موجب وقصير سالب
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x0 - 14, y0 - 34); ctx.lineTo(x0 + 14, y0 - 34); ctx.stroke();
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(x0 - 7, y0 + 34); ctx.lineTo(x0 + 7, y0 + 34); ctx.stroke();
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(`${model.voltage.value.toFixed(1)} V`, x0 - 38, y0 + 5);

    // المقاومة (يمين): متعرجة
    ctx.strokeStyle = '#1f6f78';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, midY - 30);
    const teeth = 6;
    for (let i = 0; i < teeth; i += 1) {
      const ty = midY - 30 + ((i + 0.5) / teeth) * 60;
      ctx.lineTo(x1 + (i % 2 === 0 ? 12 : -12), ty);
    }
    ctx.lineTo(x1, midY + 30);
    ctx.stroke();
    ctx.fillStyle = '#1f2937';
    ctx.fillText(`${model.resistance.value.toFixed(0)} Ω`, x1 - 42, midY + 55);

    // جسيمات الشحنة — عددها وسرعتها يعكسان التيار
    const i = model.current.value;
    const dots = Math.min(24, Math.max(2, Math.round(i * 30)));
    ctx.fillStyle = '#c98a12';
    for (let k = 0; k < dots; k += 1) {
      const [px, py] = this.wirePoint(this.phase + k / dots);
      ctx.beginPath();
      ctx.arc(px, py, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // لوحة القياس
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 16px system-ui, sans-serif';
    const amps = i >= 1 ? `${i.toFixed(2)} A` : `${(i * 1000).toFixed(0)} mA`;
    ctx.fillText(`التيار: ${amps}`, canvas.width - 220, 34);
    ctx.fillText(`القدرة: ${model.power.value.toFixed(2)} W`, canvas.width - 220, 58);
  }
}
