import {
  subscribeToFirestoreComments,
  addCommentToFirestore,
  deleteCommentFromFirestore,
  voteCommentInFirestore,
  submitReportToFirestore,
  loadPublicProfilesFromFirestore,
  toggleFollowInFirestore,
} from '@/lib/firestoreService';

export const commentsRepository = {
  subscribeToComments: subscribeToFirestoreComments,
  addComment: addCommentToFirestore,
  deleteComment: deleteCommentFromFirestore,
  voteComment: voteCommentInFirestore,
  submitReport: submitReportToFirestore,
  loadPublicProfiles: loadPublicProfilesFromFirestore,
  toggleFollow: toggleFollowInFirestore,
};
