import { DriverCategoryCode, OfficialQuestion } from '@/core/types';
import {
  loadQuestions,
  matchesCategories,
  getAvailableSectionsForCategories,
  ExamSectionSummary,
} from '@/lib/dataService';

export const questionsRepository = {
  getAllQuestions(): Promise<OfficialQuestion[]> {
    return loadQuestions();
  },

  async getByCategories(
    categories: DriverCategoryCode[]
  ): Promise<OfficialQuestion[]> {
    const all = await loadQuestions();
    return all.filter((q) => matchesCategories(q.categories, categories));
  },

  async getByIds(ids: string[]): Promise<OfficialQuestion[]> {
    const idSet = new Set(ids);
    const all = await loadQuestions();
    return all.filter((q) => idSet.has(q.id));
  },

  getAvailableSections(
    questions: OfficialQuestion[],
    categories: DriverCategoryCode[]
  ): ExamSectionSummary[] {
    return getAvailableSectionsForCategories(questions, categories);
  },
};
