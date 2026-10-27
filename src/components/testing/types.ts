import { OfficialQuestion } from '@/core/types';

export interface AnsweredEntry {
  question: OfficialQuestion;
  selectedOption: number;
  isCorrect: boolean;
  usedHint: boolean;
}

export type ExamFailReason = 'mistakes' | 'timeout' | null;
