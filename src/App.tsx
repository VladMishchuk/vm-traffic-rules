import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Sparkles } from 'lucide-react';
import Header from '@/components/layout/Header';
import AuthPage from '@/components/auth';
import DashboardPage from '@/components/dashboard';
import KnowledgeBasePage from '@/components/knowledge-base';
import ProfilePage from '@/components/profile';
import TestPlayerPage from '@/components/testing';
import AnalyticsPage from '@/components/analytics';
import CommunityPage from '@/components/community';
import UserProfileModal from '@/components/community/UserProfileModal';
import { useAppStore } from '@/store/useAppStore';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { subscribeToFirestoreComments } from '@/lib/firestoreService';

export default function App() {
  const {
    theme,
    isAuthenticated,
    activeTest,
    syncWithFirebaseUser,
    setCommentsTable,
  } = useAppStore();

  const [isAuthReady, setIsAuthReady] = useState(!isFirebaseConfigured);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Real-time synchronization with Firebase Auth & Cloud Firestore
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setIsAuthReady(true);
      return;
    }

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          await syncWithFirebaseUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
          });
        } else {
          useAppStore.getState().logout();
        }
      } catch (err) {
        console.warn('[Auth] Sync error:', err);
      } finally {
        setIsAuthReady(true);
      }
    });

    const unsubComments = subscribeToFirestoreComments((cloudComments) => {
      if (cloudComments && cloudComments.length > 0) {
        setCommentsTable(cloudComments);
      }
    });

    return () => {
      unsubAuth();
      unsubComments();
    };
  }, [syncWithFirebaseUser, setCommentsTable]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span>Синхронізація з хмарою Firestore...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route
            path="/test"
            element={<TestPlayerPage key={activeTest?.id || 'none'} />}
          />
          <Route path="/knowledge" element={<KnowledgeBasePage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/auth" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <UserProfileModal />
    </div>
  );
}
