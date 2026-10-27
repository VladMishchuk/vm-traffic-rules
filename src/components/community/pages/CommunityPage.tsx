import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { CommunityUserProfile } from '@/core/types';
import { loadPublicProfilesFromFirestore } from '@/lib/firestoreService';
import { LeaderboardCriterion, LeaderboardScope } from '../types';
import CommunityHeaderBanner from '../components/CommunityHeaderBanner';
import LeaderboardFilters from '../components/LeaderboardFilters';
import LeaderboardTable from '../components/LeaderboardTable';

export default function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    user,
    masteryMap,
    followedUserIds,
    openUserProfileModal,
    toggleFollowUser,
    updateProfileSettings,
  } = useAppStore();

  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [criterion, setCriterion] = useState<LeaderboardCriterion>('streak');

  const { data: cloudProfiles = [] } = useQuery({
    queryKey: ['public-profiles'],
    queryFn: loadPublicProfilesFromFirestore,
  });

  useEffect(() => {
    const u = searchParams.get('user');
    if (u) {
      openUserProfileModal(u);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, openUserProfileModal, setSearchParams]);

  // Calculate current user's accuracy for leaderboard row
  const myAccuracy = useMemo(() => {
    const records = Object.values(masteryMap);
    const total = records.reduce((s, r) => s + r.totalAttempts, 0);
    const correct = records.reduce((s, r) => s + r.correctAttempts, 0);
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }, [masteryMap]);

  // Convert current user into a CommunityUserProfile row so they appear in rankings
  const myEntry: CommunityUserProfile = useMemo(() => {
    const initials = (user.displayName || 'ВИ')
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    return {
      uid: user.uid,
      displayName: `${user.displayName || 'Учень'} (Ви)`,
      avatarInitials: initials,
      selectedCategories: user.selectedCategories,
      isPublicProfile: user.isPublicProfile,
      streakDays: user.streakDays,
      totalTestsCompleted: user.totalTestsCompleted,
      perfectExamsCount: user.perfectExamsCount,
      accuracyPercent: myAccuracy,
      totalLikesReceived: user.totalLikesReceived,
      followersCount: user.followersCount,
      followingCount: followedUserIds.length,
      unlockedBadges: user.unlockedBadges,
      bio: 'Мій навчальний профіль у системі ПДР України AI.',
    };
  }, [user, myAccuracy, followedUserIds.length]);

  const allCommunityProfiles = useMemo(() => {
    const list: CommunityUserProfile[] = [];
    const seen = new Set<string>();

    for (const cp of cloudProfiles) {
      if (cp.uid && !seen.has(cp.uid)) {
        seen.add(cp.uid);
        list.push(cp);
      }
    }
    return list;
  }, [cloudProfiles]);

  const rankedUsers = useMemo(() => {
    const others = allCommunityProfiles.filter((u) => u.uid !== user.uid);
    let pool = user.uid ? [myEntry, ...others] : [...others];

    if (scope === 'following') {
      pool = pool.filter(
        (u) => u.uid === user.uid || followedUserIds.includes(u.uid)
      );
    }

    return [...pool].sort((a, b) => {
      if (criterion === 'streak') return b.streakDays - a.streakDays;
      if (criterion === 'tests')
        return b.totalTestsCompleted - a.totalTestsCompleted;
      return b.totalLikesReceived - a.totalLikesReceived;
    });
  }, [
    myEntry,
    allCommunityProfiles,
    scope,
    criterion,
    user.uid,
    followedUserIds,
  ]);

  const myRank =
    rankedUsers.findIndex((u) => u.uid === user.uid) + 1 || rankedUsers.length;

  const handleToggleFollow = (uid: string, name: string, isFollowed: boolean) => {
    toggleFollowUser(uid);
    toast.success(
      isFollowed
        ? `Ви відписалися від ${name}`
        : `Ви підписалися на ${name}!`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <CommunityHeaderBanner
        myRank={myRank}
        followingCount={followedUserIds.length}
      />

      <LeaderboardFilters
        scope={scope}
        setScope={setScope}
        criterion={criterion}
        setCriterion={setCriterion}
        globalCount={allCommunityProfiles.length}
        followingCount={followedUserIds.length}
      />

      <LeaderboardTable
        rankedUsers={rankedUsers}
        currentUserId={user.uid}
        followedUserIds={followedUserIds}
        criterion={criterion}
        onOpenProfile={openUserProfileModal}
        onToggleFollow={handleToggleFollow}
      />
    </div>
  );
}
