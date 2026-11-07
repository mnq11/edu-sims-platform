/**
 * عرض نظرية فيثاغورس — مثلث قائم مع مربع على كل ضلع (a²، b²، c²).
 * رسم ساكن يُعاد عند تغيير الضلعين — لا حلقة حركة.
 */
import type { PythagorasModel } from './model.js';

const W = 720;
const H = 440;

interface Pt {
  x: number;
  y: number;
}

export class PythagorasView {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly reading: HTMLElement;
  private readonly status: HTMLElement;

  constructor(private readonly model: PythagorasModel, host: HTMLElement) {
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
    model.legA.link(refresh);
    model.legB.link(refresh);
    refresh();
  }

  private updateReading(): void {
    const m = this.model;
    const a = m.legA.value;
    const b = m.legB.value;
    const c = m.hypotenuse.value;
    const triple = m.isTriple.value ? ' — ثلاثية فيثاغورسية صحيحة ✓' : '';
    this.reading.innerHTML =
      `<span>a² = <strong>${(a * a).toFixed(2)}</strong></span>` +
      `<span>b² = <strong>${(b * b).toFixed(2)}</strong></span>` +
      `<span>a² + b² = <strong>${m.sumOfSquares.value.toFixed(2)}</strong></span>` +
      `<span>c² = <strong>${m.hypotenuseSquared.toFixed(2)}</strong></span>` +
      `<span>c = <strong>${c.toFixed(2)}</strong></span>`;
    this.status.textContent = `مثلث قائم بضلعين ${a} و${b}، الوتر ${c.toFixed(2)}${triple}`;
  }

  private polygon(points: Pt[], fill: string, stroke: string): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(points[0]!.x, points[0]!.y);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i]!.x, points[i]!.y);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  private draw(): void {
    const { ctx, model } = this;
    ctx.clearRect(0, 0, W, H);

    const a = model.legA.value;
    const b = model.legB.value;
    // المثلث في المستوي الرياضي: زاوية قائمة عند O(0,0)، A(a,0)، B(0,b)
    // مربع الضلع a يمتد للأسفل، مربع b لليسار، مربع الوتر للخارج
    const c = model.hypotenuse.value;
    const spanX = a + b + c; // أقصى امتداد أفقي تقريبي
    const spanY = b + a + c;
    const s = Math.min((W - 120) / spanX, (H - 100) / spanY);

    // مركز المشهد: ضع O بحيث تظهر المربعات كاملة
    const ox = 60 + b * s * 0.9;
    const oy = 50 + c * s * 0.35;
    const P = (x: number, y: number): Pt => ({ x: ox + x * s, y: oy + y * s });

    const O = P(0, 0);
    const A = P(a, 0);
    const B = P(0, -b); // الشاشة: y للأسفل، لذا b للأعلى بإشارة سالبة

    // مربع على الضلع a (أسفل المحور الأفقي)
    this.polygon([O, A, P(a, a), P(0, a)], 'rgba(45,212,191,0.25)', '#0d9488');
    // مربع على الضلع b (يسار المحور الرأسي)
    this.polygon([O, B, P(-b, -b), P(-b, 0)], 'rgba(245,158,11,0.22)', '#b45309');
    // مربع على الوتر — عمودي خارجي محسوب في إحداثيات الشاشة مباشرة
    const dx = (B.x - A.x) / c; // متجه الوتر في الشاشة (بوحدات s مخففة)
    const dy = (B.y - A.y) / c;
    // عمودي مبعد عن الأصل: مركز الوتر (A+B)/2، والأصل O — اختر العمودي الذي يبتعد عن O
    let nx = -dy;
    let ny = dx;
    const midX = (A.x + B.x) / 2;
    const midY = (A.y + B.y) / 2;
    if ((midX + nx - O.x) ** 2 + (midY + ny - O.y) ** 2 < (midX - O.x) ** 2 + (midY - O.y) ** 2) {
      nx = -nx;
      ny = -ny;
    }
    const offX = nx * c * s;
    const offY = ny * c * s;
    this.polygon(
      [A, B, { x: B.x + offX, y: B.y + offY }, { x: A.x + offX, y: A.y + offY }],
      'rgba(13,148,136,0.45)',
      '#0f766e',
    );

    // المثلث نفسه فوق المربعات
    this.polygon([O, A, B], 'rgba(30,41,59,0.85)', '#1e293b');

    // علامة الزاوية القائمة
    const q = Math.min(14, s * 0.5);
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(O.x, O.y - q, q, q);

    // الوسوم
    ctx.font = 'bold 15px system-ui';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0d9488';
    ctx.fillText('a²', (O.x + A.x) / 2, A.y + (a * s) / 2 + 5);
    ctx.fillStyle = '#b45309';
    ctx.fillText('b²', O.x - (b * s) / 2, (O.y + B.y) / 2 + 5);
    ctx.fillStyle = '#0f766e';
    ctx.fillText('c²', midX + offX * 0.55, midY + offY * 0.55 + 5);
    ctx.fillStyle = '#f8fafc';
    ctx.fillText('a', (O.x + A.x) / 2, A.y - 8);
    ctx.fillText('b', O.x - 12, (O.y + B.y) / 2);
    ctx.fillText('c', midX - offY * 0.09 - 10, midY + offX * 0.09);

    // شارة الثلاثية الصحيحة
    if (model.isTriple.value) {
      ctx.fillStyle = '#065f46';
      ctx.font = 'bold 16px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`ثلاثية فيثاغورسية: ${a} ، ${b} ، ${model.hypotenuse.value}`, 16, H - 18);
    }
  }
}
