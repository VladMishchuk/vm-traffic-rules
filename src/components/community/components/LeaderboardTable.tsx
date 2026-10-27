import React from 'react';
import { CommunityUserProfile } from '@/core/types';
import { LeaderboardCriterion } from '../types';
import LeaderboardRow from './LeaderboardRow';

interface LeaderboardTableProps {
  rankedUsers: CommunityUserProfile[];
  currentUserId: string;
  followedUserIds: string[];
  criterion: LeaderboardCriterion;
  onOpenProfile: (uid: string) => void;
  onToggleFollow: (uid: string, name: string, isFollowed: boolean) => void;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  rankedUsers,
  currentUserId,
  followedUserIds,
  criterion,
  onOpenProfile,
  onToggleFollow,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {rankedUsers.map((item, idx) => (
          <LeaderboardRow
            key={item.uid}
            item={item}
            rank={idx + 1}
            isMe={item.uid === currentUserId}
            isFollowed={followedUserIds.includes(item.uid)}
            criterion={criterion}
            onOpenProfile={onOpenProfile}
            onToggleFollow={onToggleFollow}
          />
        ))}
      </div>
    </div>
  );
};

export default LeaderboardTable;
