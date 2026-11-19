import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { useAppStore } from '@/store/useAppStore';

export function useDiscussionThread(targetId: string, defaultOpen = false) {
  const {
    user,
    commentsTable,
    followedUserIds,
    addComment,
    voteComment,
    reportComment,
    openUserProfileModal,
  } = useAppStore();

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [newCommentText, setNewCommentText] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const comments = useMemo(
    () =>
      commentsTable.filter((c) => c.targetId === targetId && !c.isReported),
    [commentsTable, targetId]
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      toast.error('Введіть текст коментаря');
      return;
    }
    addComment(targetId, newCommentText.trim());
    setNewCommentText('');
    toast.success('Коментар опубліковано');
  };

  const toggleOpen = () => setIsOpen((v) => !v);
  const toggleMenu = (id: string) =>
    setOpenMenuId((prev) => (prev === id ? null : id));
  const closeMenu = () => setOpenMenuId(null);

  return {
    user,
    comments,
    followedUserIds,
    isOpen,
    newCommentText,
    openMenuId,
    setNewCommentText,
    toggleOpen,
    toggleMenu,
    closeMenu,
    handleSend,
    voteComment,
    reportComment,
    openUserProfileModal,
  };
}
