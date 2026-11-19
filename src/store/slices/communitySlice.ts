import { StateCreator } from 'zustand';
import {
  ContentReport,
  QuestionComment,
  UserProfile,
} from '@/core/types';
import {
  saveUserProfileToFirestore,
  addCommentToFirestore,
  deleteCommentFromFirestore,
  voteCommentInFirestore,
  submitReportToFirestore,
  toggleFollowInFirestore,
} from '@/lib/firestoreService';
import { AppState, CommunitySlice } from './types';

const INITIAL_COMMENTS_TABLE: QuestionComment[] = [];

export const createCommunitySlice: StateCreator<
  AppState,
  [],
  [],
  CommunitySlice
> = (set) => ({
  commentsTable: INITIAL_COMMENTS_TABLE,
  inspectedUserProfileUid: null,
  followedUserIds: [],

  openUserProfileModal: (uid) => set({ inspectedUserProfileUid: uid }),
  closeUserProfileModal: () => set({ inspectedUserProfileUid: null }),

  toggleFollowUser: (targetUid) =>
    set((state) => {
      const isFollowing = state.followedUserIds.includes(targetUid);
      const nextFollowed = isFollowing
        ? state.followedUserIds.filter((id) => id !== targetUid)
        : [...state.followedUserIds, targetUid];

      const updatedUser: UserProfile = {
        ...state.user,
        followingCount: nextFollowed.length,
      };

      if (state.isAuthenticated && updatedUser.uid) {
        saveUserProfileToFirestore(updatedUser, nextFollowed);
        toggleFollowInFirestore(state.user.uid, targetUid, !isFollowing);
      }

      return {
        followedUserIds: nextFollowed,
        user: updatedUser,
      };
    }),

  setCommentsTable: (comments) => set({ commentsTable: comments }),

  addComment: (targetId, text) =>
    set((state) => {
      const isQuestion = targetId.startsWith('q_');
      const newComment: QuestionComment = {
        id: `c_${Date.now()}`,
        targetId,
        targetType: isQuestion ? 'question' : 'knowledge_item',
        authorUid: state.user.uid,
        authorName: state.user.displayName,
        authorBadges:
          state.user.unlockedBadges.length > 0 ? ['Теоретик'] : [],
        text,
        likes: 1,
        dislikes: 0,
        userVote: 1,
        createdAt: new Date().toISOString(),
      };

      addCommentToFirestore(newComment);

      return {
        commentsTable: [newComment, ...state.commentsTable],
      };
    }),

  deleteOwnComment: (commentId) => {
    deleteCommentFromFirestore(commentId);
    set((state) => ({
      commentsTable: state.commentsTable.filter((c) => c.id !== commentId),
    }));
  },

  voteComment: (_targetId, commentId, vote) =>
    set((state) => {
      let likesDelta = 0;
      let dislikesDelta = 0;

      const nextTable = state.commentsTable.map((c) => {
        if (c.id !== commentId) return c;
        const prevVote = c.userVote || 0;
        if (prevVote === vote) return c;
        const dLikes = vote === 1 ? 1 : prevVote === 1 ? -1 : 0;
        const dDislikes =
          vote === -1 ? 1 : prevVote === -1 ? -1 : 0;
        likesDelta = dLikes;
        dislikesDelta = dDislikes;
        return {
          ...c,
          likes: c.likes + dLikes,
          dislikes: c.dislikes + dDislikes,
          userVote: vote,
        };
      });

      if (likesDelta !== 0 || dislikesDelta !== 0) {
        voteCommentInFirestore(commentId, likesDelta, dislikesDelta);
      }

      return {
        commentsTable: nextTable,
      };
    }),

  reportComment: (_targetId, commentId) =>
    set((state) => {
      const nextTable = state.commentsTable.map((c) =>
        c.id === commentId ? { ...c, isReported: true } : c
      );
      const report: ContentReport = {
        id: `rep_${Date.now()}`,
        reportType: 'comment_spam',
        targetId: commentId,
        reasonCategory: 'Спам або образа в коментарі',
        description: `Скарга від ${state.user.displayName}`,
        createdAt: new Date().toISOString(),
        status: 'pending',
      };
      submitReportToFirestore(report);
      return {
        commentsTable: nextTable,
      };
    }),

  reportQuestionError: (questionId, reasonCategory, description) => {
    const report: ContentReport = {
      id: `qrep_${Date.now()}`,
      reportType: 'question_error',
      targetId: questionId,
      reasonCategory,
      description,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    submitReportToFirestore(report);
  },
});
