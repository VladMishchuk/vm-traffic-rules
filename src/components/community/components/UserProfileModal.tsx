import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  X,
  Award,
  UserPlus,
  UserCheck,
  MessageSquare,
  ThumbsUp,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore, ALL_BADGES } from '@/store/useAppStore';
import { CommunityUserProfile } from '@/core/types';
import { loadPublicProfilesFromFirestore } from '@/lib/firestoreService';

export default function UserProfileModal() {
  const {
    user,
    masteryMap,
    communityUsers,
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
      const records = Object.values(masteryMap);
      const total = records.reduce((s, r) => s + r.totalAttempts, 0);
      const correct = records.reduce((s, r) => s + r.correctAttempts, 0);
      const myAccuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      const initials = (user.displayName || 'ВИ')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      return {
        uid: user.uid,
        displayName: `${user.displayName} (Ви)`,
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
    }

    const foundInCloud = cloudProfiles.find((u) => u.uid === inspectedUserProfileUid);
    if (foundInCloud) return foundInCloud;

    const found = communityUsers.find((u) => u.uid === inspectedUserProfileUid);
    if (found) return found;

    // Fallback if comment author profile is not yet cached locally
    const commentSample = commentsTable.find(
      (c) => c.authorUid === inspectedUserProfileUid
    );
    const name = commentSample?.authorName || 'Учасник спільноти';
    const initials = name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      uid: inspectedUserProfileUid,
      displayName: name,
      avatarInitials: initials,
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
    communityUsers,
    commentsTable,
    followedUserIds,
  ]);

  const authorComments = useMemo(() => {
    if (!selectedProfile) return [];
    return commentsTable.filter(
      (c) => c.authorUid === selectedProfile.uid && !c.isReported
    );
  }, [commentsTable, selectedProfile]);

  if (!selectedProfile) return null;

  const isMe = selectedProfile.uid === user.uid;
  const isFollowed = followedUserIds.includes(selectedProfile.uid);

  const handleToggleFollow = () => {
    toggleFollowUser(selectedProfile.uid);
    toast.success(
      isFollowed
        ? `Ви відписалися від ${selectedProfile.displayName}`
        : `Ви підписалися на ${selectedProfile.displayName}!`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={closeUserProfileModal}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold text-lg flex items-center justify-center shadow-md shrink-0">
              {selectedProfile.avatarInitials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-extrabold truncate">
                  {selectedProfile.displayName}
                </h3>
                {selectedProfile.unlockedBadges.includes('peoples_expert') && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-600 dark:text-violet-400 text-[10px] font-bold">
                    <Sparkles className="w-3 h-3" />
                    Народний експерт
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedProfile.followersCount} підписників • {selectedProfile.followingCount ?? 0} підписок • Учасник спільноти ПДР України
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isMe && (
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isFollowed
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-rose-500/10 hover:text-rose-500'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs'
                }`}
              >
                {isFollowed ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Відстежується</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Підписатися</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={closeUserProfileModal}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl">
              {selectedProfile.bio}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-orange-500/10 text-center">
                <div className="text-lg font-extrabold text-orange-500">
                  {selectedProfile.streakDays} дн.
                </div>
                <div className="text-[11px] text-slate-500">Стрік</div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-center">
                <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  {selectedProfile.accuracyPercent}%
                </div>
                <div className="text-[11px] text-slate-500">Точність</div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-500/10 text-center">
                <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400">
                  {selectedProfile.totalTestsCompleted}
                </div>
                <div className="text-[11px] text-slate-500">Тестів</div>
              </div>
              <div className="p-3 rounded-2xl bg-violet-500/10 text-center">
                <div className="text-lg font-extrabold text-violet-600 dark:text-violet-400">
                  {selectedProfile.totalLikesReceived}
                </div>
                <div className="text-[11px] text-slate-500">Лайків</div>
              </div>
            </div>

            {/* Unlocked Badges */}
            {selectedProfile.unlockedBadges.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Відкриті досягнення ({selectedProfile.unlockedBadges.length})
                </div>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {ALL_BADGES.filter((b) =>
                    selectedProfile.unlockedBadges.includes(b.id)
                  ).map((b) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center gap-2.5"
                    >
                      <Award className="w-5 h-5 text-amber-500 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {b.title}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {b.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Author's Comments from commentsTable */}
            {authorComments.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                  <span>
                    Опубліковані коментарі та пояснення ({authorComments.length})
                  </span>
                </div>
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {authorComments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-1"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {c.targetType === 'question'
                            ? `Питання ${c.targetId.replace('q_', '#')}`
                            : `База знань: ${c.targetId}`}
                        </span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          <ThumbsUp className="w-3 h-3" />
                          {c.likes}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {!isMe && (
            <button
              type="button"
              onClick={handleToggleFollow}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold cursor-pointer transition ${
                isFollowed
                  ? 'border border-rose-500/40 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              {isFollowed ? 'Відписатися' : 'Підписатися'}
            </button>
          )}
          <button
            type="button"
            onClick={closeUserProfileModal}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}
