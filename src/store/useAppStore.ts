import { create } from 'zustand';
import {
  AppState,
  createAuthSlice,
  createTestingSlice,
  createCommunitySlice,
  createUISlice,
} from './slices';

export * from './slices';

export const useAppStore = create<AppState>()((...a) => ({
  ...createUISlice(...a),
  ...createAuthSlice(...a),
  ...createTestingSlice(...a),
  ...createCommunitySlice(...a),
}));
