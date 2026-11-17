import { TestModeStrategy } from '../testMode.interface';
import { generateOfficialExamTicket } from './officialTicketGenerator';

export const officialExamStrategy: TestModeStrategy = {
  id: 'exam',
  metadata: {
    title: 'Іспит як у СЦ МВС',
    subtitle: '20 питань • 20 хвилин • Максимум 2 помилки',
    badge: '20 питань • 20 хвилин • до 2 помилок',
    description:
      'Повна симуляція реального теоретичного іспиту в Головному сервісному центрі МВС України. Білет формується за офіційною пропорцією: 10 питань з ПДР, 4 з безпеки руху, 4 з будови ТЗ та основ права, 2 з домедичної допомоги.',
    details: [
      'Жорсткий таймер 20 хвилин (червона індикація на останній хвилині).',
      'Допускається максимум 2 помилки; на 3-й помилці іспит достроково припиняється.',
      'Підказки та пояснення під час іспиту вимкнені — повний розбір доступний після завершення.',
    ],
  },
  rules: {
    timeLimitSeconds: 1200,
    maxAllowedMistakes: 2,
    isStrictExam: true,
    allowHints: false,
    immediateFeedback: false,
  },
  buildQuestions({ questions, targetCategory }) {
    return generateOfficialExamTicket(questions, targetCategory);
  },
  createSessionConfig(context, resolvedQuestions) {
    return {
      id: `exam_${Date.now()}`,
      mode: 'exam',
      title: context.customTitle || this.metadata.title,
      subtitle: context.customSubtitle || this.metadata.subtitle,
      targetCategory: context.targetCategory,
      questions: resolvedQuestions,
      isStrictExam: true,
      timeLimitSeconds: 1200,
    };
  },
};
