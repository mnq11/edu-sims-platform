import { setDirection } from '@edusims/ui';
import { renderCatalog } from './app.js';
import { renderPlayer } from './player.js';
import './styles.css';

// المنصة عربية أولاً — الاتجاه RTL هو الحالة الافتراضية وليس إضافة لاحقة.
setDirection('rtl');

const root = document.querySelector<HTMLElement>('#catalog-app');

/** توجيه بالهاش: ‎#‎/‎ للكتالوج و‎#‎/sim/{id}‎ لتشغيل محاكاة — بلا خادم إطلاقاً. */
function route(): void {
  if (!root) return;
  const simMatch = location.hash.match(/^#\/sim\/([\w-]+)$/);
  if (simMatch) {
    void renderPlayer(root, simMatch[1]!);
  } else {
    renderCatalog(root);
  }
}

window.addEventListener('hashchange', route);
route();

// تطبيق ويب تقدمي: تسجيل عامل الخدمة للعمل دون اتصال (في الإنتاج فقط)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  void navigator.serviceWorker.register('/sw.js');
}
