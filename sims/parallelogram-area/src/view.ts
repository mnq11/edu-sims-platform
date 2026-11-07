/**
 * عرض مساحة متوازي الأضلاع — شبكة وحدات، متوازي أضلاع بقصّ متغير،
 * خط ارتفاع عمودي، شبح المستطيل المكافئ بمثلث مقصوص، وقطر يقسم
 * الشكل إلى مثلثين متساويين. عرض ساكن يُعاد رسمه عند التغيير فقط.
 */
import type { AreaModel } from './model.js';

export class AreaView {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly model: AreaModel,
    private readonly liveRegion: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير مدعوم');
    this.ctx = ctx;
    const redraw = (): void => this.draw();
    model.base.link(redraw);
    model.height.link(redraw);
    // عند تحريك القصّ وحده تبقى المساحة ثابتة — رسالة تعليمية صريحة
    model.shear.link(() => {
      this.draw();
      this.liveRegion.textContent =
        `المساحة لم تتغير: ${model.parallelogramArea.value} وحدة مربعة — القاعدة والارتفاع ثابتان`;
    });
    const announce = (): void => {
      this.liveRegion.textContent =
        `قاعدة ${model.base.value}، ارتفاع ${model.height.value}، ` +
        `المساحة ${model.parallelogramArea.value} وحدة مربعة، ` +
        `مساحة المثلث ${model.triangleArea.value}`;
    };
    model.base.link(announce);
    model.height.link(announce);
    this.draw();
  }

  private draw(): void {
    const { ctx, canvas, model } = this;
    const b = model.base.value;
    const h = model.height.value;
    const s = model.shear.value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f3f8f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // شبكة وحدات
    const unit = 34;
    const originX = 210;
    const originY = canvas.height - 90;
    ctx.strokeStyle = '#dce9ec';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < canvas.width; gx += unit) {
      ctx.beginPath();
      ctx.moveTo(gx, 20);
      ctx.lineTo(gx, canvas.height - 40);
      ctx.stroke();
    }
    for (let gy = 20; gy < canvas.height - 40; gy += unit) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(canvas.width, gy);
      ctx.stroke();
    }

    // رؤوس متوازي الأضلاع: A(0,0) B(b,0) C(b+s,h) D(s,h) — y مقلوبة
    const ax = originX, ay = originY;
    const bx = originX + b * unit, by = originY;
    const cxp = originX + (b + s) * unit, cyp = originY - h * unit;
    const dx = originX + s * unit, dy = originY - h * unit;

    // شبح المستطيل المكافئ (بنفس القاعدة والارتفاع)
    ctx.fillStyle = 'rgba(31, 111, 120, 0.08)';
    ctx.fillRect(originX, originY - h * unit, b * unit, h * unit);
    ctx.strokeStyle = '#9db6bb';
    ctx.setLineDash([6, 5]);
    ctx.strokeRect(originX, originY - h * unit, b * unit, h * unit);
    ctx.setLineDash([]);

    // المثلث المقصوص المنقول (يوضح التحويل إلى مستطيل) — عند shear > 0:
    // مثلث يساري خارج المستطيل ينتقل ليكمل الطرف الأيمن
    if (Math.abs(s) > 0.01) {
      ctx.fillStyle = 'rgba(201, 138, 18, 0.35)';
      ctx.beginPath();
      if (s > 0) {
        ctx.moveTo(ax, ay); ctx.lineTo(dx, dy); ctx.lineTo(ax, dy);
      } else {
        ctx.moveTo(bx, by); ctx.lineTo(bx, dy); ctx.lineTo(cxp, cyp);
      }
      ctx.closePath();
      ctx.fill();
    }

    // القطر — يقسم الشكل إلى مثلثين متساويين بتلونين متمايزين
    ctx.fillStyle = 'rgba(46, 125, 79, 0.25)';
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cxp, cyp);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(31, 111, 120, 0.25)';
    ctx.beginPath();
    ctx.moveTo(ax, ay); ctx.lineTo(cxp, cyp); ctx.lineTo(dx, dy);
    ctx.closePath();
    ctx.fill();

    // أضلاع المتوازي
    ctx.strokeStyle = '#1f6f78';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cxp, cyp);
    ctx.lineTo(dx, dy);
    ctx.closePath();
    ctx.stroke();

    // خط الارتفاع العمودي المتقطع + علامة الزاوية القائمة
    const footX = dx;
    ctx.strokeStyle = '#b3413c';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(footX, originY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeRect(footX, originY - 12, 12, 12);
    ctx.fillStyle = '#b3413c';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.direction = 'rtl';
    ctx.fillText(`h = ${h}`, footX + 16, (dy + originY) / 2);

    // تسمية القاعدة
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.fillText(`b = ${b}`, (ax + bx) / 2 - 20, ay + 26);

    // لوحة القراءة
    ctx.fillStyle = '#0f3d42';
    ctx.font = 'bold 16px system-ui, sans-serif';
    const lines = [
      `المساحة: ${model.parallelogramArea.value} وحدة²`,
      `مساحة المثلث: ${model.triangleArea.value} وحدة²`,
      `طول الضلع: ${model.sideLength.value.toFixed(2)}`,
      `المحيط: ${model.perimeter.value.toFixed(2)}`,
    ];
    lines.forEach((line, i) => ctx.fillText(line, canvas.width - 250, 44 + i * 30));
  }
}
