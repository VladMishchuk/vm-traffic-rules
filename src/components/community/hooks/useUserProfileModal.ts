import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';
import { CommunityUserProfile } from '@/core/types';
import {
  buildCurrentUserCommunityProfile,
  getAvatarInitials,
} from '@/core/utils/userUtils';
import { loadPublicProfilesFromFirestore } from '@/lib/firestoreService';

export function useUserProfileModal() {
  const {
    user,
    masteryMap,
    followedUserIds,
    commentsTable,
    inspectedUserProfileUid,
    closeUserProfileModal,
    toggleFollowUser,
  } = useAppStore();

  const { data: cloudProfiles = [] } = useQuery({
    queryKey: ['public-profiles'],
    queryFn: loadPublicProfilesFromFirestore,
  });

  const selectedProfile: CommunityUserProfile | null = useMemo(() => {
    if (!inspectedUserProfileUid) return null;

    if (inspectedUserProfileUid === user.uid) {
      return buildCurrentUserCommunityProfile(
        user,
        masteryMap,
        followedUserIds.length
      );
    }

    const foundInCloud = cloudProfiles.find(
      (u) => u.uid === inspectedUserProfileUid
    );
    if (foundInCloud) return foundInCloud;

    const commentSample = commentsTable.find(
      (c) => c.authorUid === inspectedUserProfileUid
    );
    const name = commentSample?.authorName || 'Учасник спільноти';

    return {
      uid: inspectedUserProfileUid,
      displayName: name,
      avatarInitials: getAvatarInitials(name, 'УС'),
      selectedCategories: ['B'],
      isPublicProfile: true,
      streakDays: 0,
      totalTestsCompleted: 0,
      perfectExamsCount: 0,
      accuracyPercent: 0,
      totalLikesReceived: commentSample?.likes || 0,
      followersCount: 0,
      followingCount: 0,
      unlockedBadges: [],
      bio: 'Учасник спільноти ПДР України.',
    };
  }, [
    inspectedUserProfileUid,
    user,
    masteryMap,
    cloudProfiles,
    commentsTable,
    followedUserIds.length,
  ]);

  const authorComments = useMemo(() => {
    if (!selectedProfile) return [];
    return commentsTable.filter(
      (c) => c.authorUid === selectedProfile.uid && !c.isReported
    );
  }, [commentsTable, selectedProfile]);

  const isMe = selectedProfile?.uid === user.uid;
  const isFollowed = selectedProfile
    ? followedUserIds.includes(selectedProfile.uid)
    : false;

  const handleToggleFollow = () => {
    if (!selectedProfile) return;
    toggleFollowUser(selectedProfile.uid);
    toast.success(
      isFollowed
        ? `Ви відписалися від ${selectedProfile.displayName}`
        : `Ви підписалися на ${selectedProfile.displayName}!`
    );
  };

  return {
    selectedProfile,
    authorComments,
    isMe,
    isFollowed,
    closeUserProfileModal,
    handleToggleFollow,
  };
}
