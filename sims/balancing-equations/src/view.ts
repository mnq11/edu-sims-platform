/**
 * عرض موازنة المعادلات — بطاقات مواد بمحرّكات معاملات (+/−)، وجدول عدّ ذرات
 * حي لكل عنصر على الطرفين، ولافتة توازن خضراء عند تحقق الحفظ الكتلي.
 */
import type { BalancingModel } from './model.js';

export class BalancingView {
  private readonly root: HTMLElement;

  constructor(
    container: HTMLElement,
    private readonly model: BalancingModel,
    private readonly liveRegion: HTMLElement,
  ) {
    this.root = document.createElement('div');
    this.root.className = 'balance-lab';
    container.appendChild(this.root);
    model.coefficients.link(() => this.render());
    model.balanced.link((balanced) => {
      if (balanced) {
        this.liveRegion.textContent = `أحسنت — معادلة ${model.reaction.nameAr} متزنة الآن`;
      }
    });
    model.reactionIndex.link(() => this.render());
    this.render();
  }

  /** بطاقة مادة واحدة: معامل قابل للضبط ثم الصيغة. */
  private speciesCard(index: number, formula: string, coeff: number): string {
    return `
      <div class="species-card" data-index="${index}">
        <div class="coeff-stepper" role="group" aria-label="معامل ${formula}">
          <button type="button" class="step-btn" data-step="1" aria-label="زيادة">+</button>
          <span class="coeff-value">${coeff}</span>
          <button type="button" class="step-btn" data-step="-1" aria-label="إنقاص">−</button>
        </div>
        <span class="formula">${formula}</span>
      </div>`;
  }

  render(): void {
    const { model } = this;
    const reaction = model.reaction;
    const coeffs = model.coefficients.value;
    const nR = reaction.reactants.length;

    const reactantsHtml = reaction.reactants
      .map((s, i) => this.speciesCard(i, s.formula, coeffs[i] ?? 1))
      .join('<span class="plus">+</span>');
    const productsHtml = reaction.products
      .map((s, i) => this.speciesCard(nR + i, s.formula, coeffs[nR + i] ?? 1))
      .join('<span class="plus">+</span>');

    const { left, right } = model.atomCounts();
    const elements = [...new Set([...Object.keys(left), ...Object.keys(right)])];
    const rows = elements.map((el) => {
      const l = left[el] ?? 0;
      const r = right[el] ?? 0;
      const ok = l === r;
      return `<tr class="${ok ? 'ok' : 'bad'}">
        <td>${el}</td><td>${l}</td><td>${r}</td><td>${ok ? '✓' : '✗'}</td>
      </tr>`;
    }).join('');

    this.root.innerHTML = `
      <h3 class="reaction-name">${reaction.nameAr}</h3>
      <div class="equation-row">
        <div class="side">${reactantsHtml}</div>
        <span class="arrow" aria-label="ينتج">←</span>
        <div class="side">${productsHtml}</div>
      </div>
      <table class="atom-table">
        <thead><tr><th>العنصر</th><th>المتفاعلات</th><th>النواتج</th><th>الحالة</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="balance-banner ${model.balanced.value ? 'on' : ''}" role="status">
        ${model.balanced.value ? '⚖️ المعادلة متزنة — الكتلة محفوظة على الطرفين' : 'عدّل المعاملات حتى تتساوى ذرات كل عنصر'}
      </p>`;

    this.root.querySelectorAll<HTMLButtonElement>('.step-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest<HTMLElement>('.species-card')!;
        const index = Number(card.dataset.index);
        const delta = Number(btn.dataset.step);
        model.setCoefficient(index, (model.coefficients.value[index] ?? 1) + delta);
      });
    });
  }
}
