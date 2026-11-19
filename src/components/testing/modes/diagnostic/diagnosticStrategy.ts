import { TestModeStrategy } from '../testMode.interface';
import { generateOfficialExamTicket } from '../official-exam/officialTicketGenerator';

export const diagnosticStrategy: TestModeStrategy = {
  id: 'diagnostic',
  metadata: {
    title: 'Діагностичний тест ПДР',
    subtitle:
      'Калібрування початкового профілю знань для розблокування адаптивного тесту',
    badge: 'Калібрування профілю знань',
    description:
      'Стартовий тест на 20 питань для визначення вашого початкового рівня знань ПДР та розблокування персональних адаптивних рекомендацій.',
    details: [
      'Охоплює ключові розділи ПДР, безпеки руху та домедичної допомоги.',
      'Без жорсткого таймера — дозволяє спокійно оцінити початковий рівень.',
    ],
  },
  rules: {
    isStrictExam: false,
    allowHints: true,
    immediateFeedback: true,
  },
  buildQuestions({ questions, targetCategory }) {
    return generateOfficialExamTicket(questions, targetCategory);
  },
  createSessionConfig(context, resolvedQuestions) {
    return {
      id: `diag_${Date.now()}`,
      mode: 'diagnostic',
      title: context.customTitle || this.metadata.title,
      subtitle: context.customSubtitle || this.metadata.subtitle,
      targetCategory: context.targetCategory,
      questions: resolvedQuestions,
      isStrictExam: false,
    };
  },
};
