/** بنك أسئلة مختبر الكسور — مفاهيم العمليات الأربع والتكافؤ. */
import type { Question } from '@edusims/assessment';

export const QUESTIONS: readonly Question[] = [
  {
    id: 'frac-q1',
    type: 'mcq',
    prompt: 'ما ناتج 1/2 + 1/3؟',
    concept: 'جمع الكسور',
    choices: ['2/5', '5/6', '1/6', '2/6'],
    answer: '5/6',
    hint: 'وحّد المقامات أولاً: القاسم المشترك لـ 2 و3 هو 6.',
  },
  {
    id: 'frac-q2',
    type: 'mcq',
    prompt: 'ما ناتج 3/4 − 1/4؟',
    concept: 'طرح الكسور',
    choices: ['1/2', '2/8', '1', '1/4'],
    answer: '1/2',
    hint: 'المقامات موحدة أصلاً — اطرح البسوط ثم بسّط.',
  },
  {
    id: 'frac-q3',
    type: 'mcq',
    prompt: 'ما ناتج 2/3 × 3/4؟',
    concept: 'ضرب الكسور',
    choices: ['5/7', '6/12 ولا يُبسَّط', '1/2', '2/4'],
    answer: '1/2',
    hint: 'اضرب البسط في البسط والمقام في المقام ثم اختزل.',
  },
  {
    id: 'frac-q4',
    type: 'numeric',
    prompt: 'كم يساوي 1/2 ÷ 1/4؟ (اكتب الناتج عدداً)',
    concept: 'قسمة الكسور',
    answer: 2,
    tolerance: 0,
    hint: 'القسمة على كسر تعادل الضرب في مقلوبه — جرّب في المحاكاة.',
  },
  {
    id: 'frac-q5',
    type: 'truefalse',
    prompt: 'صواب أم خطأ: الكسران 2/4 و3/6 متكافئان.',
    concept: 'تكافؤ الكسور',
    choices: ['صواب', 'خطأ'],
    answer: 'صواب',
    hint: 'بسّط كليهما إلى أبسط صورة وقارن.',
  },
];
