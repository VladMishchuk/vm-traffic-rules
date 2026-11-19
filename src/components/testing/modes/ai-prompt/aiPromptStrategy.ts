import { generatePromptQuestionsWithAi } from '@/lib/ai-generator';
import { TestModeStrategy } from '../testMode.interface';

export const aiPromptStrategy: TestModeStrategy = {
  id: 'prompt',
  metadata: {
    title: 'Тест із текстового запиту',
    subtitle: 'Інтерактивні 2D-сцени + цільові питання ПДР',
    badge: 'Генерація за вільним описом (Gemini AI + 2D)',
    description:
      'Вільно опишіть дорожню ситуацію, яку хочете потренувати (наприклад: «кругові перехрестя з трамваями» або «сигнали регулювальника вночі»), і ШІ сформує індивідуальний тест.',
    details: [
      'Генерує інтерактивні векторні 2D-сцени дорожніх ситуацій із траєкторіями та знаками.',
      'Добирає найбільш релевантні офіційні питання ПДР України за змістом вашого запиту.',
    ],
  },
  rules: {
    isStrictExam: false,
    allowHints: true,
    immediateFeedback: true,
  },
  async buildQuestions({ promptText = '', selectedCategories, count = 10 }) {
    const { questions } = await generatePromptQuestionsWithAi({
      prompt: promptText.trim(),
      selectedCategories,
      count,
    });
    return questions;
  },
  createSessionConfig(context, resolvedQuestions) {
    const cleanPrompt = (context.promptText || '').trim();
    return {
      id: `prompt_${Date.now()}`,
      mode: 'prompt',
      title:
        context.customTitle ||
        `ШІ Промпт-тест: «${cleanPrompt.slice(0, 42)}»`,
      subtitle: context.customSubtitle || this.metadata.subtitle,
      targetCategory: context.targetCategory,
      questions: resolvedQuestions,
      isStrictExam: false,
    };
  },
};
