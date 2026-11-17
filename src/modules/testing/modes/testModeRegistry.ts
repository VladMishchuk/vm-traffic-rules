import { ActiveTestConfig, TestMode } from '@/core/types';
import {
  BuildQuestionsContext,
  TestModeStrategy,
} from './testMode.interface';
import { officialExamStrategy } from './official-exam/officialExamStrategy';
import { adaptiveModeStrategy } from './adaptive/adaptiveModeStrategy';
import { topicPracticeStrategy } from './topic-practice/topicPracticeStrategy';
import { mistakesBankStrategy } from './mistakes-bank/mistakesBankStrategy';
import { aiPromptStrategy } from './ai-prompt/aiPromptStrategy';
import { diagnosticStrategy } from './diagnostic/diagnosticStrategy';
import { knowledgeCheckStrategy } from './knowledge-check/knowledgeCheckStrategy';

const STRATEGIES_MAP: Record<TestMode, TestModeStrategy> = {
  exam: officialExamStrategy,
  ai_adaptive: adaptiveModeStrategy,
  topic: topicPracticeStrategy,
  mistakes: mistakesBankStrategy,
  prompt: aiPromptStrategy,
  diagnostic: diagnosticStrategy,
  knowledge_check: knowledgeCheckStrategy,
};

/**
 * Реєстр стратегій тестування (Factory / Strategy Registry).
 * Дозволяє отримувати правила, метадані та будувати сесію для будь-якого TestMode
 * без розгалужених конструкцій if/switch у UI-компонентах.
 */
export const testModeRegistry = {
  getStrategy(mode: TestMode): TestModeStrategy {
    return STRATEGIES_MAP[mode] || topicPracticeStrategy;
  },

  getAllStrategies(): TestModeStrategy[] {
    return Object.values(STRATEGIES_MAP);
  },

  async buildSession(
    mode: TestMode,
    context: BuildQuestionsContext
  ): Promise<ActiveTestConfig> {
    const strategy = this.getStrategy(mode);
    const questions = await strategy.buildQuestions(context);
    return strategy.createSessionConfig(context, questions);
  },
};

export * from './testMode.interface';
export * from './official-exam/officialTicketGenerator';
export {
  officialExamStrategy,
  adaptiveModeStrategy,
  topicPracticeStrategy,
  mistakesBankStrategy,
  aiPromptStrategy,
  diagnosticStrategy,
  knowledgeCheckStrategy,
};
