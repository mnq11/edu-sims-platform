/** بنك أسئلة الخط المستقيم — مفاهيم: الميل، المقاطع، التوازي. */
import type { Question } from '@edusims/assessment';

export const QUESTIONS: readonly Question[] = [
  {
    id: 'line-q1',
    type: 'numeric',
    prompt: 'ما ميل الخط المار بالنقطتين (2, 3) و(4, 7)؟',
    concept: 'الميل من نقطتين',
    answer: 2,
    tolerance: 0.01,
    hint: 'الميل = فرق الصادات ÷ فرق السينات = (7−3)÷(4−2).',
  },
  {
    id: 'line-q2',
    type: 'numeric',
    prompt: 'ما المقطع الصادي للخط y = 3x − 6؟',
    concept: 'المقطع الصادي',
    answer: -6,
    tolerance: 0.01,
    hint: 'المقطع الصادي هو قيمة y عندما x = 0.',
  },
  {
    id: 'line-q3',
    type: 'mcq',
    prompt: 'خط ميله موجب — كيف يبدو على المستوى الديكارتي؟',
    concept: 'دلالة إشارة الميل',
    choices: [
      'يصعد من اليسار إلى اليمين',
      'يهبط من اليسار إلى اليمين',
      'أفقي تماماً',
      'شاقولي تماماً',
    ],
    answer: 'يصعد من اليسار إلى اليمين',
    hint: 'جرّب ميلاً موجباً في المحاكاة وراقب اتجاه الخط.',
  },
  {
    id: 'line-q4',
    type: 'numeric',
    prompt: 'ما المقطع السيني للخط y = 2x − 8؟ (اكتب قيمة x)',
    concept: 'المقطع السيني',
    answer: 4,
    tolerance: 0.01,
    hint: 'عند المقطع السيني y = 0 — حلّ 0 = 2x − 8.',
  },
  {
    id: 'line-q5',
    type: 'truefalse',
    prompt: 'الخطان المتوازيان لهما الميل نفسه دائماً.',
    concept: 'توازي الخطوط',
    choices: ['صواب', 'خطأ'],
    answer: 'صواب',
    hint: 'التوازي يعني التصاعد بنفس المعدل — أي الميل ذاته.',
  },
];
