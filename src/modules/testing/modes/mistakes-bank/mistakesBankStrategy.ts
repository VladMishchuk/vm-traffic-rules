import { matchesCategories } from '@/lib/dataService';
import { TestModeStrategy } from '../testMode.interface';

export const mistakesBankStrategy: TestModeStrategy = {
  id: 'mistakes',
  metadata: {
    title: 'Робота над помилками',
    subtitle: 'Банк складних питань',
    badge: 'Банк складних питань',
    description:
      'Формує цільову вибірку з 20 питань, у яких ви раніше припустилися помилки або скористалися підказкою під час навчання.',
    details: [
      'Питання автоматично додаються до Банку помилок при неправильній відповіді.',
      'Після успішної правильної відповіді без підказки питання вилучається з активного списку помилок.',
    ],
  },
  rules: {
    isStrictExam: false,
    allowHints: true,
    immediateFeedback: true,
  },
  buildQuestions({
    questions,
    selectedCategories,
    wrongQuestionIds = [],
    count = 20,
  }) {
    const wrongSet = new Set(wrongQuestionIds);
    return questions
      .filter(
        (q) =>
          matchesCategories(q.categories, selectedCategories) &&
          wrongSet.has(q.id)
      )
      .slice(0, count);
  },
  createSessionConfig(context, resolvedQuestions) {
    return {
      id: `mistakes_${Date.now()}`,
      mode: 'mistakes',
      title: context.customTitle || this.metadata.title,
      subtitle:
        context.customSubtitle ||
        `Відпрацювання складних питань (${resolvedQuestions.length} завдань)`,
      targetCategory: context.targetCategory,
      questions: resolvedQuestions,
      isStrictExam: false,
    };
  },
};
