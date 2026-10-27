import { DriverCategoryCode } from '@/core/types';

export function buildGeminiSystemInstruction(
  selectedCategories: DriverCategoryCode[],
  prompt: string,
  count: number
): string {
  return `Ти — офіційний методист Головного сервісного центру МВС України з ПДР.
Згенеруй ${Math.min(count, 6)} тестових питань українською мовою за запитом користувача: "${prompt}".
Враховуй обрані категорії водія: ${selectedCategories.join(', ')}.
Питання мають суворо відповідати чинним ПДР України (Постанова КМУ №1306).
УСІ питання повинні стосуватися виключно зазначених категорій водія (${selectedCategories.join(', ')}). Не генеруй специфічних правил для вантажівок C/CE чи автобусів D, якщо обрано лише категорію B!
Додавай sceneConfig тільки якщо питання описує конкретну дорожню ситуацію або маневр на перехресті/переїзді, для решти став null.`;
}

export function buildGeminiUserPrompt(
  prompt: string,
  selectedCategories: DriverCategoryCode[]
): string {
  return `Створи тестові питання для теми: "${prompt}" (категорії: ${selectedCategories.join(
    ', '
  )}). Поверни JSON-масив об'єктів.`;
}
