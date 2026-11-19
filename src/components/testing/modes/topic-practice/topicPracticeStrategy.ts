import { matchesCategories } from '@/lib/dataService';
import { shuffleArray } from '@/core/utils/shuffle';
import { TestModeStrategy } from '../testMode.interface';

export const topicPracticeStrategy: TestModeStrategy = {
  id: 'topic',
  metadata: {
    title: 'Тест за обраними темами',
    subtitle: 'Цільове тренування розділів ПДР',
    badge: 'Цільове тренування розділів ПДР',
    description:
      'Дозволяє обрати один або декілька конкретних тематичних розділів ПДР України для поглибленого відпрацювання без обмеження за часом.',
    details: [
      'Миттєва перевірка відповіді з офіційним обґрунтуванням та посиланням на пункт ПДР.',
      'Можливість скористатися підказкою або переглянути картку дорожнього знака прямо в тесті.',
      'Результати кожної відповіді оновлюють ваш рівень засвоєння теми в Аналітиці.',
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
    selectedTopics = [],
    count = 20,
  }) {
    if (selectedTopics.length === 0) return [];
    const pool = questions.filter(
      (q) =>
        matchesCategories(q.categories, selectedCategories) &&
        selectedTopics.includes(String(q.section))
    );
    return shuffleArray(pool).slice(0, count);
  },
  createSessionConfig(context, resolvedQuestions) {
    return {
      id: `topic_${Date.now()}`,
      mode: 'topic',
      title: context.customTitle || this.metadata.title,
      subtitle:
        context.customSubtitle ||
        `Обрано розділів: ${context.selectedTopics?.length ?? 1}`,
      targetCategory: context.targetCategory,
      questions: resolvedQuestions,
      isStrictExam: false,
    };
  },
};
