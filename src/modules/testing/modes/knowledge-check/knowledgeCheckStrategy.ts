import { matchesCategories } from '@/lib/dataService';
import { shuffleArray } from '@/core/utils/shuffle';
import { TestModeStrategy } from '../testMode.interface';

export const knowledgeCheckStrategy: TestModeStrategy = {
  id: 'knowledge_check',
  metadata: {
    title: 'Закріплення знань',
    subtitle: 'Експрес-перевірка прочитаного матеріалу',
    badge: '8 питань до розділу Бази знань',
    description:
      'Короткий контрольний тест для закріплення щойно прочитаного розділу ПДР, групи дорожніх знаків або ліній розмітки.',
    details: [
      '8 цільових питань за темою прочитаного розділу.',
      'Миттєвий зворотний зв’язок і оновлення прогресу засвоєння правил.',
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
    count = 8,
  }) {
    const catQuestions = questions.filter((q) =>
      matchesCategories(q.categories, selectedCategories)
    );
    if (selectedTopics.length === 0) {
      return shuffleArray(catQuestions).slice(0, count);
    }
    const targetSec = selectedTopics[0];
    const pool = catQuestions.filter((q) => {
      const qSec = String(q.section);
      if (targetSec === '8') return qSec === '8.1' || qSec === '8.2';
      if (targetSec === '16') return qSec === '16.1' || qSec === '16.2';
      return (
        selectedTopics.includes(qSec) || qSec.startsWith(`${targetSec}.`)
      );
    });
    return shuffleArray(pool).slice(0, count);
  },
  createSessionConfig(context, resolvedQuestions) {
    return {
      id: `kb_practice_${Date.now()}`,
      mode: 'knowledge_check',
      title: context.customTitle || this.metadata.title,
      subtitle:
        context.customSubtitle ||
        `${resolvedQuestions.length} питань за щойно прочитаним матеріалом`,
      targetCategory: context.targetCategory,
      questions: resolvedQuestions,
      isStrictExam: false,
    };
  },
};
