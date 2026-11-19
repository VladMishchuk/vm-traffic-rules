import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  loadQuestions,
  loadRules,
  getAvailableSectionsForCategories,
} from '@/lib/dataService';
import { useAppStore } from '@/store/useAppStore';

export function useProfileController() {
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

  return {
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
  };
}
