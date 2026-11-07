import type { AnswerResult, ConceptMastery, Question } from './types.js';

/**
 * محرك التقييم اللحظي — يعمل محلياً بالكامل على جهاز المتعلم دون حساب أو خادم.
 * يصحح الإجابات، ويمنح درجات مرجحة بالتلميحات، ويتتبع الإتقان لكل مفهوم.
 * مصمم ليقرأ حالة المحاكاة الحية عند توليد الأسئلة (الأسئلة تُمرَّر جاهزة).
 */
export class AssessmentEngine {
  private readonly questions = new Map<string, Question>();
  private readonly results: AnswerResult[] = [];
  private readonly hintUsedFor = new Set<string>();

  constructor(questions: readonly Question[]) {
    for (const q of questions) {
      if (this.questions.has(q.id)) throw new Error(`معرف سؤال مكرر: ${q.id}`);
      if (q.type === 'mcq' && (!q.choices || q.choices.length < 2)) {
        throw new Error(`سؤال اختياري بلا خيارات كافية: ${q.id}`);
      }
      this.questions.set(q.id, q);
    }
  }

  get questionCount(): number {
    return this.questions.size;
  }

  getQuestion(id: string): Question {
    const q = this.questions.get(id);
    if (!q) throw new Error(`سؤال غير موجود: ${id}`);
    return q;
  }

  /** يسجل استخدام التلميح — يخفض درجة الإجابة الصحيحة اللاحقة إلى النصف. */
  useHint(questionId: string): string {
    const q = this.getQuestion(questionId);
    this.hintUsedFor.add(questionId);
    return q.hint ?? 'جرّب تغيير متحكم واحد في المحاكاة وراقب أثره.';
  }

  /** يصحح إجابة واحدة ويسجلها. */
  answer(questionId: string, response: string | number): AnswerResult {
    const q = this.getQuestion(questionId);
    const correct = this.check(q, response);
    const hintUsed = this.hintUsedFor.has(questionId);
    const result: AnswerResult = {
      questionId,
      correct,
      score: correct ? (hintUsed ? 0.5 : 1) : 0,
      hintUsed,
    };
    this.results.push(result);
    return result;
  }

  private check(q: Question, response: string | number): boolean {
    if (q.type === 'numeric') {
      const expected = Number(q.answer);
      const actual = Number(response);
      if (!Number.isFinite(actual)) return false;
      return Math.abs(actual - expected) <= (q.tolerance ?? 0);
    }
    // mcq و truefalse: مطابقة نصية بعد التهذيب وتجاهل حالة الأحرف اللاتينية
    return String(response).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  }

  /** إجمالي الدرجات المكتسبة. */
  get totalScore(): number {
    return this.results.reduce((sum, r) => sum + r.score, 0);
  }

  /** عدد الإجابات الصحيحة. */
  get correctCount(): number {
    return this.results.filter((r) => r.correct).length;
  }

  /** إتقان كل مفهوم ظهرت أسئلته في المحاولات. */
  masteryByConcept(): readonly ConceptMastery[] {
    const byConcept = new Map<string, { attempts: number; correct: number; score: number }>();
    for (const r of this.results) {
      const q = this.questions.get(r.questionId)!;
      const entry = byConcept.get(q.concept) ?? { attempts: 0, correct: 0, score: 0 };
      entry.attempts += 1;
      if (r.correct) entry.correct += 1;
      entry.score += r.score;
      byConcept.set(q.concept, entry);
    }
    return [...byConcept.entries()].map(([concept, e]) => ({
      concept,
      attempts: e.attempts,
      correct: e.correct,
      mastery: e.attempts === 0 ? 0 : e.score / e.attempts,
    }));
  }

  /** يصفّر كل المحاولات — بدء جولة تقييم جديدة. */
  reset(): void {
    this.results.length = 0;
    this.hintUsedFor.clear();
  }
}
