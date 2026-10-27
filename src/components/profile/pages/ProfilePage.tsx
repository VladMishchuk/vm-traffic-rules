import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  loadQuestions,
  loadRules,
  getAvailableSectionsForCategories,
} from '@/lib/dataService';
import { useAppStore } from '@/store/useAppStore';
import ProfileHeaderCard from '../components/ProfileHeaderCard';
import BadgesAchievementsGrid from '../components/BadgesAchievementsGrid';
import UserCommentsList from '../components/UserCommentsList';
import ProfileSettingsForm from '../components/ProfileSettingsForm';

export default function ProfilePage() {
  const {
    user,
    followedUserIds,
    commentsTable,
    deleteOwnComment,
    toggleCategory,
    updateProfileSettings,
  } = useAppStore();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [autoExplain, setAutoExplain] = useState(
    user.settings.autoExplainOnError
  );
  const [defaultTopics, setDefaultTopics] = useState<string[]>(
    user.settings.defaultTopics
  );

  const { data: rules } = useQuery({
    queryKey: ['traffic-rules'],
    queryFn: loadRules,
  });

  const { data: questions = [] } = useQuery({
    queryKey: ['official-questions'],
    queryFn: loadQuestions,
  });

  const availableSections = getAvailableSectionsForCategories(
    questions,
    user.selectedCategories
  );

  const myComments = useMemo(
    () => commentsTable.filter((c) => c.authorUid === user.uid),
    [commentsTable, user.uid]
  );

  const handleSaveSettings = () => {
    updateProfileSettings({
      displayName: displayName.trim() || user.displayName,
      autoExplainOnError: autoExplain,
      defaultTopics,
    });
    toast.success('Налаштування профілю збережено');
  };

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
