import {
  ActiveTestConfig,
  BadgeDefinition,
  CommunityUserProfile,
  ContentReport,
  DriverCategoryCode,
  QuestionComment,
  RuleMasteryRecord,
  TestMode,
  TestSessionRecord,
  UserProfile,
} from '@/core/types';

export interface AuthSlice {
  isAuthenticated: boolean;
  user: UserProfile;
  loginWithEmail: (email: string, displayName?: string, uid?: string) => void;
  registerUser: (
    email: string,
    displayName: string,
    categories: DriverCategoryCode[],
    uid?: string
  ) => void;
  loginWithGoogle: (
    email: string,
    displayName: string,
    photoURL?: string,
    uid?: string
  ) => void;
  syncWithFirebaseUser: (fbUser: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  }) => Promise<void>;
  logout: () => void;
  toggleUserRole: () => void;
  toggleCategory: (cat: DriverCategoryCode) => void;
  setCategories: (cats: DriverCategoryCode[]) => void;
  updateProfileSettings: (
    patch: Partial<UserProfile['settings']> & {
      displayName?: string;
    }
  ) => void;
  markArticleRead: (
    articleId: string,
    articleTitle: string
  ) => { newlyRead: boolean; unlockedBadge?: BadgeDefinition };
  removeWrongQuestion: (questionId: string) => void;
}

export interface TestingSlice {
  activeTest: ActiveTestConfig | null;
  testHistory: TestSessionRecord[];
  masteryMap: Record<string, RuleMasteryRecord>;
  startTestSession: (config: ActiveTestConfig) => void;
  clearActiveTest: () => void;
  recordAttempt: (
    itemId: string,
    section: string,
    isCorrect: boolean,
    questionId?: string
  ) => void;
  completeTestSession: (params: {
    mode?: TestMode;
    title?: string;
    category?: DriverCategoryCode;
    score: number;
    total: number;
    isPassed?: boolean;
    durationSeconds?: number;
    wrongQuestionIds: string[];
    ruleResults?: { ruleId: string; section: string; isCorrect: boolean }[];
  }) => void;
  prioritizeFailedRules: (ruleIds: string[], sections: string[]) => void;
}

export interface CommunitySlice {
  commentsTable: QuestionComment[];
  inspectedUserProfileUid: string | null;
  reports: ContentReport[];
  communityUsers: CommunityUserProfile[];
  followedUserIds: string[];
  openUserProfileModal: (uid: string) => void;
  closeUserProfileModal: () => void;
  toggleFollowUser: (targetUid: string) => void;
  setCommentsTable: (comments: QuestionComment[]) => void;
  addComment: (targetId: string, text: string) => void;
  deleteOwnComment: (commentId: string) => void;
  voteComment: (targetId: string, commentId: string, vote: 1 | -1) => void;
  reportComment: (targetId: string, commentId: string) => void;
  reportQuestionError: (
    questionId: string,
    reasonCategory: string,
    description: string
  ) => void;
  resolveReport: (reportId: string) => void;
  deleteReportedComment: (reportId: string, commentId: string) => void;
}

export interface UISlice {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export type AppState = AuthSlice & TestingSlice & CommunitySlice & UISlice;
