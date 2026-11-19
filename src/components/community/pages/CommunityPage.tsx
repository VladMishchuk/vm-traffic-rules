import CommunityHeaderBanner from '../components/CommunityHeaderBanner';
import LeaderboardFilters from '../components/LeaderboardFilters';
import LeaderboardTable from '../components/LeaderboardTable';
import { useCommunityController } from '../hooks/useCommunityController';

export default function CommunityPage() {
  const {
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
  } = useCommunityController();

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
