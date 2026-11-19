import { RulesDatabase } from '@/core/types';
import { ArticleMeta, KnowledgeTab, SignCategoryItem } from '../types';

export function resolveArticleMeta(
  rules: RulesDatabase | undefined,
  activeTab: KnowledgeTab,
  selectedSectionNum: number,
  selectedSignCategory: number
): ArticleMeta {
  if (!rules) return { id: 'sec_1', title: 'Розділ 1 ПДР', testSection: '1' };

  if (activeTab === 'rules') {
    const sec =
      rules.sections.find((s) => s.number === selectedSectionNum) ||
      rules.sections[0];
    return {
      id: sec.id,
      title: `Розділ ${sec.number}. ${sec.title}`,
      testSection: String(sec.number),
    };
  }

  if (activeTab === 'signs') {
    const signCat = rules.signs.find(
      (s) => s.category_id === selectedSignCategory
    );
    return {
      id: `signs_cat_${selectedSignCategory}`,
      title: `Дорожні знаки: ${signCat?.category_name || 'Група ' + selectedSignCategory}`,
      testSection: '33',
    };
  }

  if (activeTab === 'markings') {
    return {
      id: 'markings_all',
      title: 'Дорожня розмітка (Розділ 34 ПДР)',
      testSection: '34',
    };
  }

  if (activeTab === 'traffic_lights') {
    return {
      id: 'traffic_lights_all',
      title: 'Світлофори та сигнали регулювання (Розділ 8 ПДР)',
      testSection: '8.1',
    };
  }

  if (activeTab === 'id_signs') {
    return {
      id: 'id_signs_all',
      title: 'Розпізнавальні знаки ТЗ (Розділ 30 ПДР)',
      testSection: '30',
    };
  }

  if (activeTab === 'glossary') {
    return {
      id: 'glossary_all',
      title: 'Терміни та поняття ПДР (п. 1.10)',
      testSection: '1',
    };
  }

  return {
    id: 'driver_categories_all',
    title: 'Категорії транспортних засобів (п. 2.13)',
    testSection: '2',
  };
}

export function buildSignCategories(
  rules: RulesDatabase | undefined
): SignCategoryItem[] {
  if (!rules) return [];
  const map = new Map<number, SignCategoryItem>();
  for (const s of rules.signs) {
    const existing = map.get(s.category_id);
    if (existing) existing.count += 1;
    else
      map.set(s.category_id, {
        id: s.category_id,
        name: s.category_name,
        count: 1,
      });
  }
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
}
