/**
 * نموذج موازنة المعادلات الكيميائية — المتعلم يضبط المعاملات ويرى
 * عدّ الذرات على الطرفين لحظياً. الحفظ الكتلي هو الحكم الوحيد:
 * معادلة متزنة ⇔ عدد ذرات كل عنصر متساوٍ بين المتفاعلات والنواتج.
 */
import { Property, SimModel } from '@edusims/core';
import type { SimState } from '@edusims/core';

/** مادة كيميائية بعدّ ذراتها: { العنصر: عدد الذرات في الجزيء }. */
export interface Species {
  readonly formula: string;
  readonly atoms: Readonly<Record<string, number>>;
}

export interface Reaction {
  readonly id: string;
  readonly nameAr: string;
  readonly reactants: readonly Species[];
  readonly products: readonly Species[];
  /** الحل المرجعي (معاملات مصغّرة بأبسط نسبة) — للاختبار والتلميح الذكي. */
  readonly solution: readonly number[];
}

/** تفاعلات مدمجة شائعة في المناهج. */
export const REACTIONS: readonly Reaction[] = [
  {
    id: 'combustion-methane',
    nameAr: 'احتراق الميثان',
    reactants: [
      { formula: 'CH₄', atoms: { C: 1, H: 4 } },
      { formula: 'O₂', atoms: { O: 2 } },
    ],
    products: [
      { formula: 'CO₂', atoms: { C: 1, O: 2 } },
      { formula: 'H₂O', atoms: { H: 2, O: 1 } },
    ],
    solution: [1, 2, 1, 2],
  },
  {
    id: 'water-synthesis',
    nameAr: 'تكوين الماء',
    reactants: [
      { formula: 'H₂', atoms: { H: 2 } },
      { formula: 'O₂', atoms: { O: 2 } },
    ],
    products: [{ formula: 'H₂O', atoms: { H: 2, O: 1 } }],
    solution: [2, 1, 2],
  },
  {
    id: 'ammonia-haber',
    nameAr: 'تفاعل هابر لإنتاج الأمونيا',
    reactants: [
      { formula: 'N₂', atoms: { N: 2 } },
      { formula: 'H₂', atoms: { H: 2 } },
    ],
    products: [{ formula: 'NH₃', atoms: { N: 1, H: 3 } }],
    solution: [1, 3, 2],
  },
];

/** يعدّ ذرات كل عنصر في قائمة مواد بمعاملاتها. */
export function countAtoms(
  speciesList: readonly Species[],
  coefficients: readonly number[],
): Record<string, number> {
  const totals: Record<string, number> = {};
  speciesList.forEach((s, idx) => {
    const coeff = coefficients[idx] ?? 0;
    for (const [element, count] of Object.entries(s.atoms)) {
      totals[element] = (totals[element] ?? 0) + count * coeff;
    }
  });
  return totals;
}

/** يتحقق من تساوي عدّ الذرات بين طرفين لكل العناصر. */
export function atomsEqual(a: Record<string, number>, b: Record<string, number>): boolean {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  }
  return true;
}

const DEFAULTS = { reactionIndex: 0 };
const MAX_COEFF = 10;

export class BalancingModel extends SimModel {
  readonly reactionIndex = new Property(DEFAULTS.reactionIndex);
  /** معاملات المواد كافة: متفاعلات ثم نواتج، بترتيب تعريف التفاعل. */
  readonly coefficients: Property<readonly number[]>;
  /** هل المعادلة متزنة الآن؟ يُحدَّث مع كل تغيير معامل. */
  readonly balanced: Property<boolean>;

  constructor() {
    super();
    const initial = this.allSpecies().map(() => 1);
    this.coefficients = new Property<readonly number[]>(initial);
    this.balanced = new Property(this.computeBalanced(initial));
  }

  get reaction(): Reaction {
    return REACTIONS[this.reactionIndex.value % REACTIONS.length]!;
  }

  private allSpecies(): readonly Species[] {
    return [...this.reaction.reactants, ...this.reaction.products];
  }

  private computeBalanced(coeffs: readonly number[]): boolean {
    const r = this.reaction;
    const left = countAtoms(r.reactants, coeffs.slice(0, r.reactants.length));
    const right = countAtoms(r.products, coeffs.slice(r.reactants.length));
    return atomsEqual(left, right);
  }

  /** يضبط معامل المادة i (1..10) — خارج النطاق يُثبَّت. */
  setCoefficient(index: number, value: number): void {
    const species = this.allSpecies();
    if (index < 0 || index >= species.length) return;
    const clamped = Math.min(MAX_COEFF, Math.max(1, Math.round(value)));
    const next = [...this.coefficients.value];
    next[index] = clamped;
    this.coefficients.value = next;
    this.balanced.value = this.computeBalanced(next);
  }

  /** يختار تفاعلاً آخر ويعيد المعاملات إلى 1. */
  selectReaction(index: number): void {
    this.reactionIndex.value = index;
    const initial = this.allSpecies().map(() => 1);
    this.coefficients.value = initial;
    this.balanced.value = this.computeBalanced(initial);
  }

  /** عدّ الذرات الحالي على الطرفين — للعرض والتحليل. */
  atomCounts(): { left: Record<string, number>; right: Record<string, number> } {
    const r = this.reaction;
    const coeffs = this.coefficients.value;
    return {
      left: countAtoms(r.reactants, coeffs.slice(0, r.reactants.length)),
      right: countAtoms(r.products, coeffs.slice(r.reactants.length)),
    };
  }

  protected step(_dt: number): void {
    // نموذج ساكن — الحساب لحظي عند تغيير المعاملات
  }

  reset(): void {
    this.selectReaction(DEFAULTS.reactionIndex);
  }

  getState(): SimState {
    return {
      schemaVersion: 1,
      values: {
        reactionIndex: this.reactionIndex.value,
        coefficients: this.coefficients.value.join(','),
      },
    };
  }

  setState(state: SimState): void {
    const v = state.values;
    this.selectReaction(Number(v['reactionIndex'] ?? DEFAULTS.reactionIndex));
    const parts = String(v['coefficients'] ?? '').split(',').map(Number);
    parts.forEach((n, i) => {
      if (Number.isFinite(n)) this.setCoefficient(i, n);
    });
  }
}
