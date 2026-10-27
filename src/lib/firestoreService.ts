import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  increment,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  UserProfile,
  RuleMasteryRecord,
  TestSessionRecord,
  QuestionComment,
  ContentReport,
  CommunityUserProfile,
} from '@/core/types';

/**
 * Saves or updates a user profile document in Firestore (`users/{uid}`)
 * and syncs the safe public subset to `public_profiles/{uid}`.
 */
export async function saveUserProfileToFirestore(
  user: UserProfile,
  followedUserIds?: string[]
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        ...user,
        ...(Array.isArray(followedUserIds) ? { followedUserIds } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // Sync public profile
    const pubRef = doc(db, 'public_profiles', user.uid);
    if (user.isPublicProfile) {
      await setDoc(
        pubRef,
        {
          uid: user.uid,
          displayName: user.displayName,
          avatarInitials: user.displayName.slice(0, 2).toUpperCase(),
          photoURL: user.photoURL || null,
          selectedCategories: user.selectedCategories,
          isPublicProfile: true,
          streakDays: user.streakDays,
          totalTestsCompleted: user.totalTestsCompleted,
          perfectExamsCount: user.perfectExamsCount,
          accuracyPercent: 0,
          totalLikesReceived: user.totalLikesReceived,
          followersCount: user.followersCount,
          followingCount: user.followingCount,
          unlockedBadges: user.unlockedBadges,
          bio: '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } else {
      await deleteDoc(pubRef).catch(() => {});
    }
  } catch (err) {
    console.warn('[Firestore] Failed to save user profile:', err);
  }
}

/**
 * Deletes user profile and public profile documents from Firestore.
 */
export async function deleteUserProfileFromFirestore(uid: string): Promise<void> {
  if (!isFirebaseConfigured || !db || !uid) return;
  try {
    await Promise.all([
      deleteDoc(doc(db, 'users', uid)).catch(() => {}),
      deleteDoc(doc(db, 'public_profiles', uid)).catch(() => {}),
    ]);
  } catch (err) {
    console.warn('[Firestore] Failed to delete user profile:', err);
  }
}

/**
 * Loads a user profile document from Firestore (`users/{uid}`).
 */
export async function loadUserProfileFromFirestore(
  uid: string
): Promise<(Partial<UserProfile> & { followedUserIds?: string[] }) | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return snap.data() as Partial<UserProfile> & { followedUserIds?: string[] };
  } catch (err) {
    console.warn('[Firestore] Failed to load user profile:', err);
    return null;
  }
}

/**
 * Loads all public profiles for the Community page.
 */
export async function loadPublicProfilesFromFirestore(): Promise<CommunityUserProfile[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const pubRef = collection(db, 'public_profiles');
    const q = query(pubRef, limit(50));
    const snap = await getDocs(q);
    const list: CommunityUserProfile[] = [];
    snap.forEach((d) => {
      list.push(d.data() as CommunityUserProfile);
    });
    return list;
  } catch (err) {
    console.warn('[Firestore] Failed to load public profiles:', err);
    return [];
  }
}

/**
 * Saves a single rule mastery record directly to `users/{uid}/rule_mastery/{ruleId}`.
 */
export async function saveRuleMasteryToFirestore(
  uid: string,
  record: RuleMasteryRecord
): Promise<void> {
  if (!isFirebaseConfigured || !db || !uid || !record.itemId) return;
  try {
    const ref = doc(db, 'users', uid, 'rule_mastery', record.itemId);
    await setDoc(ref, record, { merge: true });
  } catch (err) {
    console.warn('[Firestore] Failed to save rule mastery record:', err);
  }
}

/**
 * Saves a batch of rule mastery records directly to `users/{uid}/rule_mastery/{ruleId}`.
 */
export async function batchSaveRuleMasteryToFirestore(
  uid: string,
  records: RuleMasteryRecord[]
): Promise<void> {
  if (!isFirebaseConfigured || !db || records.length === 0) return;
  try {
    const batch = writeBatch(db);
    for (const rec of records) {
      if (!rec.itemId) continue;
      const ref = doc(db, 'users', uid, 'rule_mastery', rec.itemId);
      batch.set(ref, rec, { merge: true });
    }
    await batch.commit();
  } catch (err) {
    console.warn('[Firestore] Failed to batch save rule mastery:', err);
  }
}

/**
 * Loads all rule mastery records for a user from `users/{uid}/rule_mastery`.
 */
export async function loadUserRuleMasteryFromFirestore(
  uid: string
): Promise<Record<string, RuleMasteryRecord>> {
  if (!isFirebaseConfigured || !db) return {};
  try {
    const masteryRef = collection(db, 'users', uid, 'rule_mastery');
    const snap = await getDocs(masteryRef);
    const result: Record<string, RuleMasteryRecord> = {};
    snap.forEach((d) => {
      result[d.id] = d.data() as RuleMasteryRecord;
    });
    return result;
  } catch (err) {
    console.warn('[Firestore] Failed to load rule mastery:', err);
    return {};
  }
}

/**
 * Saves an attempted test session to `users/{uid}/test_sessions/{sessionId}`
 * and records mistakes in `users/{uid}/mistakes/{questionId}`.
 */
export async function saveTestSessionToFirestore(
  uid: string,
  session: TestSessionRecord,
  ruleResults?: { ruleId: string; section: string; isCorrect: boolean }[]
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const sessionRef = doc(db, 'users', uid, 'test_sessions', session.id);
    await setDoc(sessionRef, {
      ...session,
      ruleResults: ruleResults || [],
      createdAt: serverTimestamp(),
    });

    if (session.wrongQuestionIds && session.wrongQuestionIds.length > 0) {
      const batch = writeBatch(db);
      for (const qId of session.wrongQuestionIds) {
        const misRef = doc(db, 'users', uid, 'mistakes', qId);
        batch.set(
          misRef,
          {
            questionId: qId,
            wrongCount: increment(1),
            lastWrongAt: serverTimestamp(),
            resolved: false,
          },
          { merge: true }
        );
      }
      await batch.commit();
    }
  } catch (err) {
    console.warn('[Firestore] Failed to save test session:', err);
  }
}

/**
 * Loads the user's test history (up to 30 recent sessions).
 */
export async function loadTestHistoryFromFirestore(
  uid: string
): Promise<TestSessionRecord[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const sessionsRef = collection(db, 'users', uid, 'test_sessions');
    const q = query(sessionsRef, orderBy('completedAt', 'desc'), limit(30));
    const snap = await getDocs(q);
    const list: TestSessionRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as TestSessionRecord);
    });
    return list;
  } catch (err) {
    console.warn('[Firestore] Failed to load test history:', err);
    return [];
  }
}

/**
 * Toggles a user follow relationship in `follows/{followerUid_followeeUid}`
 * and updates following/follower counters.
 */
export async function toggleFollowInFirestore(
  followerUid: string,
  followeeUid: string,
  isFollowing: boolean
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const followId = `${followerUid}_${followeeUid}`;
    const followRef = doc(db, 'follows', followId);
    if (isFollowing) {
      await setDoc(followRef, {
        followerUid,
        followeeUid,
        createdAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'users', followerUid), {
        followingCount: increment(1),
      }).catch(() => {});
      await updateDoc(doc(db, 'users', followeeUid), {
        followersCount: increment(1),
      }).catch(() => {});
    } else {
      await deleteDoc(followRef);
      await updateDoc(doc(db, 'users', followerUid), {
        followingCount: increment(-1),
      }).catch(() => {});
      await updateDoc(doc(db, 'users', followeeUid), {
        followersCount: increment(-1),
      }).catch(() => {});
    }
  } catch (err) {
    console.warn('[Firestore] Failed to toggle follow:', err);
  }
}

/**
 * Subscribes to real-time updates for community comments.
 */
export function subscribeToFirestoreComments(
  onUpdate: (comments: QuestionComment[]) => void
): () => void {
  if (!isFirebaseConfigured || !db) {
    return () => {};
  }
  try {
    const commentsRef = collection(db, 'comments');
    const q = query(commentsRef, orderBy('createdAt', 'desc'), limit(200));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const comments: QuestionComment[] = [];
        snapshot.forEach((docSnap) => {
          comments.push(docSnap.data() as QuestionComment);
        });
        if (comments.length > 0) {
          onUpdate(comments);
        }
      },
      (err) => {
        console.warn('[Firestore] Comments subscription error:', err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn('[Firestore] Could not attach comments listener:', err);
    return () => {};
  }
}

/**
 * Publishes a comment to Firestore (`comments/{commentId}`).
 */
export async function addCommentToFirestore(
  comment: QuestionComment
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const commentRef = doc(db, 'comments', comment.id);
    await setDoc(commentRef, {
      ...comment,
      createdAtServer: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[Firestore] Failed to add comment:', err);
  }
}

/**
 * Deletes a comment from Firestore (`comments/{commentId}`).
 */
export async function deleteCommentFromFirestore(
  commentId: string
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const commentRef = doc(db, 'comments', commentId);
    await deleteDoc(commentRef);
  } catch (err) {
    console.warn('[Firestore] Failed to delete comment:', err);
  }
}

/**
 * Updates votes (likes / dislikes) on a comment in Firestore.
 */
export async function voteCommentInFirestore(
  commentId: string,
  likesDelta: number,
  dislikesDelta: number
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const commentRef = doc(db, 'comments', commentId);
    await updateDoc(commentRef, {
      likes: increment(likesDelta),
      dislikes: increment(dislikesDelta),
    });
  } catch (err) {
    console.warn('[Firestore] Failed to update comment vote:', err);
  }
}

/**
 * Submits a content report to Firestore (`reports/{reportId}`).
 */
export async function submitReportToFirestore(
  report: ContentReport
): Promise<void> {
  if (!isFirebaseConfigured || !db) return;
  try {
    const repRef = doc(db, 'reports', report.id);
    await setDoc(repRef, {
      ...report,
      createdAtServer: serverTimestamp(),
    });
  } catch (err) {
    console.warn('[Firestore] Failed to submit report:', err);
  }
}
