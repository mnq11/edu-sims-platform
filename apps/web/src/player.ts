/**
 * مشغّل المحاكاة — توجيه داخلي بالهاش يعمل دون خادم ويُخزَّن مؤقتاً بالكامل
 * بواسطة عامل الخدمة، فتعمل كل محاكاة دون اتصال بعد أول زيارة.
 * كل محاكاة قابلة للّعب ترافقها لوحة «اختبر نفسك» من بنك أسئلتها.
 */
import { t } from '@edusims/i18n';
import type { Question } from '@edusims/assessment';
import { renderQuizPanel } from './quiz-panel.js';

interface SimModule {
  bootstrap(container: HTMLElement): void;
  readonly QUESTIONS?: readonly Question[];
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
    id: 'ohms-law',
    nameAr: 'قانون أوم',
    tagline: 'دائرة حية — غيّر الجهد والمقاومة وراقب تدفق التيار',
    load: () => import('@edusims/sim-ohms-law'),
  },
  {
    id: 'balancing-equations',
    nameAr: 'موازنة المعادلات الكيميائية',
    tagline: 'الحفظ الكتلي لعبة ذكاء — وازن الذرات على الطرفين',
    load: () => import('@edusims/sim-balancing-equations'),
  },
  {
    id: 'fraction-lab',
    nameAr: 'مختبر الكسور',
    tagline: 'شريطان كسريان حيّان — الجمع والطرح والضرب والقسمة بدقة تامة',
    load: () => import('@edusims/sim-fraction-lab'),
  },
  {
    id: 'compound-interest',
    nameAr: 'شجرة الفائدة المركبة',
    tagline: 'شاهد النمو الأسي يحدث — من ادخار بسيط إلى ثروة',
    load: () => import('@edusims/sim-compound-interest'),
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
    <div id="sim-root" class="sim-root" aria-busy="true"></div>
    <div id="quiz-root" class="quiz-root"></div>`;

  const container = root.querySelector<HTMLElement>('#sim-root')!;
  const quizRoot = root.querySelector<HTMLElement>('#quiz-root')!;
  try {
    const mod = await sim.load();
    container.setAttribute('aria-busy', 'false');
    mod.bootstrap(container);
    if (mod.QUESTIONS && mod.QUESTIONS.length > 0) {
      renderQuizPanel(quizRoot, mod.QUESTIONS);
    }
  } catch {
    container.innerHTML = `<p role="alert">تعذر تحميل المحاكاة — حاول تحديث الصفحة.</p>`;
  }
}
