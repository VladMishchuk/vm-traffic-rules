import {
  CommunityUserProfile,
  RuleMasteryRecord,
  UserProfile,
} from '@/core/types';

/**
 * Формує ініціали користувача (1–2 великі літери) з відображуваного імені.
 */
export function getAvatarInitials(
  displayName?: string | null,
  fallback = 'УП'
): string {
  const raw = (displayName || fallback).trim();
  if (!raw) return fallback;
  return raw
    .split(/\s+/)
    .map((w) => w[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Обчислює сумарну кількість спроб, правильних відповідей та відсоток точності за картою засвоєння правил.
 */
export function calculateMasteryAccuracy(
  masteryMap: Record<string, RuleMasteryRecord>
): {
  totalAttempts: number;
  correctAttempts: number;
  accuracyPercent: number;
} {
  const records = Object.values(masteryMap);
  const totalAttempts = records.reduce((s, r) => s + r.totalAttempts, 0);
  const correctAttempts = records.reduce((s, r) => s + r.correctAttempts, 0);
  const accuracyPercent =
    totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  return { totalAttempts, correctAttempts, accuracyPercent };
}

/**
 * Формує публічний профіль поточного користувача для відображення у таблиці лідерів та модалці профілю.
 */
export function buildCurrentUserCommunityProfile(
  user: UserProfile,
  masteryMap: Record<string, RuleMasteryRecord>,
  followingCount: number
): CommunityUserProfile {
  const { accuracyPercent } = calculateMasteryAccuracy(masteryMap);
  return {
    uid: user.uid,
    displayName: `${user.displayName || 'Учень'} (Ви)`,
    avatarInitials: getAvatarInitials(user.displayName, 'ВИ'),
    selectedCategories: user.selectedCategories,
    isPublicProfile: user.isPublicProfile,
    streakDays: user.streakDays,
    totalTestsCompleted: user.totalTestsCompleted,
    perfectExamsCount: user.perfectExamsCount,
    accuracyPercent,
    totalLikesReceived: user.totalLikesReceived,
    followersCount: user.followersCount,
    followingCount,
    unlockedBadges: user.unlockedBadges,
    bio: 'Мій навчальний профіль у системі ПДР України AI.',
  };
}
