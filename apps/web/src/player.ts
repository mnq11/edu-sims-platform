/**
 * مشغّل المحاكاة — توجيه داخلي بالهاش يعمل دون خادم ويُخزَّن مؤقتاً بالكامل
 * بواسطة عامل الخدمة، فتعمل كل محاكاة دون اتصال بعد أول زيارة.
 */
import { t } from '@edusims/i18n';

interface SimModule {
  bootstrap(container: HTMLElement): void;
}

export interface PlayableSim {
  readonly id: string;
  readonly nameAr: string;
  readonly tagline: string;
  readonly load: () => Promise<SimModule>;
}

/** سجل المحاكاة القابلة للّعب — يكبر مع كل محاكاة جديدة تُنشر. */
export const PLAYABLE_SIMS: readonly PlayableSim[] = [
  {
    id: 'projectile-motion',
    nameAr: 'الحركة المقذوفة',
    tagline: 'أطلق وقِس المدى — فيزياء الميكانيكا بتحقق تحليلي مدمج',
    load: () => import('@edusims/sim-projectile-motion'),
  },
  {
    id: 'pendulum',
    nameAr: 'البندول البسيط',
    tagline: 'اكتشف زمن الدورة بنفسك — من جاليليو إلى ساعتك',
    load: () => import('@edusims/sim-pendulum'),
  },
  {
    id: 'sorting-visualized',
    nameAr: 'سباق خوارزميات الفرز',
    tagline: 'الفقاعي ضد الاختياري ضد الإدخالي — شاهد التعقيد يحدث',
    load: () => import('@edusims/sim-sorting-visualized'),
  },
];

/** يرسم صفحة تشغيل محاكاة واحدة ويحمّلها عند الطلب (تقسيم شيفرة تلقائي). */
export async function renderPlayer(root: HTMLElement, simId: string): Promise<void> {
  const sim = PLAYABLE_SIMS.find((s) => s.id === simId);
  if (!sim) {
    location.hash = '#/';
    return;
  }
  root.innerHTML = `
    <nav class="sim-nav">
      <a href="#/" class="back-link">← ${t('app.backToCatalog')}</a>
    </nav>
    <header class="sim-header">
      <h2>${sim.nameAr}</h2>
      <p>${sim.tagline}</p>
    </header>
    <div id="sim-root" class="sim-root" aria-busy="true"></div>`;

  const container = root.querySelector<HTMLElement>('#sim-root')!;
  try {
    const mod = await sim.load();
    container.setAttribute('aria-busy', 'false');
    mod.bootstrap(container);
  } catch {
    container.innerHTML = `<p role="alert">تعذر تحميل المحاكاة — حاول تحديث الصفحة.</p>`;
  }
}
