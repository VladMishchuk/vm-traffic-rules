import { DriverCategoryCode } from './category.types';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'badge' | 'social' | 'system';
  isRead: boolean;
  createdAt: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  condition: string;
  icon: string;
  tier: 'bronze' | 'silver' | 'gold' | 'special';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  selectedCategories: DriverCategoryCode[];
  isPublicProfile: boolean;
  streakDays: number;
  lastActiveDate: string;
  totalTestsCompleted: number;
  perfectExamsCount: number;
  followersCount: number;
  followingCount: number;
  totalLikesReceived: number;
  unlockedBadges: string[];
  readArticleIds: string[];
  wrongQuestionIds: string[];
  settings: {
    autoExplainOnError: boolean;
    defaultTopics: string[];
    theme?: 'light' | 'dark';
    geminiApiKey?: string;
  };
}

export interface CommunityUserProfile {
  uid: string;
  displayName: string;
  avatarInitials: string;
  selectedCategories: DriverCategoryCode[];
  isPublicProfile: boolean;
  streakDays: number;
  totalTestsCompleted: number;
  perfectExamsCount: number;
  accuracyPercent: number;
  totalLikesReceived: number;
  followersCount: number;
  followingCount: number;
  unlockedBadges: string[];
  bio: string;
}
