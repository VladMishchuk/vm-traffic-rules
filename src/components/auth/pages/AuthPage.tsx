import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { useAppStore } from '@/store/useAppStore';
import { DriverCategoryCode } from '@/core/types';
import AuthBanner from '../components/AuthBanner';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import ResetPasswordForm from '../components/ResetPasswordForm';
import GoogleSignInButton from '../components/GoogleSignInButton';

export default function AuthPage() {
  const navigate = useNavigate();
  const { loginWithEmail, registerUser, loginWithGoogle } = useAppStore();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCats, setSelectedCats] = useState<DriverCategoryCode[]>(['B']);
  const [loading, setLoading] = useState(false);

  const toggleCat = (cat: DriverCategoryCode) => {
    setSelectedCats((prev) =>
      prev.includes(cat)
        ? prev.length > 1
          ? prev.filter((c) => c !== cat)
          : prev
        : [...prev, cat]
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Заповніть поле електронної пошти');
      return;
    }

    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await sendPasswordResetEmail(auth, email.trim());
      }
      toast.success(
        `Інструкції для відновлення пароля надіслано на ${email.trim()}`
      );
      setMode('login');
    } catch (err: any) {
      toast.error(err?.message || 'Помилка відправки листа');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Заповніть поле електронної пошти');
      return;
    }

    if (!password || password.length < 6) {
      toast.error('Пароль має містити щонайменше 6 символів');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        if (isFirebaseConfigured && auth) {
          const cred = await signInWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
          loginWithEmail(
            cred.user.email || email.trim(),
            cred.user.displayName || undefined,
            cred.user.uid
          );
        } else {
          loginWithEmail(email.trim());
        }
        toast.success('Вітаємо в системі ПДР України AI!');
        navigate('/');
      } else {
        if (!displayName.trim()) {
          toast.error("Вкажіть ваше ім'я або нікнейм");
          setLoading(false);
          return;
        }
        let createdUid: string | undefined = undefined;
        if (isFirebaseConfigured && auth) {
          const cred = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
          );
          await updateProfile(cred.user, { displayName: displayName.trim() });
          createdUid = cred.user.uid;
        }
        registerUser(email.trim(), displayName.trim(), selectedCats, createdUid);
        toast.success(
          `Реєстрація успішна! Обрано категорії: ${selectedCats.join(', ')}`
        );
        navigate('/');
      }
    } catch (err: any) {
      toast.error(
        err?.message || 'Помилка авторизації. Перевірте введені дані.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        const res = await signInWithPopup(auth, googleProvider);
        loginWithGoogle(
          res.user.email || 'user@gmail.com',
          res.user.displayName || 'Користувач Google',
          res.user.photoURL || undefined,
          res.user.uid
        );
      } else {
        loginWithGoogle('student@pdr.ua', 'Учень ПДР');
      }
      toast.success('Успішний вхід через обліковий запис Google!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.message || 'Не вдалося увійти через Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl">
        <AuthBanner />

        {/* Right Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          {mode !== 'reset' ? (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Увійти
              </button>
              <button
                type="button"
                onClick={() => setMode('register')}
                className={`py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Зареєструватися
              </button>
            </div>
          ) : null}

          {mode === 'reset' ? (
            <ResetPasswordForm
              email={email}
              setEmail={setEmail}
              loading={loading}
              onSubmit={handleResetPassword}
              onBackToLogin={() => setMode('login')}
            />
          ) : mode === 'login' ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              onSubmit={handleAuthSubmit}
              onForgotPassword={() => setMode('reset')}
            />
          ) : (
            <RegisterForm
              displayName={displayName}
              setDisplayName={setDisplayName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              selectedCats={selectedCats}
              toggleCat={toggleCat}
              loading={loading}
              onSubmit={handleAuthSubmit}
            />
          )}

          {mode !== 'reset' && (
            <GoogleSignInButton
              loading={loading}
              onSignIn={handleGoogleSignIn}
            />
          )}
        </div>
      </div>
    </div>
  );
}
