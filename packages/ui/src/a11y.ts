/**
 * أدوات الوصول (WCAG 2.2) — مساعد «تقليل الحركة».
 *
 * تُستخدم من عروض المحاكاة لإيقاف الحركة الزخرفية (حلقات rAF، مؤثرات
 * التتبع) عندما يفضّل المستخدم تقليل الحركة على مستوى نظام التشغيل،
 * امتثالاً لمعيار WCAG 2.2 النجاح 2.3.3 / 2.3.4.
 */

/** هل فعّل المستخدم تفضيل «تقليل الحركة»؟ يعيد false في بيئات بلا DOM (الاختبارات). */
export function prefersReducedMotion(): boolean {
  return (
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * يشغّل رد نداء عند تغيّر التفضيل، ويعيد دالة إلغاء الاشتراك.
 * تسمح للعروض بتحديث سلوكها فورياً دون إعادة تحميل الصفحة.
 */
export function onReducedMotionChange(listener: (reduced: boolean) => void): () => void {
  if (typeof matchMedia === 'undefined') return () => undefined;
  const query = matchMedia('(prefers-reduced-motion: reduce)');
  const handler = (event: MediaQueryListEvent): void => listener(event.matches);
  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}
