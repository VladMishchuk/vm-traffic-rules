import { StateCreator } from 'zustand';
import {
  ActiveTestConfig,
  DriverCategoryCode,
  RuleMasteryRecord,
  TestMode,
  TestSessionRecord,
  UserProfile,
} from '@/core/types';
import { calculateStreak } from '@/core/utils/dateUtils';
import {
  saveTestSessionToFirestore,
  saveUserProfileToFirestore,
  batchSaveRuleMasteryToFirestore,
  saveRuleMasteryToFirestore,
} from '@/lib/firestoreService';
import { computeSpacedMastery } from '@/modules/adaptive-learning';
import { AppState, TestingSlice } from './types';

export { computeSpacedMastery };

export const createTestingSlice: StateCreator<AppState, [], [], TestingSlice> = (
  set
) => ({
  activeTest: null,
  testHistory: [],
  masteryMap: {},

  startTestSession: (config) => set({ activeTest: config }),

  clearActiveTest: () => set({ activeTest: null }),

  recordAttempt: (itemId, section, isCorrect, questionId) =>
    set((state) => {
      const updated = computeSpacedMastery(
        state.masteryMap[itemId],
        itemId,
        section,
        isCorrect
      );
      const nextWrong = new Set(state.user.wrongQuestionIds);
      if (questionId) {
        if (!isCorrect) nextWrong.add(questionId);
        else nextWrong.delete(questionId);
      }
      const nextMasteryMap = {
        ...state.masteryMap,
        [itemId]: updated,
      };
      const allRecords = Object.values(nextMasteryMap);
      const nextBadges = [...state.user.unlockedBadges];
      if (isCorrect && !nextBadges.includes('topic_bronze')) {
        nextBadges.push('topic_bronze');
      }
      if (
        allRecords.filter((r) => r.masteryScore >= 0.5).length >= 5 &&
        !nextBadges.includes('topic_silver')
      ) {
        nextBadges.push('topic_silver');
      }
      if (
        allRecords.filter((r) => r.masteryScore >= 0.85 && r.totalAttempts >= 3).length >= 5 &&
        !nextBadges.includes('topic_gold')
      ) {
        nextBadges.push('topic_gold');
      }

      const streakResult = calculateStreak(
        state.user.lastActiveDate,
        state.user.streakDays
      );
      if (streakResult.streakDays >= 7 && !nextBadges.includes('streak_7')) {
        nextBadges.push('streak_7');
      }

      const updatedUser: UserProfile = {
        ...state.user,
        streakDays: streakResult.streakDays,
        lastActiveDate: streakResult.lastActiveDate,
        unlockedBadges: nextBadges,
        wrongQuestionIds: Array.from(nextWrong),
      };

      if (state.isAuthenticated && state.user.uid) {
        saveRuleMasteryToFirestore(state.user.uid, updated);
        if (
          nextBadges.length !== state.user.unlockedBadges.length ||
          nextWrong.size !== state.user.wrongQuestionIds.length
        ) {
          saveUserProfileToFirestore(updatedUser, state.followedUserIds);
        }
      }

      return {
        masteryMap: nextMasteryMap,
        user: updatedUser,
      };
    }),

  completeTestSession: ({
    mode = 'topic',
    title = 'Тестування ПДР',
    category = 'B',
    score,
    total,
    isPassed = true,
    durationSeconds = 0,
    wrongQuestionIds,
    ruleResults,
  }) =>
    set((state) => {
      const isPerfect = total > 0 && score === total;
      const nextTotalTests = state.user.totalTestsCompleted + 1;
      const nextPerfect =
        state.user.perfectExamsCount + (isPerfect ? 1 : 0);
      const nextWrong = Array.from(
        new Set([...wrongQuestionIds, ...state.user.wrongQuestionIds])
      ).slice(0, 50);

      const nextBadges = [...state.user.unlockedBadges];
      if (isPerfect && !nextBadges.includes('perfect_1')) {
        nextBadges.push('perfect_1');
      }
      if (nextPerfect >= 10 && !nextBadges.includes('perfect_10')) {
        nextBadges.push('perfect_10');
      }

      const record: TestSessionRecord = {
        id: `session_${Date.now()}`,
        mode,
        title,
        category,
        score,
        totalQuestions: total,
        isPassed,
        durationSeconds,
        wrongQuestionIds,
        completedAt: new Date().toISOString(),
      };

      const streakResult = calculateStreak(
        state.user.lastActiveDate,
        state.user.streakDays
      );
      if (streakResult.streakDays >= 7 && !nextBadges.includes('streak_7')) {
        nextBadges.push('streak_7');
      }

      const updatedUser: UserProfile = {
        ...state.user,
        streakDays: streakResult.streakDays,
        lastActiveDate: streakResult.lastActiveDate,
        totalTestsCompleted: nextTotalTests,
        perfectExamsCount: nextPerfect,
        wrongQuestionIds: nextWrong,
        unlockedBadges: nextBadges,
      };

      // Persist to Cloud Firestore (triggers backend Cloud Function onTestCompleted)
      saveTestSessionToFirestore(state.user.uid, record, ruleResults);
      saveUserProfileToFirestore(updatedUser, state.followedUserIds);

      const masteryRecords = Object.values(state.masteryMap);
      if (masteryRecords.length > 0) {
        batchSaveRuleMasteryToFirestore(state.user.uid, masteryRecords);
      }

      return {
        testHistory: [record, ...state.testHistory].slice(0, 30),
        user: updatedUser,
      };
    }),
});
