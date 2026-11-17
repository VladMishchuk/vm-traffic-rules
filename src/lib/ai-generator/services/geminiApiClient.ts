import { httpsCallable } from 'firebase/functions';
import { DriverCategoryCode, OfficialQuestion } from '@/core/types';
import { functions, isFirebaseConfigured } from '@/lib/firebase';
import { resolveContextualRoadScene } from './sceneEnhancer';

/**
 * Calls Firebase Cloud Function (`generatePromptTest`) to synthesize
 * personalized ПДР questions + contextual `RoadSceneConfig` 2D vector scenes via backend Gemini API.
 * Throws an error if generation fails or no valid questions are returned.
 */
export async function generatePromptQuestionsWithAi(params: {
  prompt: string;
  selectedCategories: DriverCategoryCode[];
  count?: number;
}): Promise<{
  questions: OfficialQuestion[];
}> {
  const { prompt, selectedCategories, count = 10 } = params;

  if (isFirebaseConfigured && functions) {
    const generateFn = httpsCallable(functions, 'generatePromptTest');
    const cloudRes = await generateFn({
      prompt,
      categories: selectedCategories,
      count: Math.min(count, 10),
    });
    const data: any = cloudRes.data;
    if (data && data.status === 'ready' && Array.isArray(data.questions)) {
      const validGenerated: OfficialQuestion[] = data.questions
        .map((item: any, idx: number): OfficialQuestion | null => {
          if (!item?.question || !Array.isArray(item?.options)) return null;
          const contextualScene = resolveContextualRoadScene(item, idx);
          return {
            id: `cf_gemini_${Date.now()}_${idx}`,
            section: item.section || '16.2',
            section_title:
              item.section_title || `ШІ-моделювання: ${prompt.slice(0, 40)}`,
            number: `AI-${idx + 1}`,
            image_path: null,
            isAiGenerated: true,
            question: String(item.question),
            options: item.options.slice(0, 4).map(String),
            answer_index: Number(item.answer_index) || 0,
            categories: selectedCategories,
            rule_ids: Array.isArray(item.rule_ids)
              ? item.rule_ids.map(String)
              : ['16.12'],
            explanation:
              item.explanation ||
              'Згенеровано моделлю Gemini через Firebase Cloud Functions.',
            sceneConfig: contextualScene,
          };
        })
        .filter(
          (x: OfficialQuestion | null): x is OfficialQuestion => x !== null
        );

      if (validGenerated.length > 0) {
        return {
          questions: validGenerated,
        };
      }
    }
  }

  throw new Error('Не вдалося завантажити тест');
}
