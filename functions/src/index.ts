import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/** Вагові коефіцієнти для останніх 5 спроб (новіші спроби мають більшу вагу) */
const WEIGHTS = [0.1, 0.15, 0.2, 0.25, 0.3];

/** Основна та резервна моделі Gemini для генерації тестів */
const PRIMARY_GEMINI_MODEL = 'gemini-3.8-flash';
const FALLBACK_GEMINI_MODEL = 'gemini-flash-latest';

interface RuleResultInput {
  ruleId: string;
  section?: string | number;
  isCorrect: boolean;
}

interface ValidatedPromptRequest {
  prompt: string;
  categories: string[];
  questionCount: number;
}

/**
 * Обчислює зважений рівень засвоєння правила (від 0 до 1)
 * на основі ковзного вікна з останніх 5 відповідей користувача.
 */
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
 * Оновлює агреговану статистику профілю користувача після завершення тесту:
 * інкрементує лічильник пройдених тестів, оновлює дату активності та додає ID помилкових питань.
 */
async function updateUserStatsOnSessionComplete(
  userRef: admin.firestore.DocumentReference,
  wrongIds: string[]
): Promise<void> {
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
}

/**
 * Пакетно оновлює записи засвоєння правил ПДР (`rule_mastery`) у профілі користувача
 * та розраховує наступну дату інтервального повторення.
 */
async function updateRuleMasteryBatch(
  userRef: admin.firestore.DocumentReference,
  ruleResults: RuleResultInput[]
): Promise<void> {
  const batch = db.batch();

  for (const item of ruleResults) {
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

/**
 * Тригер Firestore, який спрацьовує при створенні документа завершеної тестової сесії
 * (`users/{uid}/test_sessions/{sessionId}`).
 * Оновлює загальну статистику користувача та перераховує інтервальне повторення правил.
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

    await updateUserStatsOnSessionComplete(userRef, wrongIds);

    if (Array.isArray(session.ruleResults)) {
      await updateRuleMasteryBatch(userRef, session.ruleResults);
    }
  }
);

// ============================================================================
// Допоміжні методи для генерації тесту за текстовим запитом (generatePromptTest)
// ============================================================================

/**
 * Перевіряє вхідні дані запиту від клієнта та нормалізує параметри генерації.
 * Викидає `HttpsError`, якщо текстовий запит порожній або некоректний.
 */
function validatePromptRequest(rawData: any): ValidatedPromptRequest {
  const { prompt, categories = ['B'], count = 6 } = rawData || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    throw new HttpsError(
      'invalid-argument',
      'Вкажіть текстовий запит для генерації тесту.'
    );
  }

  const normalizedCategories =
    Array.isArray(categories) && categories.length > 0
      ? categories.map(String)
      : ['B'];

  const questionCount = Math.min(Math.max(Number(count) || 6, 1), 10);

  return {
    prompt: prompt.trim(),
    categories: normalizedCategories,
    questionCount,
  };
}

/**
 * Зчитує та очищує серверний ключ `GEMINI_API_KEY` зі змінних середовища.
 * Викидає помилку, якщо ключ не налаштований або закороткий.
 */
function getSanitizedGeminiApiKey(): string {
  const rawKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, '');

  if (!apiKey || apiKey.length < 10) {
    throw new HttpsError(
      'failed-precondition',
      'Серверний ключ GEMINI_API_KEY не налаштовано.'
    );
  }

  return apiKey;
}

/**
 * Формує системну інструкцію для моделі Gemini в ролі методиста ГСЦ МВС України
 * з урахуванням обраних категорій водія та вимог до генерації 2D-схем (`sceneConfig`).
 */
function buildMethodistSystemInstruction(
  prompt: string,
  categories: string[],
  questionCount: number
): string {
  const categoriesList = categories.join(', ');

  return `Ти — офіційний методист Головного сервісного центру МВС України з ПДР.
Згенеруй ${questionCount} тестових питань українською мовою за запитом: "${prompt}".
Враховуй обрані категорії водія: ${categoriesList}.
Питання мають суворо відповідати чинним ПДР України (Постанова КМУ №1306).

ОБМЕЖЕННЯ ЗА КАТЕГОРІЯМИ ВОДІЯ:
Користувач навчається ТІЛЬКИ на такі категорії: ${categoriesList}.
УСІ згенеровані питання та варіанти відповідей повинні стосуватися ВИКЛЮЧНО зазначених категорій (${categoriesList}).
Якщо у списку вказано тільки категорію B (легкові автомобілі) або A (мотоцикли), КАТЕГОРИЧНО ЗАБОРОНЕНО генерувати специфічні правила для великовагових вантажівок (C, C1), автопоїздів з причепами (CE, C1E, ТЗ понад 12-22м) чи пасажирських автобусів (D)!
Якщо тема запиту стосується габаритного транспорту чи переїздів, формулюй запитання тільки з точки зору водія вказаної категорії (${categoriesList}), наприклад: дистанція до вантажівки попереду, безпечний роз'їзд, порядок проїзду переїзду легковим автомобілем.

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
}

/**
 * Виконує HTTP POST-запит до вказаної моделі Google Gemini REST API.
 */
async function callGeminiModel(
  modelName: string,
  apiKey: string,
  systemInstruction: string,
  prompt: string
): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(
    apiKey
  )}`;

  return fetch(url, {
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
  });
}

/**
 * Надсилає запит до основної моделі Gemini (`gemini-3.8-flash`),
 * а якщо модель недоступна (`404`), автоматично повторює запит до `gemini-flash-latest`.
 */
async function fetchGeminiWithModelFallback(
  apiKey: string,
  systemInstruction: string,
  prompt: string
): Promise<any> {
  let response = await callGeminiModel(
    PRIMARY_GEMINI_MODEL,
    apiKey,
    systemInstruction,
    prompt
  );

  if (!response.ok && response.status === 404) {
    response = await callGeminiModel(
      FALLBACK_GEMINI_MODEL,
      apiKey,
      systemInstruction,
      prompt
    );
  }

  if (!response.ok) {
    console.warn(`[Gemini API] Помилковий статус відповіді: ${response.status}`);
    throw new HttpsError(
      'unavailable',
      `Модель Gemini повернула помилку (статус ${response.status}).`
    );
  }

  return response.json();
}

/**
 * Розбирає сиру відповідь від Gemini API та повертає валідований масив згенерованих питань.
 */
function parseGeminiQuestionsResponse(responseData: any): unknown[] {
  const rawText =
    responseData?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
  const parsed = JSON.parse(rawText);

  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (Array.isArray(parsed?.questions)) {
    return parsed.questions;
  }
  return [];
}

/**
 * Хмарна функція (Callable Cloud Function) для генерації індивідуального тесту ПДР
 * з векторними 2D-сценами (`RoadSceneConfig`) за вільним текстовим запитом користувача.
 */
export const generatePromptTest = onCall(
  { secrets: ['GEMINI_API_KEY'], cors: true },
  async (request) => {
    const { prompt, categories, questionCount } = validatePromptRequest(
      request.data
    );
    const apiKey = getSanitizedGeminiApiKey();
    const systemInstruction = buildMethodistSystemInstruction(
      prompt,
      categories,
      questionCount
    );

    try {
      const responseData = await fetchGeminiWithModelFallback(
        apiKey,
        systemInstruction,
        prompt
      );
      const questionsList = parseGeminiQuestionsResponse(responseData);

      if (questionsList.length === 0) {
        throw new HttpsError(
          'internal',
          'Модель згенерувала порожній список питань.'
        );
      }

      return {
        status: 'ready',
        prompt,
        categories,
        questions: questionsList,
      };
    } catch (err: any) {
      console.warn(
        '[generatePromptTest] Помилка під час генерації в Gemini:',
        err?.message || err
      );
      if (err instanceof HttpsError) {
        throw err;
      }
      throw new HttpsError('internal', 'Не вдалося згенерувати тест.');
    }
  }
);
