import { DriverCategoryCode, DriverCategoryInfo } from './category.types';

export interface RuleSubItem {
  letter: string;
  text: string;
}

export interface RuleItem {
  id: string;
  number: string;
  text: string;
  sub_items: RuleSubItem[];
  law_url: string;
  categories: DriverCategoryCode[];
}

export interface RuleSection {
  id: string;
  number: number;
  title: string;
  law_url: string;
  categories: DriverCategoryCode[];
  items: RuleItem[];
}

export interface GlossaryItem {
  id: string;
  term: string;
  definition: string;
  rule_ref: string;
  law_url: string;
}

export interface RoadSign {
  id: string;
  number: string;
  name: string;
  category_id: number;
  category_name: string;
  description: string;
  image_path: string | null;
  law_url: string;
}

export interface RoadMarking {
  id: string;
  number: string;
  name: string;
  type: string;
  category_name: string;
  color: string;
  description: string;
  image_path: string | null;
  law_url: string;
}

export interface TrafficLightItem {
  id: string;
  name: string;
  type: string;
  description: string;
  image_path: string | null;
  rule_ref: string;
  law_url: string;
}

export interface IdSignItem {
  id: string;
  letter: string;
  name: string;
  description: string;
  image_path: string | null;
  rule_ref: string;
  law_url: string;
}

export interface RulesDatabase {
  metadata: {
    title: string;
    law_name: string;
    law_url: string;
    parsed_at: string;
  };
  driver_categories: DriverCategoryInfo[];
  sections: RuleSection[];
  glossary: GlossaryItem[];
  signs: RoadSign[];
  markings: RoadMarking[];
  traffic_lights: TrafficLightItem[];
  id_signs: IdSignItem[];
}
