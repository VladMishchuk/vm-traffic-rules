import { DriverCategoryCode } from '../types/category.types';

export const APP_CONSTANTS = {
  EXAM_QUESTIONS_COUNT: 20,
  EXAM_TIME_LIMIT_SECONDS: 20 * 60, // 20 minutes
  EXAM_MAX_ALLOWED_MISTAKES: 2,
  EXAM_PASSING_MIN_SCORE: 18,
  SPARK_PLAN_BATCH_MAX_SIZE: 400,
} as const;

export const ALL_DRIVER_CATEGORIES: DriverCategoryCode[] = [
  'A1',
  'A',
  'B1',
  'B',
  'C1',
  'C',
  'D1',
  'D',
  'BE',
  'C1E',
  'CE',
  'D1E',
  'DE',
  'T',
];
