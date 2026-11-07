/** بنك أسئلة الموجات — مفاهيم: v = f·λ، زمن الدورة، السعة والسرعة. */
import type { Question } from '@edusims/assessment';

export const QUESTIONS: readonly Question[] = [
  {
    id: 'wave-q1',
    type: 'numeric',
    prompt: 'موجة ترددها 2 هرتز وسرعتها 8 م/ث. ما طولها الموجي بالمتر؟',
    concept: 'العلاقة λ = v/f',
    answer: 4,
    tolerance: 0.01,
    hint: 'λ = v ÷ f — جرّب القيم نفسها في المحاكاة واقرأ λ.',
  },
  {
    id: 'wave-q2',
    type: 'numeric',
    prompt: 'موجة ترددها 0.5 هرتز. ما زمن دورتها بالثواني؟',
    concept: 'زمن الدورة T = 1/f',
    answer: 2,
    tolerance: 0.01,
    hint: 'زمن الدورة مقلوب التردد مباشرة.',
  },
  {
    id: 'wave-q3',
    type: 'mcq',
    prompt: 'إذا ضاعفنا تردد موجة مع بقاء سرعتها ثابتة، ماذا يحدث لطولها الموجي؟',
    concept: 'العلاقة العكسية بين f و λ',
    choices: ['يتضاعف', 'ينخفض إلى النصف', 'يبقى ثابتاً', 'يصبح صفراً'],
    answer: 'ينخفض إلى النصف',
    hint: 'λ = v/f والمقام تضاعف والبسط ثابت.',
  },
  {
    id: 'wave-q4',
    type: 'numeric',
    prompt: 'موجة طولها الموجي 3 م وسرعتها 12 م/ث. ما ترددها بالهرتز؟',
    concept: 'اشتقاق التردد f = v/λ',
    answer: 4,
    tolerance: 0.01,
    hint: 'f = v ÷ λ.',
  },
  {
    id: 'wave-q5',
    type: 'truefalse',
    prompt: 'تغيير سعة الموجة يغيّر سرعة انتشارها في الوسط نفسه.',
    concept: 'استقلال السرعة عن السعة',
    choices: ['صواب', 'خطأ'],
    answer: 'خطأ',
    hint: 'سرعة الموجة خاصية للوسط — السعة تحكم الطاقة فقط.',
  },
];
