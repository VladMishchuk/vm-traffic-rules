import { buildAdaptiveSpacedSession } from '@/components/analytics';
import { TestModeStrategy } from '../testMode.interface';

export const adaptiveModeStrategy: TestModeStrategy = {
  id: 'ai_adaptive',
  metadata: {
    title: 'Адаптивний тест',
    subtitle: '70% слабкі теми + 30% інтервальне повторення',
    badge: '70% слабкі теми + 30% інтервальне повторення',
    description:
      'Інтелектуальний адаптивний режим, що будує персональну сесію на основі останніх 5 спроб по кожному пункту ПДР та кривої забування Еббінгауза.',
    details: [
      '70% питань підбираються з ваших найслабших правил і прострочених інтервалів повторення.',
      '30% питань — контрольна перевірка вже вивчених тем для закріплення у довготривалій пам’яті.',
      'Включає інтерактивні динамічні 2D-сцени перехресть зі зміненими умовами пріоритету.',
    ],
  },
  rules: {
    isStrictExam: false,
    allowHints: true,
    immediateFeedback: true,
  },
  buildQuestions({
    questions,
    masteryMap = {},
    wrongQuestionIds = [],
    selectedCategories,
    count = 20,
  }) {
    return buildAdaptiveSpacedSession(
      questions,
      masteryMap,
      wrongQuestionIds,
      selectedCategories,
      count
    );
  },
  createSessionConfig(context, resolvedQuestions) {
    return {
      id: `ai_${Date.now()}`,
      mode: 'ai_adaptive',
      title: context.customTitle || this.metadata.title,
      subtitle: context.customSubtitle || this.metadata.subtitle,
      targetCategory: context.targetCategory,
      questions: resolvedQuestions,
      isStrictExam: false,
    };
  },
};
