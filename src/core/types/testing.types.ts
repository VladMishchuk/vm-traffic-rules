import { DriverCategoryCode } from './category.types';
import { RoadSceneConfig } from './scene.types';

export interface OfficialQuestion {
  id: string;
  section: number | string;
  section_title: string;
  number: string;
  image_path: string | null;
  question: string;
  options: string[];
  answer_index: number;
  categories: DriverCategoryCode[];
  rule_ids: string[];
  explanation: string;
  sceneConfig?: RoadSceneConfig;
  isAiGenerated?: boolean;
}

export type TestMode =
  | 'diagnostic'
  | 'exam'
  | 'topic'
  | 'mistakes'
  | 'ai_adaptive'
  | 'prompt'
  | 'knowledge_check';

export interface ActiveTestConfig {
  id: string;
  mode: TestMode;
  title: string;
  subtitle?: string;
  targetCategory: DriverCategoryCode;
  questions: OfficialQuestion[];
  isStrictExam: boolean;
  timeLimitSeconds?: number; // 1200 (20 min) for official exam
}

export interface TestSessionRecord {
  id: string;
  mode: TestMode;
  title: string;
  category: DriverCategoryCode;
  score: number;
  totalQuestions: number;
  isPassed: boolean;
  durationSeconds: number;
  wrongQuestionIds: string[];
  completedAt: string;
}

export interface RuleMasteryRecord {
  itemId: string;
  section: string;
  recentAttempts: boolean[]; // sliding window of last 5 attempts
  masteryScore: number; // 0.0 to 1.0
  intervalDays: number;
  nextReviewAt: string;
  totalAttempts: number;
  correctAttempts: number;
}
