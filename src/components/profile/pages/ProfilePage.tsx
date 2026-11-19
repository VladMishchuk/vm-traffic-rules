import ProfileHeaderCard from '../components/ProfileHeaderCard';
import BadgesAchievementsGrid from '../components/BadgesAchievementsGrid';
import UserCommentsList from '../components/UserCommentsList';
import ProfileSettingsForm from '../components/ProfileSettingsForm';
import { useProfileController } from '../hooks/useProfileController';

export default function ProfilePage() {
  const {
    user,
    followedUserIds,
    rules,
    questions,
    availableSections,
    myComments,
    displayName,
    autoExplain,
    defaultTopics,
    setDisplayName,
    setAutoExplain,
    setDefaultTopics,
    deleteOwnComment,
    toggleCategory,
    handleSaveSettings,
  } = useProfileController();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <ProfileHeaderCard
        user={user}
        followingCount={followedUserIds?.length ?? user.followingCount}
        commentsCount={myComments.length}
      />

      <BadgesAchievementsGrid unlockedBadgeIds={user.unlockedBadges} />

      <UserCommentsList
        comments={myComments}
        questions={questions}
        rules={rules}
        onDeleteComment={deleteOwnComment}
      />

      <ProfileSettingsForm
        rules={rules}
        selectedCategories={user.selectedCategories}
        onToggleCategory={toggleCategory}
        displayName={displayName}
        setDisplayName={setDisplayName}
        autoExplain={autoExplain}
        setAutoExplain={setAutoExplain}
        defaultTopics={defaultTopics}
        setDefaultTopics={setDefaultTopics}
        availableSections={availableSections}
        onSaveSettings={handleSaveSettings}
      />
    </div>
  );
}
