import { NEW_SIMULATIONS } from '@edusims/catalog';
import type { SimulationEntry } from '@edusims/catalog';

/** يجمع الحقول الفريدة من الكتالوج لأزرار التصفية. */
function uniqueFields(entries: readonly SimulationEntry[]): string[] {
  return [...new Set(entries.map((e) => e.field))];
}

function matches(entry: SimulationEntry, query: string, field: string | null): boolean {
  const inField = field === null || entry.field === field;
  if (!inField) return false;
  if (query.trim() === '') return true;
  const haystack = [entry.nameAr, entry.nameEn, entry.subfield, ...entry.concepts]
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function card(entry: SimulationEntry): string {
  return `
    <article class="sim-card" data-id="${entry.id}">
      <header class="sim-card-header">
        <span class="sim-id">${entry.id}</span>
        <span class="sim-dim" title="نمط العرض">${entry.dim}</span>
      </header>
      <h3>${entry.nameAr}</h3>
      <p class="sim-en">${entry.nameEn}</p>
      <dl class="sim-meta">
        <div><dt>المجال</dt><dd>${entry.subfield}</dd></div>
        <div><dt>المرحلة</dt><dd>${entry.level}</dd></div>
        <div><dt>المفاهيم</dt><dd>${entry.concepts.join('، ')}</dd></div>
        <div><dt>التعزيز</dt><dd>${entry.boost}</dd></div>
      </dl>
    </article>`;
}

/** يرسم كتالوج المحاكاة مع بحث فوري وتصفية حسب الحقل — دون أي خادم أو حساب. */
export function renderCatalog(root: HTMLElement): void {
  const fields = uniqueFields(NEW_SIMULATIONS);
  root.innerHTML = `
    <div class="toolbar" role="search">
      <label class="search-label">
        <span>ابحث في المحاكاة</span>
        <input type="search" id="q" placeholder="مثال: الفائدة المركبة، الخلية، دوبلر…" />
      </label>
      <div class="field-filters" role="group" aria-label="تصفية حسب المجال">
        <button class="chip active" data-field="">الكل (${NEW_SIMULATIONS.length})</button>
        ${fields
          .map(
            (f) =>
              `<button class="chip" data-field="${f}">${f} (${
                NEW_SIMULATIONS.filter((e) => e.field === f).length
              })</button>`,
          )
          .join('')}
      </div>
    </div>
    <p class="result-count" role="status" aria-live="polite"></p>
    <div class="grid" id="grid"></div>`;

  const grid = root.querySelector<HTMLElement>('#grid')!;
  const status = root.querySelector<HTMLElement>('.result-count')!;
  const search = root.querySelector<HTMLInputElement>('#q')!;
  let activeField: string | null = null;

  const render = (): void => {
    const results = NEW_SIMULATIONS.filter((e) => matches(e, search.value, activeField));
    grid.innerHTML = results.map(card).join('');
    status.textContent = `يظهر ${results.length} من أصل ${NEW_SIMULATIONS.length} محاكاة جديدة`;
  };

  search.addEventListener('input', render);
  root.querySelectorAll<HTMLButtonElement>('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      root.querySelector('.chip.active')?.classList.remove('active');
      chip.classList.add('active');
      activeField = chip.dataset.field === '' ? null : (chip.dataset.field ?? null);
      render();
    });
  });

  render();
}
