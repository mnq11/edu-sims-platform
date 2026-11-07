/**
 * <sim-slider> — منزلق محاكاة بمعايير المنصة:
 * إتاحة WAI-ARIA slider كاملة، اتجاه RTL أصيل، تسمية وصفية لقارئ الشاشة،
 * ونطاق قيم علمي حقيقي (لا بكسلات). العلم أولاً، والبكسل تبعٌ له.
 */
export class SimSlider extends HTMLElement {
  static observedAttributes = ['min', 'max', 'step', 'value', 'label', 'unit'];

  private readonly input: HTMLInputElement;
  private readonly labelEl: HTMLLabelElement;
  private readonly valueEl: HTMLOutputElement;

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        :host { display: block; font-family: inherit; }
        .row { display: flex; align-items: center; gap: 0.75rem; }
        label { font-weight: 600; }
        output { min-width: 5ch; text-align: center; font-variant-numeric: tabular-nums; }
        input[type='range'] { flex: 1; accent-color: #1f6f78; }
        input[type='range']:focus-visible { outline: 3px solid #1f6f78; outline-offset: 2px; }
      </style>
      <div class="row">
        <label id="lbl"></label>
        <input type="range" />
        <output></output>
      </div>`;
    this.input = root.querySelector('input')!;
    this.labelEl = root.querySelector('label')!;
    this.valueEl = root.querySelector('output')!;
    this.input.addEventListener('input', () => this.emit());
  }

  connectedCallback(): void {
    this.sync();
  }

  attributeChangedCallback(): void {
    this.sync();
  }

  private get num(): (name: string, fallback: number) => number {
    return (name, fallback) => {
      const raw = this.getAttribute(name);
      const parsed = raw === null ? NaN : Number(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
  }

  private sync(): void {
    this.input.min = String(this.num('min', 0));
    this.input.max = String(this.num('max', 100));
    this.input.step = String(this.num('step', 1));
    this.input.value = String(this.num('value', this.num('min', 0)));
    const label = this.getAttribute('label') ?? '';
    const unit = this.getAttribute('unit') ?? '';
    this.labelEl.textContent = label;
    this.input.setAttribute('aria-label', unit ? `${label} (${unit})` : label);
    this.valueEl.textContent = `${this.input.value} ${unit}`.trim();
  }

  private emit(): void {
    const unit = this.getAttribute('unit') ?? '';
    this.valueEl.textContent = `${this.input.value} ${unit}`.trim();
    this.dispatchEvent(
      new CustomEvent('sim-change', {
        detail: { value: Number(this.input.value) },
        bubbles: true,
        composed: true,
      }),
    );
  }

  get value(): number {
    return Number(this.input.value);
  }

  set value(next: number) {
    this.input.value = String(next);
    this.sync();
  }
}

customElements.define('sim-slider', SimSlider);
