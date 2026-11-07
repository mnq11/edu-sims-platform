/**
 * قواميس السلاسل المشتركة — العربية هي المرجع (اللغة الأم للمنصة)،
 * وأي لغة جديدة تُضاف بتسجيل قاموسها عبر registerDictionary دون تعديل النواة.
 * المفاتيح بصيغة نطاق.مفتاح (scope.key) لتجنب التصادم بين الحزم.
 */
export type Locale = string;

export interface Dictionary {
  readonly [key: string]: string;
}

const ar: Dictionary = {
  'app.title': 'منصة المحاكاة التعليمية المفتوحة',
  'app.tagline': 'مجانية للجميع — دون تسجيل دخول، دون حواجز',
  'app.searchPlaceholder': 'مثال: الفائدة المركبة، الخلية، دوبلر…',
  'app.searchLabel': 'ابحث في المحاكاة',
  'app.playableSection': 'محاكاة جاهزة للتجربة الآن',
  'app.playNow': 'جرّب الآن',
  'app.backToCatalog': 'عودة إلى الكتالوج',
  'app.resultCount': 'يظهر {shown} من أصل {total} محاكاة جديدة',
  'sim.launch': 'إطلاق',
  'sim.reset': 'إعادة ضبط',
  'sim.pause': 'إيقاف مؤقت',
  'sim.play': 'تشغيل',
  'sim.share': 'نسخ رابط هذه التجربة',
  'sim.shareCopied': 'نُسخ رابط التجربة — شاركه مع أي شخص دون تسجيل',
  'sim.stateLoadFailed': 'تعذر فتح الحالة المشتركة — بدأنا تجربة جديدة',
  'sim.undo': 'تراجع',
  'sim.fullscreen': 'ملء الشاشة',
  'a11y.skipToContent': 'تخطَّ إلى المحتوى الرئيسي',
  'a11y.controls': 'لوحة التحكم',
  'assess.check': 'تحقق',
  'assess.hint': 'تلميح',
  'assess.correct': 'إجابة صحيحة — أحسنت!',
  'assess.incorrect': 'ليست الإجابة بعد — جرّب مرة أخرى أو اطلب تلميحاً',
  'assess.mastery': 'إتقانك في مفهوم {concept}: {percent}٪',
  'assess.title': 'اختبر نفسك',
  'assess.score': 'نتيجتك: {score} من {total}',
  'assess.tryAgain': 'جولة جديدة',
  'assess.yourAnswer': 'اكتب إجابتك',
};

const en: Dictionary = {
  'app.title': 'Open Educational Simulations Platform',
  'app.tagline': 'Free for everyone — no sign-in, no barriers',
  'app.searchPlaceholder': 'e.g. compound interest, cell, Doppler…',
  'app.searchLabel': 'Search simulations',
  'app.playableSection': 'Playable simulations',
  'app.playNow': 'Try now',
  'app.backToCatalog': 'Back to catalog',
  'app.resultCount': 'Showing {shown} of {total} new simulations',
  'sim.launch': 'Launch',
  'sim.reset': 'Reset',
  'sim.pause': 'Pause',
  'sim.play': 'Play',
  'sim.share': 'Copy link to this experiment',
  'sim.shareCopied': 'Experiment link copied — share it with anyone, no sign-in',
  'sim.stateLoadFailed': 'Could not open the shared state — started a fresh experiment',
  'sim.undo': 'Undo',
  'sim.fullscreen': 'Fullscreen',
  'a11y.skipToContent': 'Skip to main content',
  'a11y.controls': 'Controls panel',
  'assess.check': 'Check',
  'assess.hint': 'Hint',
  'assess.correct': 'Correct — well done!',
  'assess.incorrect': 'Not quite — try again or ask for a hint',
  'assess.mastery': 'Your mastery of {concept}: {percent}%',
  'assess.title': 'Test yourself',
  'assess.score': 'Your score: {score} of {total}',
  'assess.tryAgain': 'New round',
  'assess.yourAnswer': 'Type your answer',
};

export const BUILTIN_DICTIONARIES: Readonly<Record<string, Dictionary>> = { ar, en };
