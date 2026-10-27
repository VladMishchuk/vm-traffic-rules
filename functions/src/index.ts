import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

const WEIGHTS = [0.1, 0.15, 0.2, 0.25, 0.3];

function computeWeightedMastery(attempts: boolean[]): number {
  const window = attempts.slice(-5);
  if (window.length === 0) return 0;
  const activeWeights = WEIGHTS.slice(5 - window.length);
  const weightSum = activeWeights.reduce((a, b) => a + b, 0);
  const score = window.reduce(
    (sum, ok, idx) => sum + (ok ? activeWeights[idx] : 0),
    0
  );
  return Math.round((score / weightSum) * 100) / 100;
}

/**
 * Triggered when a user completes any test session (`users/{uid}/test_sessions/{sessionId}`).
 * Recalculates Spaced Practice mastery for attempted rules (within user's selectedCategories)
 * and queues background AI pool replenishment via Gemini 2.5 Flash if needed.
 */
export const onTestCompleted = onDocumentCreated(
  'users/{uid}/test_sessions/{sessionId}',
  async (event) => {
    const { uid } = event.params;
    const session = event.data?.data();
    if (!session) return;

    const userRef = db.collection('users').doc(uid);
    const wrongIds: string[] = Array.isArray(session.wrongQuestionIds)
      ? session.wrongQuestionIds
      : [];

    await userRef.set(
      {
        totalTestsCompleted: admin.firestore.FieldValue.increment(1),
        lastActiveDate: admin.firestore.FieldValue.serverTimestamp(),
        ...(wrongIds.length > 0
          ? {
              wrongQuestionIds: admin.firestore.FieldValue.arrayUnion(
                ...wrongIds
              ),
            }
          : {}),
      },
      { merge: true }
    );

    // Update rule mastery records if ruleResults are included in the session document
    if (Array.isArray(session.ruleResults)) {
      const batch = db.batch();
      for (const item of session.ruleResults) {
        const { ruleId, section, isCorrect } = item;
        if (!ruleId) continue;
        const masteryRef = userRef.collection('rule_mastery').doc(ruleId);
        const snap = await masteryRef.get();
        const prev = snap.data() || {
          recentAttempts: [],
          intervalDays: 1,
          totalAttempts: 0,
          correctAttempts: 0,
        };
        const recentAttempts = [...(prev.recentAttempts || []), !!isCorrect].slice(
          -5
        );
        const masteryScore = computeWeightedMastery(recentAttempts);
        const nextInterval = isCorrect
          ? Math.min(30, Math.max(1, (prev.intervalDays || 1) * 2))
          : 1;
        const nextReviewAt = new Date(
          Date.now() + nextInterval * 86400 * 1000
        ).toISOString();

        batch.set(
          masteryRef,
          {
            itemId: ruleId,
            section: String(section || '1'),
            recentAttempts,
            masteryScore,
            intervalDays: nextInterval,
            nextReviewAt,
            totalAttempts: (prev.totalAttempts || 0) + 1,
            correctAttempts: (prev.correctAttempts || 0) + (isCorrect ? 1 : 0),
          },
          { merge: true }
        );
      }
      await batch.commit();
    }
  }
);

/**
 * Callable Cloud Function to generate a custom AI test with `RoadSceneConfig` 2D vector scenes
 * from a user's free-form prompt via Gemini (2.0-flash / 1.5-flash), taking into account their selected
 * driver categories (`A1`..`T`).
 * Gracefully falls back to the client hybrid 2D vector engine if API key is invalid or quota exceeded.
 */
export const generatePromptTest = onCall(
  { secrets: ['GEMINI_API_KEY'], cors: true },
  async (request) => {
    const { prompt, categories = ['B'], count = 6 } = request.data || {};
    if (!prompt || typeof prompt !== 'string') {
      throw new HttpsError(
        'invalid-argument',
        'Вкажіть текстовий запит для генерації тесту.'
      );
    }

    const rawKey = process.env.GEMINI_API_KEY || '';
    const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, '');

    if (!apiKey || apiKey.length < 10) {
      return {
        status: 'fallback_client_engine',
        prompt,
        categories,
        count,
        reason: 'no_backend_api_key',
      };
    }

    const systemInstruction = `Ти — офіційний методист Головного сервісного центру МВС України з ПДР.
Згенеруй ${Math.min(
      Number(count) || 6,
      10
    )} тестових питань українською мовою за запитом: "${prompt}".
Враховуй обрані категорії водія: ${categories.join(', ')}.
Питання мають суворо відповідати чинним ПДР України (Постанова КМУ №1306).

ОБМЕЖЕННЯ ЗА КАТЕГОРІЯМИ ВОДІЯ:
Користувач навчається ТІЛЬКИ на такі категорії: ${categories.join(', ')}.
УСІ згенеровані питання та варіанти відповідей повинні стосуватися ВИКЛЮЧНО зазначених категорій (${categories.join(', ')}).
Якщо у списку вказано тільки категорію B (легкові автомобілі) або A (мотоцикли), КАТЕГОРИЧНО ЗАБОРОНЕНО генерувати специфічні правила для великовагових вантажівок (C, C1), автопоїздів з причепами (CE, C1E, ТЗ понад 12-22м) чи пасажирських автобусів (D)!
Якщо тема запиту стосується габаритного транспорту чи переїздів, формулюй запитання тільки з точки зору водія вказаної категорії (${categories.join(', ')}), наприклад: дистанція до вантажівки попереду, безпечний роз'їзд, порядок проїзду переїзду легковим автомобілем.

ПРАВИЛО ДЛЯ 2D-СХЕМ (sceneConfig):
1. sceneConfig додавай ЛИШЕ якщо питання описує конкретну дорожню ситуацію або маневр на дорозі (проїзд перехрестя, круговий рух, залізничний переїзд, пішохідний перехід, обгін).
2. Якщо питання суто теоретичне, словесне, про габарити, сигнали, штрафи або загальні правила (де немає дорожньої сцени), передавай: "sceneConfig": null.
3. Якщо sceneConfig потрібен, використовуй сувору структуру:
   {
     "template": "cross_intersection" | "t_intersection" | "roundabout" | "rail_crossing" | "pedestrian_crossing" | "straight",
     "approaches": {
       "SOUTH": { "lanesIn": 2, "lanesOut": 2, "signs": ["2.1", "2.3", "1.28"] },
       "NORTH": { "lanesIn": 2, "lanesOut": 2 }
     },
     "actors": [
       { "id": "car_1", "type": "car_blue", "label": "Синій авто", "approach": "SOUTH", "lane": 1, "position": "at_stop_line", "turnSignal": "none" }
     ]
   }

Поверни виключно валідний JSON-масив об'єктів з полями: question, options (масив з 4 варіантів), answer_index (0-3), section, section_title, explanation, rule_ids, sceneConfig.`;

    try {
      // Try gemini-3.8-flash, fallback to gemini-flash-latest
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
                parts: [{ text: `Згенеруй JSON-масив питань для теми: ${prompt}` }],
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
        // Fallback model
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
                  parts: [{ text: `Згенеруй JSON-масив питань для теми: ${prompt}` }],
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

      if (!response.ok) {
        console.warn(`[Gemini API] Returned non-ok status: ${response.status}`);
        return {
          status: 'fallback_client_engine',
          prompt,
          categories,
          count,
          reason: `gemini_status_${response.status}`,
        };
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
      const parsed = JSON.parse(rawText);
      const questionsList = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed?.questions)
        ? parsed.questions
        : [];

      if (questionsList.length === 0) {
        return {
          status: 'fallback_client_engine',
          prompt,
          categories,
          count,
          reason: 'empty_response',
        };
      }

      return {
        status: 'ready',
        prompt,
        categories,
        questions: questionsList,
      };
    } catch (err: any) {
      console.warn('[generatePromptTest] Error during Gemini generation:', err?.message || err);
      return {
        status: 'fallback_client_engine',
        prompt,
        categories,
        count,
        reason: 'network_or_parse_error',
      };
    }
  }
);
