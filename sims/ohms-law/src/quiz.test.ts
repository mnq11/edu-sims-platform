import { describe, expect, it } from 'vitest';
import { AssessmentEngine } from '@edusims/assessment';
import { QUESTIONS } from './quiz.js';

describe('بنك الأسئلة — سلامة البيانات', () => {
  it('كل سؤال صالح هيكلياً ويُقبل في المحرك', () => {
    const engine = new AssessmentEngine(QUESTIONS);
    expect(engine.questionCount).toBe(QUESTIONS.length);
    for (const q of QUESTIONS) {
      expect(q.prompt.length).toBeGreaterThan(5);
      expect(q.concept.length).toBeGreaterThan(1);
      if (q.type === 'mcq' || q.type === 'truefalse') {
        expect(q.choices).toContain(q.answer);
      }
    }
  });

  it('الإجابات المرجعية تمنح العلامة الكاملة', () => {
    const engine = new AssessmentEngine(QUESTIONS);
    for (const q of QUESTIONS) {
      const r = engine.answer(q.id, q.answer);
      expect(r.correct).toBe(true);
    }
    expect(engine.totalScore).toBe(QUESTIONS.length);
  });
});
