import { RulesDatabase, RoadSign } from '@/core/types';
import { toStorageImageUrl } from '@/lib/dataService';

export function resolveSignImagePath(
  signCode: string,
  rules?: RulesDatabase | null
): { number: string; name: string; description: string; imagePath: string } {
  const cleanNum = signCode.replace(/^sign_/, '').replace(/_/g, '.');
  const underscored = cleanNum.replace(/\./g, '_');

  if (rules?.signs) {
    const found: RoadSign | undefined = rules.signs.find(
      (s) =>
        s.number === cleanNum ||
        s.id === signCode ||
        s.id === `sign_${underscored}`
    );
    if (found) {
      return {
        number: found.number,
        name: found.name,
        description: found.description,
        imagePath:
          toStorageImageUrl(found.image_path) ||
          toStorageImageUrl(`knowledge/signs/${underscored}.webp`) ||
          '',
      };
    }
  }

  const fallbackNames: Record<string, string> = {
    '2.1': 'Дати дорогу',
    '2.2': 'Проїзд без зупинки заборонено',
    '2.3': 'Головна дорога',
    '2.4': 'Кінець головної дороги',
    '4.1': 'Рух прямо',
    '4.2': 'Рух праворуч',
    '4.3': 'Рух ліворуч',
    '4.4': 'Рух прямо або праворуч',
    '4.5': 'Рух прямо або ліворуч',
    '4.10': 'Круговий рух',
    '5.35.1': 'Пішохідний перехід',
    '7.8': 'Напрямок головної дороги',
    '1.27': 'Залізничний переїзд із шлагбаумом',
    '1.28': 'Залізничний переїзд без шлагбаума',
    '3.1': 'Рух заборонено',
    '3.21': "В'їзд заборонено",
  };

  return {
    number: cleanNum,
    name: fallbackNames[cleanNum] || `Знак ${cleanNum}`,
    description: `Дорожній знак ${cleanNum} згідно з Додатком 1 до ПДР України.`,
    imagePath: toStorageImageUrl(`knowledge/signs/${underscored}.webp`) || '',
  };
}
