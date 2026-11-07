import type { SimulationEntry, Dimension, Level } from './types.js';
import part1 from './data-part1.json';
import part2 from './data-part2.json';
import part3 from './data-part3.json';
import part4 from './data-part4.json';

/**
 * كتالوج المحاكاة الموسّع — 200 محاكاة جديدة تُضاف إلى الـ200 الأساسية في خارطة الطريق،
 * ليصبح المجموع 400 محاكاة عبر عشرة حقول معرفية. البيانات مجزأة لسهولة الصيانة
 * وتُفك هنا إلى الكائنات الموحدة SimulationEntry.
 */
type Row = [string, string, string, string, string, Level, string[], Dimension, string];

const rows = [...part1, ...part2, ...part3, ...part4] as Row[];

export const NEW_SIMULATIONS: readonly SimulationEntry[] = rows.map(
  ([id, nameAr, nameEn, field, subfield, level, concepts, dim, boost]) => ({
    id, nameAr, nameEn, field, subfield, level, concepts, dim, boost,
  }),
);
