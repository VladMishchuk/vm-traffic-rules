import { StateCreator } from 'zustand';
import { toast } from 'sonner';
import { UserProfile, BadgeDefinition } from '@/core/types';
import { calculateStreak, getStreakText } from '@/core/utils/dateUtils';
import {
  saveUserProfileToFirestore,
  loadUserProfileFromFirestore,
  loadUserRuleMasteryFromFirestore,
  loadTestHistoryFromFirestore,
} from '@/lib/firestoreService';
import { ALL_BADGES } from './badges';
import { AppState, AuthSlice } from './types';

export const DEFAULT_USER: UserProfile = {
  uid: '',
  displayName: 'Учень ПДР',
  email: '',
  role: 'user',
  selectedCategories: ['B'],
  isPublicProfile: true,
  streakDays: 0,
  lastActiveDate: '',
  totalTestsCompleted: 0,
  perfectExamsCount: 0,
  followersCount: 0,
  followingCount: 0,
  totalLikesReceived: 0,
  unlockedBadges: [],
  readArticleIds: [],
  wrongQuestionIds: [],
  settings: {
    autoExplainOnError: true,
    defaultTopics: ['1', '8.1', '16.1', '16.2', '33'],
    theme: 'dark',
    geminiApiKey: '',
  },
};

export const createAuthSlice: StateCreator<AppState, [], [], AuthSlice> = (
  set,
  get
) => ({
  isAuthenticated: false,
  user: DEFAULT_USER,

  toggleUserRole: () =>
    set((state) => {
      const updatedUser: UserProfile = {
        ...state.user,
        role: state.user.role === 'admin' ? 'user' : 'admin',
      };
      if (state.isAuthenticated && updatedUser.uid) {
        saveUserProfileToFirestore(updatedUser, state.followedUserIds);
      }
      return { user: updatedUser };
    }),

  loginWithEmail: (email, displayName, uid) =>
    set((state) => {
      const updatedUser: UserProfile = {
        ...DEFAULT_USER,
        uid: uid || state.user.uid || `user_${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0] || 'Учень ПДР',
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
      };
      saveUserProfileToFirestore(updatedUser);
      return {
        isAuthenticated: true,
        user: updatedUser,
      };
    }),

  registerUser: (email, displayName, categories, uid) =>
    set(() => {
      const newUser: UserProfile = {
        ...DEFAULT_USER,
        uid: uid || `user_${Date.now()}`,
        email,
        displayName: displayName || 'Новий Учень',
        selectedCategories: categories.length > 0 ? categories : ['B'],
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
        totalTestsCompleted: 0,
        perfectExamsCount: 0,
        followersCount: 0,
        followingCount: 0,
        unlockedBadges: [],
        readArticleIds: [],
        wrongQuestionIds: [],
      };
      saveUserProfileToFirestore(newUser, []);
      return {
        isAuthenticated: true,
        followedUserIds: [],
        masteryMap: {},
        testHistory: [],
        user: newUser,
      };
    }),

  loginWithGoogle: (email, displayName, photoURL, uid) =>
    set((state) => {
      const updatedUser: UserProfile = {
        ...DEFAULT_USER,
        uid: uid || state.user.uid || `user_${Date.now()}`,
        email,
        displayName: displayName || 'Користувач Google',
        photoURL,
        streakDays: 1,
        lastActiveDate: new Date().toISOString(),
      };
      saveUserProfileToFirestore(updatedUser, state.followedUserIds);
      return {
        isAuthenticated: true,
        user: updatedUser,
      };
    }),

  syncWithFirebaseUser: async (fbUser) => {
    const firestoreProfile = await loadUserProfileFromFirestore(fbUser.uid);
    const [cloudMastery, cloudHistory] = await Promise.all([
      loadUserRuleMasteryFromFirestore(fbUser.uid),
      loadTestHistoryFromFirestore(fbUser.uid),
    ]);

    set((state) => {
      const effectiveFollowed =
        Array.isArray(firestoreProfile?.followedUserIds)
          ? firestoreProfile.followedUserIds
          : [];

      const effectiveTheme = firestoreProfile?.settings?.theme || state.theme || 'dark';
      document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');

      const streakResult = calculateStreak(
        firestoreProfile?.lastActiveDate,
        firestoreProfile?.streakDays ?? 0
      );

      const nextBadges = [
        ...(firestoreProfile?.unlockedBadges || DEFAULT_USER.unlockedBadges),
      ];
      if (streakResult.streakDays >= 7 && !nextBadges.includes('streak_7')) {
        nextBadges.push('streak_7');
      }

      if (streakResult.isNewStreakDay && streakResult.streakDays > 1) {
        toast.success(
          `🔥 Щоденний стрік: ${streakResult.streakDays} ${getStreakText(streakResult.streakDays)}!`
        );
      }

      const mergedUser: UserProfile = {
        ...DEFAULT_USER,
        ...(firestoreProfile || {}),
        uid: fbUser.uid,
        email: fbUser.email || state.user.email || '',
        displayName: fbUser.displayName || firestoreProfile?.displayName || 'Учень ПДР',
        photoURL: fbUser.photoURL || firestoreProfile?.photoURL,
        followingCount: effectiveFollowed.length,
        streakDays: streakResult.streakDays,
        lastActiveDate: streakResult.lastActiveDate,
        unlockedBadges: nextBadges,
        settings: {
          ...DEFAULT_USER.settings,
          ...(firestoreProfile?.settings || {}),
          theme: effectiveTheme,
        },
      };

      saveUserProfileToFirestore(mergedUser, effectiveFollowed);

      return {
        isAuthenticated: true,
        theme: effectiveTheme,
        user: mergedUser,
        followedUserIds: effectiveFollowed,
        masteryMap: cloudMastery || {},
        testHistory: cloudHistory || [],
      };
    });
  },

  logout: () =>
    set({
      isAuthenticated: false,
      activeTest: null,
      user: DEFAULT_USER,
      masteryMap: {},
      testHistory: [],
      followedUserIds: [],
    }),

  toggleCategory: (cat) =>
    set((state) => {
      const current = state.user.selectedCategories;
      const exists = current.includes(cat);
      const updated = exists
        ? current.length > 1
          ? current.filter((c) => c !== cat)
          : current
        : [...current, cat];
      const updatedUser: UserProfile = {
        ...state.user,
        selectedCategories: updated,
      };
      if (state.isAuthenticated && updatedUser.uid) {
        saveUserProfileToFirestore(updatedUser, state.followedUserIds);
      }
      return { user: updatedUser };
    }),

  setCategories: (cats) =>
    set((state) => {
      const updatedUser: UserProfile = {
        ...state.user,
        selectedCategories: cats.length > 0 ? cats : ['B'],
      };
      if (state.isAuthenticated && updatedUser.uid) {
        saveUserProfileToFirestore(updatedUser, state.followedUserIds);
      }
      return { user: updatedUser };
    }),

  updateProfileSettings: (patch) =>
    set((state) => {
      const updatedUser: UserProfile = {
        ...state.user,
        displayName: patch.displayName ?? state.user.displayName,
        isPublicProfile: true,
        settings: {
          ...state.user.settings,
          autoExplainOnError:
            patch.autoExplainOnError ??
            state.user.settings.autoExplainOnError,
          defaultTopics:
            patch.defaultTopics ?? state.user.settings.defaultTopics,
          geminiApiKey:
            patch.geminiApiKey !== undefined
              ? patch.geminiApiKey
              : state.user.settings.geminiApiKey,
          theme:
            patch.theme !== undefined
              ? patch.theme
              : state.user.settings.theme,
        },
      };
      if (state.isAuthenticated && updatedUser.uid) {
        saveUserProfileToFirestore(updatedUser, state.followedUserIds);
      }
      return { user: updatedUser };
    }),

  markArticleRead: (articleId, _articleTitle) => {
    const state = get();
    if (state.user.readArticleIds.includes(articleId)) {
      return { newlyRead: false };
    }
    const nextRead = [...state.user.readArticleIds, articleId];
    const nextBadges = [...state.user.unlockedBadges];
    let unlockedBadge: BadgeDefinition | undefined;

    if (nextRead.length >= 1 && !nextBadges.includes('theorist_bronze')) {
      nextBadges.push('theorist_bronze');
      unlockedBadge = ALL_BADGES.find((b) => b.id === 'theorist_bronze');
    } else if (
      nextRead.length >= 10 &&
      !nextBadges.includes('theorist_silver')
    ) {
      nextBadges.push('theorist_silver');
      unlockedBadge = ALL_BADGES.find((b) => b.id === 'theorist_silver');
    } else if (
      nextRead.length >= 25 &&
      !nextBadges.includes('theorist_gold')
    ) {
      nextBadges.push('theorist_gold');
      unlockedBadge = ALL_BADGES.find((b) => b.id === 'theorist_gold');
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
      readArticleIds: nextRead,
      unlockedBadges: nextBadges,
    };

    if (state.isAuthenticated && updatedUser.uid) {
      saveUserProfileToFirestore(updatedUser, state.followedUserIds);
    }

    set({ user: updatedUser });

    return { newlyRead: true, unlockedBadge };
  },

  removeWrongQuestion: (questionId) =>
    set((state) => {
      const updatedUser: UserProfile = {
        ...state.user,
        wrongQuestionIds: state.user.wrongQuestionIds.filter(
          (id) => id !== questionId
        ),
      };
      if (state.isAuthenticated && updatedUser.uid) {
        saveUserProfileToFirestore(updatedUser, state.followedUserIds);
      }
      return { user: updatedUser };
    }),
});
