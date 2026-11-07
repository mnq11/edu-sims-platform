/**
 * عرض الموجة الجيبية — رسم متحرك على canvas مع بوابة prefers-reduced-motion:
 * عند تفعيل تقليل الحركة نرسم إطاراً واحداً ساكناً بدون حلقة rAF.
 */
import { prefersReducedMotion, onReducedMotionChange } from '@edusims/ui';
import type { WaveModel } from './model.js';

const W = 720;
const H = 440;
const X_MIN = 0;
const X_MAX = 12; // متر معروضة
const Y_MAX = 1.2; // متر

const toPx = (x: number) => ((x - X_MIN) / (X_MAX - X_MIN)) * W;
const toPy = (y: number) => H / 2 - (y / Y_MAX) * (H / 2 - 40);

export class WaveView {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly status: HTMLElement;
  private readonly reading: HTMLElement;
  private raf = 0;
  private reduced = prefersReducedMotion();
  private readonly unsubscribe: () => void;

  constructor(private readonly model: WaveModel, host: HTMLElement) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.style.cssText = 'display:block;max-width:100%;border-radius:12px;background:#0f172a;';
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D غير متاح');
    this.ctx = ctx;

    this.status = document.createElement('p');
    this.status.className = 'sr-only';
    this.status.setAttribute('role', 'status');
    this.status.setAttribute('aria-live', 'polite');

    this.reading = document.createElement('div');
    this.reading.style.cssText =
      'display:flex;gap:16px;flex-wrap:wrap;margin-top:10px;font-size:14px;color:#1f2933;';
    host.append(this.canvas, this.reading, this.status);

    const refresh = () => {
      this.draw();
      this.updateReading();
    };
    model.frequency.link(refresh);
    model.amplitude.link(refresh);
    model.waveSpeed.link(refresh);

    this.unsubscribe = onReducedMotionChange((value) => {
      this.reduced = value;
      this.restart();
    });
    this.restart();
  }

  /** تشغيل/إيقاف حلقة الرسم حسب تفضيل الحركة. */
  private restart(): void {
    cancelAnimationFrame(this.raf);
    if (this.reduced) {
      this.draw();
      this.updateReading();
      this.status.textContent = 'موجة ساكنة (وضع تقليل الحركة).';
      return;
    }
    const loop = (timestamp: number) => {
      this.model.clock.tick(timestamp);
      this.draw();
      this.updateReading();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }

  private updateReading(): void {
    const m = this.model;
    this.reading.innerHTML =
      `<span>الطول الموجي λ = <strong>${m.wavelength.value.toFixed(2)} م</strong></span>` +
      `<span>زمن الدورة T = <strong>${m.period.value.toFixed(2)} ث</strong></span>` +
      `<span>v = f·λ = <strong>${(m.frequency.value * m.wavelength.value).toFixed(2)} م/ث</strong></span>`;
  }

  private draw(): void {
    const { ctx, model } = this;
    ctx.clearRect(0, 0, W, H);

    // محور التوازن
    ctx.strokeStyle = 'rgba(148,163,184,0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();

    // الموجة
    ctx.strokeStyle = '#2dd4bf';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let px = 0; px <= W; px += 2) {
      const x = X_MIN + (px / W) * (X_MAX - X_MIN);
      const y = model.displacement(x);
      const py = toPy(y);
      if (px === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // وسم طول موجي واحد بين قمتين متتاليتين
    const k = (2 * Math.PI) / model.wavelength.value;
    const omega = 2 * Math.PI * model.frequency.value;
    const crest1 = (Math.PI / 2 + omega * model.time.value) / k;
    const crest2 = crest1 + model.wavelength.value;
    if (crest1 >= X_MIN && crest2 <= X_MAX) {
      const yC = toPy(model.amplitude.value) - 14;
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(toPx(crest1), yC);
      ctx.lineTo(toPx(crest2), yC);
      ctx.stroke();
      for (const cx of [crest1, crest2]) {
        ctx.beginPath();
        ctx.moveTo(toPx(cx), yC - 5);
        ctx.lineTo(toPx(cx), yC + 5);
        ctx.stroke();
      }
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('λ', (toPx(crest1) + toPx(crest2)) / 2, yC - 8);
    }
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    this.unsubscribe();
  }
}
