export type KnowledgeTab =
  | 'rules'
  | 'signs'
  | 'markings'
  | 'traffic_lights'
  | 'id_signs'
  | 'glossary';

export interface ArticleMeta {
  id: string;
  title: string;
  testSection: string;
}

export interface SignCategoryItem {
  id: number;
  name: string;
  count: number;
}
