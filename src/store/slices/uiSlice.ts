import { StateCreator } from 'zustand';
import { saveUserProfileToFirestore } from '@/lib/firestoreService';
import { UserProfile } from '@/core/types';
import { AppState, UISlice } from './types';

export const createUISlice: StateCreator<AppState, [], [], UISlice> = (set) => ({
  theme: 'dark',
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      const updatedUser: UserProfile = {
        ...state.user,
        settings: {
          ...state.user.settings,
          theme: next,
        },
      };
      if (state.isAuthenticated && updatedUser.uid) {
        saveUserProfileToFirestore(updatedUser, state.followedUserIds);
      }
      return { theme: next, user: updatedUser };
    }),
});
