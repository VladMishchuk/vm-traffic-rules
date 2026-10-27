import { httpsCallable } from 'firebase/functions';
import {
  DriverCategoryCode,
  OfficialQuestion,
  UserProfile,
} from '@/core/types';
import { matchesCategories } from '@/lib/dataService';
import { functions, isFirebaseConfigured } from '@/lib/firebase';
import { saveUserProfileToFirestore } from '@/lib/firestoreService';
import { useAppStore } from '@/store/useAppStore';
import { CURATED_AI_SCENARIOS } from '../mock/fallbackScenarios';
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
 * Falls back cleanly to curated dynamic scenarios + keyword-matched official questions
 * if no API key is configured or if the network call fails.
 */
export async function generatePromptQuestionsWithAi(params: {
  prompt: string;
  selectedCategories: DriverCategoryCode[];
  allOfficialQuestions: OfficialQuestion[];
  count?: number;
}): Promise<{
  questions: OfficialQuestion[];
  source: 'gemini_live' | 'hybrid_2d_engine';
}> {
  const { prompt, selectedCategories, allOfficialQuestions, count = 10 } = params;

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
          .filter((x: OfficialQuestion | null): x is OfficialQuestion => x !== null);

        if (validGenerated.length > 0) {
          return {
            questions: validGenerated,
            source: 'gemini_live',
          };
        }
      }
      // If status === 'fallback_client_engine', continue to hybrid 2D engine below
    } catch {
      // Cloud Function call skipped/failed, proceed to client fallback
    }
  }

  // 2. Direct client-side Gemini API call if key is provided
  const apiKey = getStoredGeminiApiKey();

  if (apiKey) {
    try {
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
          .filter((x: OfficialQuestion | null): x is OfficialQuestion => x !== null);

        if (validGenerated.length > 0) {
          return {
            questions: validGenerated,
            source: 'gemini_live',
          };
        }
      }
    } catch {
      // Fallback to hybrid 2D engine below
    }
  }

  // Hybrid 2D Engine: Match prompt keywords against CURATED_AI_SCENARIOS + official questions
  const keywords = prompt
    .toLowerCase()
    .split(/[\s,.;!?]+/)
    .filter((w) => w.length >= 3);

  const compatibleScenarios = CURATED_AI_SCENARIOS.filter((q) =>
    matchesCategories(q.categories, selectedCategories)
  );

  const matchedScenarios = compatibleScenarios.filter((q) => {
    const hay =
      `${q.question} ${q.section_title} ${q.explanation} ${q.rule_ids.join(' ')}`.toLowerCase();
    return keywords.some((kw) => hay.includes(kw));
  });

  const chosen2dScenarios =
    matchedScenarios.length >= 2
      ? matchedScenarios.slice(0, 5)
      : compatibleScenarios.slice(0, 4);

  const catOfficial = allOfficialQuestions.filter((q) =>
    matchesCategories(q.categories, selectedCategories)
  );
  const matchedOfficial = catOfficial.filter((q) => {
    const hay =
      `${q.question} ${q.section_title} ${q.explanation}`.toLowerCase();
    return keywords.some((kw) => hay.includes(kw));
  });

  const officialPool =
    matchedOfficial.length >= 4 ? matchedOfficial : catOfficial;
  const neededOfficial = Math.max(0, count - chosen2dScenarios.length);
  const sampledOfficial = [...officialPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, neededOfficial);

  return {
    questions: [...chosen2dScenarios, ...sampledOfficial],
    source: 'hybrid_2d_engine',
  };
}
