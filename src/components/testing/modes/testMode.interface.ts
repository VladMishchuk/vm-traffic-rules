import {
  ActiveTestConfig,
  DriverCategoryCode,
  OfficialQuestion,
  RuleMasteryRecord,
  TestMode,
} from '@/core/types';

export interface SessionRules {
  readonly timeLimitSeconds?: number;
  readonly maxAllowedMistakes?: number;
  readonly isStrictExam: boolean;
  readonly allowHints: boolean;
  readonly immediateFeedback: boolean;
}

export interface BuildQuestionsContext {
  questions: OfficialQuestion[];
  targetCategory: DriverCategoryCode;
  selectedCategories: DriverCategoryCode[];
  masteryMap?: Record<string, RuleMasteryRecord>;
  wrongQuestionIds?: string[];
  selectedTopics?: string[];
  promptText?: string;
  customTitle?: string;
  customSubtitle?: string;
  count?: number;
}

export interface TestModeStrategy {
  readonly id: TestMode;
  readonly metadata: {
    title: string;
    subtitle: string;
    badge: string;
    description: string;
    details: string[];
  };
  readonly rules: SessionRules;

  /** Формує масив питань відповідно до правил конкретного режиму тестування */
  buildQuestions(
    context: BuildQuestionsContext
  ): Promise<OfficialQuestion[]> | OfficialQuestion[];

  /** Створює готову конфігурацію активної тестової сесії */
  createSessionConfig(
    context: BuildQuestionsContext,
    resolvedQuestions: OfficialQuestion[]
  ): ActiveTestConfig;
}
