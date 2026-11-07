/** <sim-button> — زر موحد بتباين مضمون وتركيز واضح ونمط تشغيل/إيقاف. */
export class SimButton extends HTMLElement {
  static observedAttributes = ['variant', 'label'];

  constructor() {
    super();
    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
      <style>
        button {
          font: inherit; font-weight: 700; padding: 0.6rem 1.4rem;
          border-radius: 10px; border: 2px solid transparent; cursor: pointer;
          color: #ffffff; background: #1f6f78; min-height: 44px; min-width: 44px;
        }
        button.secondary { background: transparent; color: #1f6f78; border-color: #1f6f78; }
        button:focus-visible { outline: 3px solid #0f3d42; outline-offset: 2px; }
        button:hover { filter: brightness(1.08); }
      </style>
      <button type="button"></button>`;
  }

  connectedCallback(): void {
    const button = this.shadowRoot!.querySelector('button')!;
    button.textContent = this.getAttribute('label') ?? '';
    if (this.getAttribute('variant') === 'secondary') button.classList.add('secondary');
    button.addEventListener('click', () =>
      this.dispatchEvent(new CustomEvent('sim-press', { bubbles: true, composed: true })),
    );
  }
}

customElements.define('sim-button', SimButton);
