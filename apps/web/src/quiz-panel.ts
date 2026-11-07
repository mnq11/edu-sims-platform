/**
 * لوحة «اختبر نفسك» — تربط محرك التقييم بالمحاكاة المعروضة.
 * تصحيح لحظي، تلميحات تُخفض الدرجة، وملخص إتقان لكل مفهوم —
 * كل شيء محلي على جهاز المتعلم دون حساب أو إرسال بيانات.
 */
import { AssessmentEngine } from '@edusims/assessment';
import type { Question } from '@edusims/assessment';
import { t } from '@edusims/i18n';

/** يرسم لوحة تقييم لبنك أسئلة محاكاة ويعيد لا شيء — التفاعل كله داخل اللوحة. */
export function renderQuizPanel(container: HTMLElement, questions: readonly Question[]): void {
  const engine = new AssessmentEngine(questions);

  container.innerHTML = `
    <details class="quiz-panel" open>
      <summary><strong>${t('assess.title')}</strong> <span class="quiz-count">(${questions.length})</span></summary>
      <div class="quiz-body">
        <p class="quiz-score" role="status" aria-live="polite"></p>
        <div class="quiz-cards"></div>
        <div class="quiz-mastery"></div>
        <button type="button" class="share quiz-reset">${t('assess.tryAgain')}</button>
      </div>
    </details>`;

  const scoreEl = container.querySelector<HTMLElement>('.quiz-score')!;
  const cardsEl = container.querySelector<HTMLElement>('.quiz-cards')!;
  const masteryEl = container.querySelector<HTMLElement>('.quiz-mastery')!;

  const updateSummary = (): void => {
    scoreEl.textContent = t('assess.score', {
      score: engine.totalScore,
      total: questions.length,
    });
    const mastery = engine.masteryByConcept();
    masteryEl.innerHTML = mastery
      .map((m) => `<p class="mastery-line">${t('assess.mastery', {
        concept: m.concept,
        percent: Math.round(m.mastery * 100),
      })}</p>`)
      .join('');
  };

  questions.forEach((q) => {
    const card = document.createElement('fieldset');
    card.className = 'quiz-card';
    const legend = document.createElement('legend');
    legend.textContent = q.prompt;
    card.appendChild(legend);

    const feedback = document.createElement('p');
    feedback.className = 'quiz-feedback';
    feedback.setAttribute('role', 'status');

    const record = (response: string | number): void => {
      const result = engine.answer(q.id, response);
      feedback.textContent = result.correct ? t('assess.correct') : t('assess.incorrect');
      feedback.className = `quiz-feedback ${result.correct ? 'ok' : 'bad'}`;
      updateSummary();
    };

    if (q.type === 'numeric') {
      const row = document.createElement('div');
      row.className = 'quiz-input-row';
      const input = document.createElement('input');
      input.type = 'number';
      input.step = 'any';
      input.setAttribute('aria-label', t('assess.yourAnswer'));
      const check = document.createElement('button');
      check.type = 'button';
      check.className = 'chip';
      check.textContent = t('assess.check');
      const submit = (): void => {
        if (input.value !== '') record(Number(input.value));
      };
      check.addEventListener('click', submit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') submit();
      });
      row.append(input, check);
      card.appendChild(row);
    } else {
      const choices = document.createElement('div');
      choices.className = 'quiz-choices';
      for (const choice of q.choices ?? []) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'chip';
        btn.textContent = choice;
        btn.addEventListener('click', () => record(choice));
        choices.appendChild(btn);
      }
      card.appendChild(choices);
    }

    const hintBtn = document.createElement('button');
    hintBtn.type = 'button';
    hintBtn.className = 'quiz-hint-btn';
    hintBtn.textContent = t('assess.hint');
    const hintText = document.createElement('p');
    hintText.className = 'quiz-hint-text';
    hintText.hidden = true;
    hintBtn.addEventListener('click', () => {
      hintText.textContent = engine.useHint(q.id);
      hintText.hidden = false;
    });
    card.append(hintBtn, hintText, feedback);
    cardsEl.appendChild(card);
  });

  container.querySelector('.quiz-reset')!.addEventListener('click', () => {
    engine.reset();
    cardsEl.querySelectorAll<HTMLElement>('.quiz-feedback').forEach((el) => {
      el.textContent = '';
      el.className = 'quiz-feedback';
    });
    cardsEl.querySelectorAll<HTMLElement>('.quiz-hint-text').forEach((el) => {
      el.hidden = true;
    });
    updateSummary();
  });

  updateSummary();
}
