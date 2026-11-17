import {
  saveUserProfileToFirestore,
  loadUserProfileFromFirestore,
  saveRuleMasteryToFirestore,
  batchSaveRuleMasteryToFirestore,
  loadUserRuleMasteryFromFirestore,
  saveTestSessionToFirestore,
  loadTestHistoryFromFirestore,
} from '@/lib/firestoreService';

export const userMasteryRepository = {
  saveProfile: saveUserProfileToFirestore,
  loadProfile: loadUserProfileFromFirestore,
  saveRuleMastery: saveRuleMasteryToFirestore,
  batchSaveRuleMastery: batchSaveRuleMasteryToFirestore,
  loadRuleMastery: loadUserRuleMasteryFromFirestore,
  saveTestSession: saveTestSessionToFirestore,
  loadTestHistory: loadTestHistoryFromFirestore,
};
