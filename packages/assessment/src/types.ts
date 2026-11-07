/** أنواع الأسئلة المدعومة في محرك التقييم. */
export type QuestionType = 'mcq' | 'numeric' | 'truefalse';

/** سؤال تقييم مرتبط بمفهوم واحد على الأقل لتتبع الإتقان. */
export interface Question {
  readonly id: string;
  readonly type: QuestionType;
  /** نص السؤال المعروض للمتعلم. */
  readonly prompt: string;
  /** المفهوم المستهدف — يُجمَّع الإتقان على مستواه. */
  readonly concept: string;
  /** خيارات الاختيار من متعدد (إلزامية لنوع mcq فقط). */
  readonly choices?: readonly string[];
  /** الإجابة الصحيحة: نص لـ mcq/truefalse، ورقم لـ numeric. */
  readonly answer: string | number;
  /** هامش القبول المطلق لأسئلة numeric (افتراضي 0). */
  readonly tolerance?: number;
  /** تلميح سقراطي يُعرض عند الطلب أو بعد خطأ — لا يعطي الإجابة. */
  readonly hint?: string;
}

/** نتيجة محاولة إجابة واحدة. */
export interface AnswerResult {
  readonly questionId: string;
  readonly correct: boolean;
  /** درجة المحاولة: 1 صحيح من أول مرة، 0.5 بعد تلميح، 0 خطأ. */
  readonly score: number;
  readonly hintUsed: boolean;
}

/** ملخص إتقان مفهوم واحد. */
export interface ConceptMastery {
  readonly concept: string;
  readonly attempts: number;
  readonly correct: number;
  /** نسبة الإتقان 0..1 — تُحتسب من المحاولات الصحيحة مرجحة بالدرجات. */
  readonly mastery: number;
}
