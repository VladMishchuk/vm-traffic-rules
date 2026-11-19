import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { CommunityUserProfile } from '@/core/types';
import { buildCurrentUserCommunityProfile } from '@/core/utils/userUtils';
import { loadPublicProfilesFromFirestore } from '@/lib/firestoreService';
import { LeaderboardCriterion, LeaderboardScope } from '../types';

export function useCommunityController() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    user,
    masteryMap,
    followedUserIds,
    openUserProfileModal,
    toggleFollowUser,
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

  const myEntry: CommunityUserProfile = useMemo(
    () =>
      buildCurrentUserCommunityProfile(
        user,
        masteryMap,
        followedUserIds.length
      ),
    [user, masteryMap, followedUserIds.length]
  );

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

  const handleToggleFollow = (
    uid: string,
    name: string,
    isFollowed: boolean
  ) => {
    toggleFollowUser(uid);
    toast.success(
      isFollowed
        ? `Ви відписалися від ${name}`
        : `Ви підписалися на ${name}!`
    );
  };

  return {
    user,
    followedUserIds,
    scope,
    criterion,
    allCommunityProfiles,
    rankedUsers,
    myRank,
    setScope,
    setCriterion,
    openUserProfileModal,
    handleToggleFollow,
  };
}
