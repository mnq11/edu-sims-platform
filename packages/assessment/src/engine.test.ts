import { describe, expect, it } from 'vitest';
import { AssessmentEngine } from './engine.js';
import type { Question } from './types.js';

const QUESTIONS: readonly Question[] = [
  {
    id: 'q1', type: 'mcq', concept: 'المدى',
    prompt: 'أي زاوية تعطي أقصى مدى بلا مقاومة هواء؟',
    choices: ['30°', '45°', '60°', '90°'], answer: '45°',
    hint: 'فكّر في التوازن بين المركبتين الأفقية والرأسية.',
  },
  {
    id: 'q2', type: 'numeric', concept: 'المدى',
    prompt: 'احسب مدى مقذوف بسرعة 20 م/ث وزاوية 45° (g=9.81)',
    answer: 40.77, tolerance: 0.5,
  },
  {
    id: 'q3', type: 'truefalse', concept: 'الجاذبية',
    prompt: 'كتلة الجسم لا تؤثر في مداه بلا مقاومة هواء',
    answer: 'صحيح',
  },
];

describe('AssessmentEngine — تصحيح وإتقان محلي بالكامل', () => {
  it('يصحح الاختياري والصواب/خطأ نصياً بمرونة', () => {
    const e = new AssessmentEngine(QUESTIONS);
    expect(e.answer('q1', '45°').correct).toBe(true);
    expect(e.answer('q3', 'صحيح').correct).toBe(true);
    expect(e.answer('q1', '90°').correct).toBe(false);
  });

  it('يصحح الرقمي ضمن هامش القبول فقط', () => {
    const e = new AssessmentEngine(QUESTIONS);
    expect(e.answer('q2', 40.9).correct).toBe(true);
    expect(e.answer('q2', 41.5).correct).toBe(false);
    expect(e.answer('q2', 'ليس رقماً').correct).toBe(false);
  });

  it('يخفض درجة الإجابة الصحيحة إلى النصف بعد التلميح', () => {
    const e = new AssessmentEngine(QUESTIONS);
    e.useHint('q1');
    const r = e.answer('q1', '45°');
    expect(r.correct).toBe(true);
    expect(r.score).toBe(0.5);
    expect(r.hintUsed).toBe(true);
  });

  it('يتتبع الإتقان لكل مفهوم على حدة', () => {
    const e = new AssessmentEngine(QUESTIONS);
    e.answer('q1', '45°'); // صحيح — المدى
    e.answer('q2', 30); // خطأ — المدى
    e.answer('q3', 'صحيح'); // صحيح — الجاذبية
    const mastery = e.masteryByConcept();
    const rangeMastery = mastery.find((m) => m.concept === 'المدى')!;
    const gravityMastery = mastery.find((m) => m.concept === 'الجاذبية')!;
    expect(rangeMastery.attempts).toBe(2);
    expect(rangeMastery.correct).toBe(1);
    expect(rangeMastery.mastery).toBeCloseTo(0.5);
    expect(gravityMastery.mastery).toBe(1);
  });

  it('reset يعيد المحرك لحالة البداية', () => {
    const e = new AssessmentEngine(QUESTIONS);
    e.answer('q1', '45°');
    e.reset();
    expect(e.totalScore).toBe(0);
    expect(e.correctCount).toBe(0);
    expect(e.masteryByConcept()).toHaveLength(0);
  });

  it('يرفض معرفات مكررة وأسئلة اختيارية ناقصة', () => {
    expect(() => new AssessmentEngine([
      { id: 'x', type: 'mcq', prompt: 'أ', concept: 'ج', choices: ['1'], answer: '1' },
    ])).toThrow();
    expect(() => new AssessmentEngine([
      { id: 'x', type: 'truefalse', prompt: 'أ', concept: 'ج', answer: 'صحيح' },
      { id: 'x', type: 'truefalse', prompt: 'ب', concept: 'ج', answer: 'خطأ' },
    ])).toThrow();
  });

  it('يرمي خطأ واضحاً عند سؤال غير موجود', () => {
    const e = new AssessmentEngine(QUESTIONS);
    expect(() => e.answer('q99', 'x')).toThrow('سؤال غير موجود');
  });
});
