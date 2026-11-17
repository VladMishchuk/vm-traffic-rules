import { httpsCallable } from 'firebase/functions';
import {
  DriverCategoryCode,
  OfficialQuestion,
  UserProfile,
} from '@/core/types';
import { functions, isFirebaseConfigured } from '@/lib/firebase';
import { saveUserProfileToFirestore } from '@/lib/firestoreService';
import { useAppStore } from '@/store/useAppStore';
import { resolveContextualRoadScene } from './sceneEnhancer';
import {
  buildGeminiSystemInstruction,
  buildGeminiUserPrompt,
} from '../prompts/testGenerationSchema';

export function getStoredGeminiApiKey(): string {
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim().length > 10) {
    return envKey.trim();
  }
  const user = useAppStore.getState().user;
  return user?.settings?.geminiApiKey || '';
}

export function setStoredGeminiApiKey(key: string): void {
  const state = useAppStore.getState();
  const updatedUser: UserProfile = {
    ...state.user,
    settings: {
      ...state.user.settings,
      geminiApiKey: key.trim(),
    },
  };
  useAppStore.setState({ user: updatedUser });
  if (state.isAuthenticated && updatedUser.uid) {
    saveUserProfileToFirestore(updatedUser, state.followedUserIds);
  }
}

/**
 * Calls Google Gemini API with Structured JSON Schema to synthesize
 * personalized ПДР questions + contextual `RoadSceneConfig` 2D vector scenes.
 * Throws an error if generation fails or no valid questions are returned.
 */
export async function generatePromptQuestionsWithAi(params: {
  prompt: string;
  selectedCategories: DriverCategoryCode[];
  allOfficialQuestions?: OfficialQuestion[];
  count?: number;
}): Promise<{
  questions: OfficialQuestion[];
  source: 'gemini_live';
}> {
  const { prompt, selectedCategories, count = 10 } = params;

  // 1. Try Firebase Cloud Function with backend GEMINI_API_KEY (safe in production)
  if (isFirebaseConfigured && functions) {
    try {
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
            source: 'gemini_live',
          };
        }
      }
    } catch {
      // Cloud Function call failed, proceed to client Gemini API key check
    }
  }

  // 2. Direct client-side Gemini API call if key is provided
  const apiKey = getStoredGeminiApiKey();

  if (apiKey) {
    const systemInstruction = buildGeminiSystemInstruction(
      selectedCategories,
      prompt,
      count
    );

    const userPromptText = buildGeminiUserPrompt(prompt, selectedCategories);

    let response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: userPromptText,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
      }
    );

    if (!response.ok && response.status === 404) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(
          apiKey
        )}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: userPromptText,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.4,
              responseMimeType: 'application/json',
            },
          }),
        }
      );
    }

    if (response.ok) {
      const data = await response.json();
      const rawText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const parsed = JSON.parse(rawText);
      const items: unknown[] = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.questions)
        ? parsed.questions
        : [];

      const validGenerated: OfficialQuestion[] = items
        .map((item: any, idx: number): OfficialQuestion | null => {
          if (!item?.question || !Array.isArray(item?.options)) return null;
          const contextualScene = resolveContextualRoadScene(item, idx);
          return {
            id: `gemini_${Date.now()}_${idx}`,
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
              'Згенеровано моделлю Gemini згідно з чинними ПДР України.',
            sceneConfig: contextualScene,
          };
        })
        .filter(
          (x: OfficialQuestion | null): x is OfficialQuestion => x !== null
        );

      if (validGenerated.length > 0) {
        return {
          questions: validGenerated,
          source: 'gemini_live',
        };
      }
    }
  }

  throw new Error('Не вдалося завантажити тест');
}
